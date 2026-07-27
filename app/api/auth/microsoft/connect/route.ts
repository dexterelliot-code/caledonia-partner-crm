import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { microsoftAuthoriseUrl } from "@/lib/microsoft/graph"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL("/auth/login", request.url))

  const state = randomBytes(24).toString("hex")
  const origin = new URL(request.url).origin
  const response = NextResponse.redirect(microsoftAuthoriseUrl(state, origin))
  response.cookies.set("microsoft_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  })
  return response
}
