import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { createTradePackage } from '../../actions';

interface Props {
  params: { id: string };
}

export default async function ProjectPage({ params }: Props) {
  const project = await prisma.project.findUnique({ where: { id: params.id }, include: { tradePkgs: true } });
  if (!project) return notFound();
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{project.name} - Trade Packages</h2>
        <ul className="space-y-2">
          {project.tradePkgs.map((pkg) => (
            <li key={pkg.id} className="border p-3 rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{pkg.name}</div>
                <div className="text-sm text-gray-600">{pkg.csiDivision}</div>
              </div>
              <Link className="text-blue-700 underline" href={`/trade-packages/${pkg.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Create Trade Package</h3>
        <form action={createTradePackage} className="space-y-3">
          <input type="hidden" name="projectId" value={project.id} />
          <div>
            <label className="text-sm">Name</label>
            <input name="name" required />
          </div>
          <div>
            <label className="text-sm">CSI Division</label>
            <input name="csiDivision" />
          </div>
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
}
