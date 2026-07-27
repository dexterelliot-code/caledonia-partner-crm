import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {params?.error
              ? `Error: ${params.error}`
              : "We couldn't complete that request. Please try signing in again."}
          </p>
          <Button render={<Link href="/auth/login" />} className="w-full">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
