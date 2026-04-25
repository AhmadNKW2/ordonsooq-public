import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import type { SellWithUsSubmission } from "@/lib/sell-with-us";

const DEFAULT_SELL_WITH_US_FILE_PATH = join(
  tmpdir(),
  "ordonsooq",
  "sell-with-us-submissions.json",
);
const EMPTY_FILE_CONTENT = "[]\n";

let writeQueue = Promise.resolve();

function getSellWithUsFilePath(): string {
  return process.env.SELL_WITH_US_SUBMISSIONS_FILE_PATH?.trim() || DEFAULT_SELL_WITH_US_FILE_PATH;
}

async function queueWrite(task: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(task, task);
  await writeQueue;
}

function isSellWithUsSubmission(value: unknown): value is SellWithUsSubmission {
  if (!value || typeof value !== "object") {
    return false;
  }

  const submission = value as Partial<SellWithUsSubmission>;

  return (
    typeof submission.id === "string"
    && typeof submission.createdAt === "string"
    && submission.source === "header-cta"
    && typeof submission.fullName === "string"
    && typeof submission.phone === "string"
    && typeof submission.companyName === "string"
  );
}

function parseSellWithUsSubmissions(content: string): SellWithUsSubmission[] {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(trimmedContent);
    return Array.isArray(parsedValue) ? parsedValue.filter(isSellWithUsSubmission) : [];
  } catch {
    return [];
  }
}

export async function writeSellWithUsSubmission(entry: SellWithUsSubmission): Promise<void> {
  const filePath = getSellWithUsFilePath();

  await queueWrite(async () => {
    await mkdir(dirname(filePath), { recursive: true });

    let existingEntries: SellWithUsSubmission[] = [];

    try {
      existingEntries = parseSellWithUsSubmissions(await readFile(filePath, "utf8"));
    } catch (error) {
      const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;

      if (errorCode !== "ENOENT") {
        throw error;
      }

      await writeFile(filePath, EMPTY_FILE_CONTENT, "utf8");
    }

    existingEntries.push(entry);
    await writeFile(filePath, `${JSON.stringify(existingEntries, null, 2)}\n`, "utf8");
  });
}