import { NextResponse } from "next/server";
import { addActiveUser, removeActiveUser, getActiveUserCount, getActivePages } from "@/lib/activeUsersStore";

export async function POST(req: Request) {
  const { sessionId, pathname, action } = await req.json();
  
  if (action === 'remove') {
    removeActiveUser(sessionId);
  } else {
    addActiveUser(sessionId, pathname);
  }
  
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const activeUsers = getActiveUserCount(30000); // 30 segundos de timeout
  const activePages = getActivePages();
  return NextResponse.json({ activeUsers, activePages });
}