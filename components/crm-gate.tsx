"use client"

import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { useCrm } from "@/lib/store"

export function CrmGate({ children }: { children: ReactNode }) {
  const { loading, error, reload } = useCrm()

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground">
        <Spinner className="size-6" />
        <p className="text-sm">Loading your workspace…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <div className="max-w-sm">
          <p className="font-heading text-lg font-semibold">
            Couldn&apos;t load your data
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => reload()}>Try again</Button>
      </div>
    )
  }

  return <>{children}</>
}
