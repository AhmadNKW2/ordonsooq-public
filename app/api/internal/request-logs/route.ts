import { NextRequest, NextResponse } from "next/server";

import {
  API_REQUEST_LOG_INGEST_HEADER_NAME,
  API_REQUEST_LOG_INGEST_HEADER_VALUE,
  isApiRequestLoggingEnabled,
  type ApiLogEntry,
} from "@/lib/api-request-log";
import { resetApiLogEntriesFile, writeApiLogEntryToFile } from "@/lib/api-request-log-server";

export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
  if (request.headers.get(API_REQUEST_LOG_INGEST_HEADER_NAME) !== API_REQUEST_LOG_INGEST_HEADER_VALUE) {
    return new NextResponse(null, { status: 204 });
  }

  if (!isApiRequestLoggingEnabled()) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const payload = await request.json();

    if (isApiLogResetPayload(payload)) {
      await resetApiLogEntriesFile();
      return new NextResponse(null, { status: 204 });
    }

    if (!isApiLogEntry(payload)) {
      return NextResponse.json({ message: "Invalid API log payload." }, { status: 400 });
    }

    await writeApiLogEntryToFile(payload);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to write API log entry.";
    return NextResponse.json({ message }, { status: 500 });
  }
}