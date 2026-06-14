import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
      <nav className="space-y-2 text-sm font-medium text-slate-600" aria-label="Workspace">
        <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950" href="/dashboard">
          Dashboard
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950" href="/tutor">
          Tutor
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950" href="/history">
          History
        </Link>
      </nav>
    </aside>
  );
}
