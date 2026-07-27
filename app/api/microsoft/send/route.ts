import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getValidConnection, graphRequest } from "@/lib/microsoft/graph"

const bodySchema = z.object({
  to: z.string().email(),
  subject: z.string().trim().min(1).max(998),
  body: z.string().trim().min(1).max(100_000),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid recipient, subject and message." }, { status: 400 })
  }

  try {
    const connection = await getValidConnection(supabase, user.id)
    if (!connection) {
      return NextResponse.json({ error: "Microsoft 365 is not connected. Connect it in Settings first." }, { status: 409 })
    }
    await graphRequest(connection.access_token, "/me/sendMail", {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: parsed.data.subject,
          body: { contentType: "Text", content: parsed.data.body },
          toRecipients: [{ emailAddress: { address: parsed.data.to } }],
        },
        saveToSentItems: true,
      }),
    })
    return NextResponse.json({ ok: true, sender: connection.microsoft_email })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send email through Microsoft 365"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
