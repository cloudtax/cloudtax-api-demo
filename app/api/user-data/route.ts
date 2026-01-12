import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserWithPersonalInfo, verifySession } from "@/app/lib/dal";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    
    console.log("API user-data: session cookie exists:", !!sessionCookie?.value);
    
    const session = await verifySession();
    console.log("API user-data: session verified:", session);
    
    if (!session.isAuth) {
      console.log("API user-data: not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const data = await getUserWithPersonalInfo();
    console.log("API user-data: data fetched:", data);
    
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
