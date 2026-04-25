import { NextRequest, NextResponse } from "next/server";

import { sellWithUsSchema } from "@/lib/sell-with-us";
import { writeSellWithUsSubmission } from "@/lib/sell-with-us-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedPayload = sellWithUsSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }

    await writeSellWithUsSubmission({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      source: "header-cta",
      ...parsedPayload.data,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Unable to submit sell with us request." },
      { status: 500 },
    );
  }
}