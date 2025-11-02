import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
};

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link href={action.href} className="btn-primary self-start md:self-auto">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
