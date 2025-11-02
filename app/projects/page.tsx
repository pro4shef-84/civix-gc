import { SectionHeader } from "@/components/section-header";
import { ProjectsTable } from "@/components/projects/projects-table";
import { getProjects } from "@/lib/server/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Projects"
        description="All preconstruction efforts for your organization."
        action={{ label: "Create project", href: "/projects/new" }}
      />
      <ProjectsTable projects={projects} />
    </div>
  );
}
