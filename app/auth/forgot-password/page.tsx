"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetRequest = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const supabase = createClient()

      const callbackUrl = new URL("/auth/callback", window.location.origin)
      callbackUrl.searchParams.set("next", "/auth/update-password")

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: callbackUrl.toString(),
        })

      if (resetError) throw resetError

      setMessage(
        "If an account exists for that email address, a reset link has been sent.",
      )
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send the reset email. Please try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleResetRequest}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {message && (
                <p className="text-sm text-emerald-600" role="status">
                  {message}
                </p>
              )}

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner data-icon="inline-start" />}
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
