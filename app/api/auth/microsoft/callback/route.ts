import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { exchangeCode, graphRequest } from "@/lib/microsoft/graph"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const error = url.searchParams.get("error_description") || url.searchParams.get("error")
  if (error) return NextResponse.redirect(new URL(`/settings?microsoft=error&message=${encodeURIComponent(error)}`, request.url))

  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieStore = await cookies()
  const expectedState = cookieStore.get("microsoft_oauth_state")?.value
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/settings?microsoft=error&message=Invalid+OAuth+state", request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL("/auth/login", request.url))

  try {
    const tokens = await exchangeCode(code, url.origin)
    if (!tokens.refresh_token) throw new Error("Microsoft did not return a refresh token. Reconnect and approve access.")
    const profile = await graphRequest(tokens.access_token, "/me?$select=mail,userPrincipalName,displayName") as {
      mail?: string
      userPrincipalName?: string
      displayName?: string
    }
    const { error: upsertError } = await supabase.from("microsoft_connections").upsert({
      user_id: user.id,
      microsoft_email: profile.mail || profile.userPrincipalName || null,
      microsoft_display_name: profile.displayName || null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      scope: tokens.scope || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    if (upsertError) throw new Error(upsertError.message)

    const response = NextResponse.redirect(new URL("/settings?microsoft=connected", request.url))
    response.cookies.delete("microsoft_oauth_state")
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : "Microsoft connection failed"
    return NextResponse.redirect(new URL(`/settings?microsoft=error&message=${encodeURIComponent(message)}`, request.url))
  }
}
