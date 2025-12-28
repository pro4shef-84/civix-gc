import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '../lib/prisma';
import { authOptions } from '../lib/auth';
import { createProject } from './actions';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const projects = await prisma.project.findMany({ include: { tradePkgs: true }, where: { owner: { email: session.user?.email! } } });
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="border p-3 rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.tradePkgs.length} trade packages</div>
              </div>
              <Link className="text-blue-700 underline" href={`/projects/${p.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Create Project</h3>
        <form action={createProject} className="space-y-3">
          <div>
            <label className="text-sm">Name</label>
            <input name="name" required />
          </div>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
}
