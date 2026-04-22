import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { ApiLogEntry } from "@/lib/api-request-log";

const DEFAULT_API_LOG_FILE_PATH = join(process.cwd(), "logs", "api-requests.log");
const DEFAULT_API_LOG_WITHOUT_RESPONSES_FILE_PATH = join(
  process.cwd(),
  "logs",
  "api-requests-without-responses.log"
);
const DEFAULT_API_LOG_MAX_BYTES = 5 * 1024 * 1024;
const EMPTY_API_LOG_FILE_CONTENT = "[]\n";

let writeQueue = Promise.resolve();

export function getApiLogFilePath(): string {
  return process.env.API_LOG_FILE_PATH?.trim() || DEFAULT_API_LOG_FILE_PATH;
}

export function getApiLogWithoutResponsesFilePath(): string {
  return process.env.API_LOG_WITHOUT_RESPONSES_FILE_PATH?.trim() || DEFAULT_API_LOG_WITHOUT_RESPONSES_FILE_PATH;
}

function getApiLogMaxBytes(): number {
  const rawValue = process.env.API_LOG_MAX_BYTES?.trim();

  if (!rawValue) {
    return DEFAULT_API_LOG_MAX_BYTES;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_API_LOG_MAX_BYTES;
}

async function queueWrite(task: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(task, task);
  await writeQueue;
}

async function ensureLogFileWithinLimit(filePath: string): Promise<void> {
  try {
    const fileStats = await stat(filePath);

    if (fileStats.size < getApiLogMaxBytes()) {
      return;
    }
  } catch (error) {
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;

    if (errorCode === "ENOENT") {
      return;
    }

    throw error;
  }

  await writeFile(filePath, EMPTY_API_LOG_FILE_CONTENT, "utf8");
}

function isApiLogEntry(value: unknown): value is ApiLogEntry {
  return !!value && typeof value === "object";
}

function parseApiLogEntries(content: string): ApiLogEntry[] {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(trimmedContent);

    if (Array.isArray(parsedValue)) {
      return parsedValue.filter(isApiLogEntry);
    }
  } catch {
    // Fall back to legacy NDJSON parsing below.
  }

  return trimmedContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsedValue = JSON.parse(line);
        return isApiLogEntry(parsedValue) ? [parsedValue] : [];
      } catch {
        return [];
      }
    });
}

function stringifyApiLogEntries(entries: ApiLogEntry[]): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}

function createApiLogEntryWithoutResponse(entry: ApiLogEntry): ApiLogEntry {
  const { response: _response, ...entryWithoutResponse } = entry;
  return entryWithoutResponse;
}

async function appendApiLogEntryToFile(filePath: string, entry: ApiLogEntry): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await ensureLogFileWithinLimit(filePath);

  let existingEntries: ApiLogEntry[] = [];

  try {
    existingEntries = parseApiLogEntries(await readFile(filePath, "utf8"));
  } catch (error) {
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;

    if (errorCode !== "ENOENT") {
      throw error;
    }
  }

  existingEntries.push(entry);
  await writeFile(filePath, stringifyApiLogEntries(existingEntries), "utf8");
}

async function resetApiLogFile(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, EMPTY_API_LOG_FILE_CONTENT, "utf8");
}

export async function writeApiLogEntryToFile(entry: ApiLogEntry): Promise<void> {
  const fileTargets = [
    { filePath: getApiLogFilePath(), entry },
    { filePath: getApiLogWithoutResponsesFilePath(), entry: createApiLogEntryWithoutResponse(entry) },
  ];

  await queueWrite(async () => {
    for (const target of fileTargets) {
      await appendApiLogEntryToFile(target.filePath, target.entry);
    }
  });
}

export async function resetApiLogEntriesFile(): Promise<void> {
  const filePaths = [getApiLogFilePath(), getApiLogWithoutResponsesFilePath()];

  await queueWrite(async () => {
    for (const filePath of filePaths) {
      await resetApiLogFile(filePath);
    }
  });
}