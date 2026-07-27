import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ connected: false }, { status: 401 })
  const { data, error } = await supabase
    .from("microsoft_connections")
    .select("microsoft_email,microsoft_display_name,updated_at")
    .eq("user_id", user.id)
    .maybeSingle()
  if (error) return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
  return NextResponse.json({
    connected: Boolean(data),
    email: data?.microsoft_email || null,
    displayName: data?.microsoft_display_name || null,
    updatedAt: data?.updated_at || null,
  })
}
