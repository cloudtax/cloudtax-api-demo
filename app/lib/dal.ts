import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, SessionPayload } from "./session";
import { db } from "@/app/db";
import { users, personalInfo } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export const verifySession = cache(
  async (): Promise<{ isAuth: true; userId: number } | { isAuth: false }> => {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const payload = await decrypt(session);

    if (!payload?.userId) {
      return { isAuth: false };
    }

    return { isAuth: true, userId: payload.userId };
  }
);

export const getSessionUser = cache(
  async (): Promise<SessionPayload | null> => {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    return decrypt(session);
  }
);

export const requireAuth = cache(async (): Promise<SessionPayload> => {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  return session;
});

export const getUser = cache(async () => {
  const session = await verifySession();

  if (!session.isAuth) {
    return null;
  }

  try {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.log("Failed to fetch user", error);
    return null;
  }
});

export const getUserPersonalInfo = cache(async () => {
  const session = await verifySession();

  if (!session.isAuth) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(personalInfo)
      .where(eq(personalInfo.userId, session.userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.log("Failed to fetch personal info", error);
    return null;
  }
});

export const getUserWithPersonalInfo = cache(async () => {
  const session = await verifySession();

  if (!session.isAuth) {
    return null;
  }

  try {
    const userResult = await db
      .select({
        id: users.id,
        userId: users.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const user = userResult[0];
    if (!user) return null;

    const infoResult = await db
      .select()
      .from(personalInfo)
      .where(eq(personalInfo.userId, session.userId))
      .limit(1);

    return {
      user,
      personalInfo: infoResult[0] || null,
    };
  } catch (error) {
    console.log("Failed to fetch user with personal info", error);
    return null;
  }
});
