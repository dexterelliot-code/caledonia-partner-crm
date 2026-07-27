import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { CrmGate } from "@/components/crm-gate"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CrmProvider } from "@/lib/store"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <CrmProvider>
      <SidebarProvider>
        <AppSidebar userEmail={user?.email ?? null} />
        <SidebarInset className="min-w-0">
          <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 md:hidden">
            <SidebarTrigger />
            <span className="font-heading text-sm font-semibold">
              Caledonia Technical Partners
            </span>
          </div>
          <CrmGate>{children}</CrmGate>
        </SidebarInset>
      </SidebarProvider>
    </CrmProvider>
  )
}
