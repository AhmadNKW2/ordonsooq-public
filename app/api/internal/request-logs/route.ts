import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { NextRequest, NextResponse } from "next/server";

import {
  isApiRequestLoggingEnabled,
  stringifyApiLogEntries,
  type ApiLogEntry,
} from "@/lib/api-request-log";

export const runtime = "nodejs";

const DEFAULT_API_LOG_FILE_PATH = join(process.cwd(), "logs", "api-requests.log");
const LEGACY_LOG_SEPARATOR = "================================================================================";

let writeQueue = Promise.resolve();

function getApiLogFilePath(): string {
  return process.env.API_LOG_FILE_PATH?.trim() || DEFAULT_API_LOG_FILE_PATH;
}

function isApiLogEntry(value: unknown): value is ApiLogEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<ApiLogEntry>;

  return (
    typeof entry.timestampIso === "string" &&
    typeof entry.timestampLocal === "string" &&
    typeof entry.source === "string" &&
    typeof entry.label === "string" &&
    typeof entry.durationMs === "number" &&
    typeof entry.request?.url === "string"
  );
}

function isApiLogResetPayload(value: unknown): value is { type: "reset" } {
  return value !== null
    && typeof value === "object"
    && "type" in value
    && value.type === "reset";
}

function parseJsonValue(rawValue: string): unknown {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue || trimmedValue === "<empty>") return null;
  if (trimmedValue === "<empty string>") return "";

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return trimmedValue;
  }
}

function stripLegacyIndentation(rawValue: string): string {
  return rawValue.replace(/^  /gm, "").trim();
}

function readLineValue(block: string, prefix: string): string | undefined {
  const matchedLine = block.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.*)$`, "m"));
  return matchedLine?.[1]?.trim();
}

function findSection(block: string, marker: string, nextMarkers: string[]): string | undefined {
  const startIndex = block.indexOf(marker);

  if (startIndex < 0) {
    return undefined;
  }

  let section = block.slice(startIndex + marker.length);

  if (section.startsWith("\r\n")) {
    section = section.slice(2);
  } else if (section.startsWith("\n")) {
    section = section.slice(1);
  }

  let endIndex = section.length;

  for (const nextMarker of nextMarkers) {
    const candidateIndex = section.indexOf(`\n${nextMarker}`);

    if (candidateIndex >= 0 && candidateIndex < endIndex) {
      endIndex = candidateIndex;
    }
  }

  return section.slice(0, endIndex).trim();
}

function findValueBlock(section: string, label: string, nextLabels: string[]): string | undefined {
  const marker = `${label}:\n`;
  const startIndex = section.indexOf(marker);

  if (startIndex < 0) {
    return undefined;
  }

  let valueBlock = section.slice(startIndex + marker.length);
  let endIndex = valueBlock.length;

  for (const nextLabel of nextLabels) {
    const candidateIndex = valueBlock.indexOf(`\n\n${nextLabel}:\n`);

    if (candidateIndex >= 0 && candidateIndex < endIndex) {
      endIndex = candidateIndex;
    }
  }

  return stripLegacyIndentation(valueBlock.slice(0, endIndex));
}

function parseStatusLine(statusLine?: string): { status: number; statusText: string } | undefined {
  if (!statusLine) return undefined;

  const matchedStatus = statusLine.match(/^(\d+)(?:\s+(.*))?$/);

  if (!matchedStatus) {
    return undefined;
  }

  return {
    status: Number(matchedStatus[1]),
    statusText: matchedStatus[2]?.trim() || "",
  };
}

function parseHeaders(value?: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => typeof entryValue === "string")
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
  );
}

function parseLegacyRequest(section?: string): ApiLogEntry["request"] | undefined {
  if (!section) return undefined;

  return {
    method: readLineValue(section, "Method: ") || "GET",
    url: readLineValue(section, "URL: ") || "",
    headers: parseHeaders(parseJsonValue(findValueBlock(section, "Headers", ["Body"]) || "<empty>")),
    body: parseJsonValue(findValueBlock(section, "Body", []) || "<empty>"),
    credentials: readLineValue(section, "Credentials: ") as RequestCredentials | undefined,
    cache: readLineValue(section, "Cache: ") as RequestCache | undefined,
    mode: readLineValue(section, "Mode: ") as RequestMode | undefined,
    redirect: readLineValue(section, "Redirect: ") as RequestRedirect | undefined,
    referrer: readLineValue(section, "Referrer: "),
    integrity: readLineValue(section, "Integrity: "),
    keepalive: readLineValue(section, "Keepalive: ") === undefined
      ? undefined
      : readLineValue(section, "Keepalive: ") === "true",
  };
}

function parseLegacyResponse(section?: string): ApiLogEntry["response"] | undefined {
  if (!section) return undefined;

  const status = parseStatusLine(readLineValue(section, "Status: "));

  if (!status) {
    return undefined;
  }

  return {
    ok: readLineValue(section, "OK: ") === "true",
    status: status.status,
    statusText: status.statusText,
    headers: parseHeaders(parseJsonValue(findValueBlock(section, "Headers", ["Body"]) || "<empty>")),
    body: parseJsonValue(findValueBlock(section, "Body", []) || "<empty>"),
  };
}

function parseLegacyError(section?: string): ApiLogEntry["error"] | undefined {
  if (!section) return undefined;

  const parsedError = parseJsonValue(stripLegacyIndentation(section));

  if (parsedError && typeof parsedError === "object" && !Array.isArray(parsedError)) {
    const errorRecord = parsedError as Record<string, unknown>;
    const name = typeof errorRecord.name === "string" ? errorRecord.name : "Error";
    const message = typeof errorRecord.message === "string" ? errorRecord.message : JSON.stringify(parsedError);

    return {
      name,
      message,
      stack: typeof errorRecord.stack === "string" ? errorRecord.stack : undefined,
    };
  }

  return {
    name: "Error",
    message: typeof parsedError === "string" ? parsedError : JSON.stringify(parsedError),
  };
}

function parseLegacyNotes(section?: string): string[] | undefined {
  if (!section) return undefined;

  const notes = stripLegacyIndentation(section)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return notes.length > 0 ? notes : undefined;
}

function parseLegacyApiLogEntry(block: string): ApiLogEntry | undefined {
  const request = parseLegacyRequest(findSection(block, "[Request]", ["[Response]", "[Error]", "[Notes]"]));

  if (!request?.url) {
    return undefined;
  }

  const durationLine = readLineValue(block, "Duration: ");
  const durationMs = durationLine ? Number(durationLine.replace(/ms$/i, "").trim()) : 0;

  return {
    id: readLineValue(block, "Request ID: ") || `${Date.now()}`,
    timestampIso: readLineValue(block, "Timestamp ISO: ") || new Date(0).toISOString(),
    timestampLocal: readLineValue(block, "Timestamp Local: ") || "",
    runtime: readLineValue(block, "Runtime: ") === "client" ? "client" : "server",
    source: readLineValue(block, "Source: ") || "unknown",
    label: readLineValue(block, "Label: ") || request.url,
    durationMs: Number.isFinite(durationMs) ? durationMs : 0,
    request,
    response: parseLegacyResponse(findSection(block, "[Response]", ["[Error]", "[Notes]"])),
    error: parseLegacyError(findSection(block, "[Error]", ["[Notes]"])),
    notes: parseLegacyNotes(findSection(block, "[Notes]", [])),
  };
}

function parseLegacyApiLogEntries(content: string): ApiLogEntry[] {
  return content
    .split(LEGACY_LOG_SEPARATOR)
    .map((entryBlock) => entryBlock.trim())
    .filter(Boolean)
    .map((entryBlock) => parseLegacyApiLogEntry(entryBlock))
    .filter((entry): entry is ApiLogEntry => Boolean(entry));
}

function parseExistingLogEntries(content: string): ApiLogEntry[] {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return [];
  }

  try {
    const parsedContent = JSON.parse(trimmedContent);

    if (Array.isArray(parsedContent)) {
      return parsedContent.filter(isApiLogEntry);
    }

    if (isApiLogEntry(parsedContent)) {
      return [parsedContent];
    }
  } catch {
    return parseLegacyApiLogEntries(content);
  }

  return [];
}

async function loadApiLogEntries(filePath: string): Promise<ApiLogEntry[]> {
  try {
    const content = await readFile(filePath, "utf8");
    return parseExistingLogEntries(content);
  } catch (error) {
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;

    if (errorCode === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function queueWrite(task: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(task, task);
  await writeQueue;
}

async function writeApiLogEntry(entry: ApiLogEntry): Promise<void> {
  const filePath = getApiLogFilePath();

  await queueWrite(async () => {
    const entries = await loadApiLogEntries(filePath);
    entries.push(entry);

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, stringifyApiLogEntries(entries), "utf8");
  });
}

async function resetApiLogEntries(): Promise<void> {
  const filePath = getApiLogFilePath();

  await queueWrite(async () => {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, stringifyApiLogEntries([]), "utf8");
  });
}

export async function POST(request: NextRequest) {
  if (!isApiRequestLoggingEnabled()) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const payload = await request.json();

    if (isApiLogResetPayload(payload)) {
      await resetApiLogEntries();
      return new NextResponse(null, { status: 204 });
    }

    if (!isApiLogEntry(payload)) {
      return NextResponse.json({ message: "Invalid API log payload." }, { status: 400 });
    }

    await writeApiLogEntry(payload);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to write API log entry.";
    return NextResponse.json({ message }, { status: 500 });
  }
}