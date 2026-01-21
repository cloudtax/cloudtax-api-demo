import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { taxReturns } from "@/app/db/schema";
import { verifySession } from "@/app/lib/dal";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session.isAuth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const results = await db
      .select({
        id: taxReturns.id,
        externalReturnId: taxReturns.externalReturnId,
        taxYear: taxReturns.taxYear,
        status: taxReturns.status,
        lastEventAt: taxReturns.lastEventAt,
        lastEventType: taxReturns.lastEventType,
      })
      .from(taxReturns)
      .where(eq(taxReturns.userId, session.userId))
      .orderBy(desc(taxReturns.lastEventAt));

    return NextResponse.json({ taxReturns: results });
  } catch (error) {
    console.error("Failed to fetch tax returns", error);
    return NextResponse.json({ error: "Failed to fetch tax returns" }, { status: 500 });
  }
}
