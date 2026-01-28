import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSession, clearSessionCookie } from "@/lib/auth"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (token) {
      deleteSession(token)
    }

    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
