import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/app/db";
import { users, taxReturns } from "@/app/db/schema";
import { eq } from "drizzle-orm";

type WebhookEvent =
  | {
      type: "t1_return.created";
      id: string;
      created: number;
      user: {
        external_id: string;
        id: string;
        email: string;
      };
      t1_return: {
        id: string;
        year: number;
      };
    }
  | {
      type: "t1_return.status_changed";
      id: string;
      created: number;
      user: {
        external_id: string;
        id: string;
        email: string;
      };
      t1_return: {
        id: string;
        year: number;
        old_status: string | null;
        new_status: string;
      };
    }
  | {
      type: "webhook.test";
      id: string;
      created: number;
    };

function toIso(timestampSeconds: number) {
  return new Date(timestampSeconds * 1000).toISOString();
}

function verifySignature(
  rawBody: string,
  providedSignature: string,
  secret: string,
) {
  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const provided = Buffer.from(providedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}

async function upsertTaxReturn(event: WebhookEvent, userId: number) {
  const isStatusChange = event.type === "t1_return.status_changed";
  const status = isStatusChange ? event.t1_return.new_status : "created";

  if ("t1_return" in event) {
    const existing = await db
      .select()
      .from(taxReturns)
      .where(eq(taxReturns.externalReturnId, event.t1_return.id))
      .limit(1);

    const baseFields = {
      userId,
      externalReturnId: event.t1_return.id,
      taxYear: event.t1_return.year,
      status,
      lastEventType: event.type,
      lastEventId: event.id,
      lastEventAt: toIso(event.created),
      payload: event as unknown as Record<string, unknown>,
      updatedAt: new Date().toISOString(),
    };

    if (existing[0]) {
      await db
        .update(taxReturns)
        .set(baseFields)
        .where(eq(taxReturns.externalReturnId, event.t1_return.id));
    } else {
      await db.insert(taxReturns).values(baseFields);
    }
  }
}

export async function POST(request: Request) {
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientSecret) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const signatureHeader = request.headers.get("x-signature");
  const rawBody = await request.text();

  if (!signatureHeader || !rawBody) {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 },
    );
  }

  const signatureValid = verifySignature(
    rawBody,
    signatureHeader,
    clientSecret,
  );

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const event = parsed as WebhookEvent;

  // Handle test webhook
  if (event.type === "webhook.test") {
    return NextResponse.json({ received: true });
  }

  // Handle only supported tax return events
  if (
    event.type !== "t1_return.created" &&
    event.type !== "t1_return.status_changed"
  ) {
    // Acknowledge unknown events but don't process them
    return NextResponse.json({ received: true });
  }

  try {
    const matchedUser = await db.query.users.findFirst({
      where: eq(users.userId, event.user.external_id),
      columns: { id: true },
    });

    if (!matchedUser) {
      return NextResponse.json(
        { message: "User not found; event skipped" },
        { status: 200 },
      );
    }

    await upsertTaxReturn(event, matchedUser.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
