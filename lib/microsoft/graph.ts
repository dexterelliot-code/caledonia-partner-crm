import type { SupabaseClient } from "@supabase/supabase-js"

const GRAPH_BASE = "https://graph.microsoft.com/v1.0"
const SCOPES = "openid profile email offline_access User.Read Mail.Send Mail.ReadWrite"

export type MicrosoftConnection = {
  user_id: string
  microsoft_email: string | null
  access_token: string
  refresh_token: string
  expires_at: string
  scope: string | null
}

function requiredEnv(name: "AZURE_CLIENT_ID" | "AZURE_TENANT_ID" | "AZURE_CLIENT_SECRET") {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

export function microsoftRedirectUri(requestOrigin?: string): string {
  return (
    process.env.MICROSOFT_REDIRECT_URI ||
    `${requestOrigin || process.env.NEXT_PUBLIC_SITE_URL || "https://caledonia-partner-crm.vercel.app"}/api/auth/microsoft/callback`
  )
}

export function microsoftAuthoriseUrl(state: string, requestOrigin?: string): string {
  const tenant = requiredEnv("AZURE_TENANT_ID")
  const params = new URLSearchParams({
    client_id: requiredEnv("AZURE_CLIENT_ID"),
    response_type: "code",
    redirect_uri: microsoftRedirectUri(requestOrigin),
    response_mode: "query",
    scope: SCOPES,
    state,
    prompt: "select_account",
  })
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`
}

async function tokenRequest(params: URLSearchParams) {
  const tenant = requiredEnv("AZURE_TENANT_ID")
  const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Microsoft token request failed")
  }
  return payload as {
    access_token: string
    refresh_token?: string
    expires_in: number
    scope?: string
  }
}

export async function exchangeCode(code: string, requestOrigin?: string) {
  return tokenRequest(
    new URLSearchParams({
      client_id: requiredEnv("AZURE_CLIENT_ID"),
      client_secret: requiredEnv("AZURE_CLIENT_SECRET"),
      grant_type: "authorization_code",
      code,
      redirect_uri: microsoftRedirectUri(requestOrigin),
      scope: SCOPES,
    }),
  )
}

async function refreshConnection(supabase: SupabaseClient, connection: MicrosoftConnection) {
  const tokens = await tokenRequest(
    new URLSearchParams({
      client_id: requiredEnv("AZURE_CLIENT_ID"),
      client_secret: requiredEnv("AZURE_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: connection.refresh_token,
      scope: SCOPES,
    }),
  )
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  const updated = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || connection.refresh_token,
    expires_at: expiresAt,
    scope: tokens.scope || connection.scope,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase
    .from("microsoft_connections")
    .update(updated)
    .eq("user_id", connection.user_id)
  if (error) throw new Error(error.message)
  return { ...connection, ...updated }
}

export async function getValidConnection(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("microsoft_connections")
    .select("user_id,microsoft_email,access_token,refresh_token,expires_at,scope")
    .eq("user_id", userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const connection = data as MicrosoftConnection
  const expiresSoon = new Date(connection.expires_at).getTime() <= Date.now() + 60_000
  return expiresSoon ? refreshConnection(supabase, connection) : connection
}

export async function graphRequest(accessToken: string, path: string, init?: RequestInit) {
  const response = await fetch(`${GRAPH_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Microsoft Graph request failed (${response.status})`)
  }
  return payload
}
