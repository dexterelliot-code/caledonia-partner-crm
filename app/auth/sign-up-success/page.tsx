import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>Confirm your account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {
              "We've sent a confirmation link to your email. Click it to verify your account, then sign in to start using the CRM."
            }
          </p>
          <Button render={<Link href="/auth/login" />} className="w-full">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
