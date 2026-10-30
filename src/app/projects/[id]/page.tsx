import { notFound } from "next/navigation"
import { getProject } from "@mathscript/postgres"

import AppShell from "@/components/layout/AppShell"
import { toInitialWorkspace } from "@/lib/db/hydrate"
import { getSession } from "@/lib/auth/session"

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic"

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params

  const session = await getSession()
  if (!session) notFound()

  const project = await getProject(session.user.id, id)
  if (!project) notFound()

  return <AppShell initial={toInitialWorkspace(project)} />
}
