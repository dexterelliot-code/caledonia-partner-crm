import type { ReactNode } from "react"
import { Compass } from "lucide-react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 bg-background p-6 md:p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Compass className="size-6" />
        </div>
        <div>
          <p className="font-heading text-lg font-semibold leading-tight text-foreground">
            Caledonia Technical Partners
          </p>
          <p className="text-sm text-muted-foreground">
            Manufacturer Representation CRM
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}
