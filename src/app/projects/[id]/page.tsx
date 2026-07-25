import { notFound } from "next/navigation"
import { getProject } from "@mathscript/postgres"

import AppShell from "@/components/layout/AppShell"
import { toInitialWorkspace } from "@/lib/db/hydrate"

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic"

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params

  const project = await getProject(id)
  if (!project) notFound()

  return <AppShell initial={toInitialWorkspace(project)} />
}
