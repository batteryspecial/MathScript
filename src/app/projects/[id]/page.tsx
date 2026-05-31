import AppShell from "@/components/layout/AppShell"

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params

  return <AppShell id={id}/>
}
