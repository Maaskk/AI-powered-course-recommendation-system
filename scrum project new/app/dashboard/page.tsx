import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  // Check if user has completed onboarding (has major and year set)
  if (!user.onboarded && (!user.major || !user.year)) {
    redirect("/onboarding")
  }

  return <DashboardClient user={user} />
}
