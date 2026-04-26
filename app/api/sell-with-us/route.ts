import { NextRequest, NextResponse } from "next/server";

import { sellWithUsSchema } from "@/lib/sell-with-us";
import {
  SellWithUsSubmissionError,
  submitSellWithUsSubmission,
} from "@/lib/sell-with-us-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedPayload = sellWithUsSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }

    await submitSellWithUsSubmission(parsedPayload.data, {
      authorization: request.headers.get("authorization"),
      cookie: request.headers.get("cookie"),
      signal: request.signal,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof SellWithUsSubmissionError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status >= 400 && error.status < 600 ? error.status : 500 },
      );
    }

    return NextResponse.json(
      { message: "Unable to submit sell with us request." },
      { status: 500 },
    );
  }
}