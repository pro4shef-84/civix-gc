import { getProjects } from "@/lib/server/projects";
import { SectionHeader } from "@/components/section-header";
import { ProjectsTable } from "@/components/projects/projects-table";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Active Projects"
        description="Monitor bid progress and jump back into trade scopes that need attention."
        action={{ label: "New Project", href: "/projects/new" }}
      />
      <ProjectsTable projects={projects} />
    </div>
  );
}
