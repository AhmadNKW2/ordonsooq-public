import type { SellWithUsFormData } from "@/lib/sell-with-us";

const DEFAULT_ERROR_MESSAGE = "Unable to submit sell with us request.";

type SubmitSellWithUsOptions = {
  authorization?: string | null;
  cookie?: string | null;
  signal?: AbortSignal;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getPartnersEndpoint(): string {
  const explicitUrl = process.env.SELL_WITH_US_PARTNERS_API_URL?.trim();

  if (explicitUrl) {
    return trimTrailingSlash(explicitUrl);
  }

  const apiBaseUrl = process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiBaseUrl) {
    throw new SellWithUsSubmissionError(
      "Sell with us partner API is not configured.",
      500,
    );
  }

  return `${trimTrailingSlash(apiBaseUrl)}/partners`;
}

function getServerAuthorizationHeader(): string | null {
  const token = process.env.SELL_WITH_US_PARTNERS_API_TOKEN?.trim();
  return token ? `Bearer ${token}` : null;
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (Array.isArray(payload)) {
    const message = payload
      .map((entry) => extractErrorMessage(entry))
      .find((entry): entry is string => Boolean(entry));

    return message ?? null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (record.message) {
    return extractErrorMessage(record.message);
  }

  if (record.error) {
    return extractErrorMessage(record.error);
  }

  return null;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const rawBody = await response.text().catch(() => "");

  if (!rawBody.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

export class SellWithUsSubmissionError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SellWithUsSubmissionError";
    this.status = status;
  }
}

export async function submitSellWithUsSubmission(
  values: SellWithUsFormData,
  options: SubmitSellWithUsOptions = {},
): Promise<void> {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const authorizationHeader = getServerAuthorizationHeader() || options.authorization?.trim() || null;
  const cookieHeader = options.cookie?.trim() || null;

  if (authorizationHeader) {
    headers.set("Authorization", authorizationHeader);
  }

  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const response = await fetch(getPartnersEndpoint(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      full_name: values.fullName,
      company_name: values.companyName,
      phone_number: values.phone,
    }),
    cache: "no-store",
    signal: options.signal,
  });

  if (response.ok) {
    return;
  }

  const payload = await parseResponsePayload(response);
  const message = extractErrorMessage(payload) || DEFAULT_ERROR_MESSAGE;

  throw new SellWithUsSubmissionError(message, response.status);
}