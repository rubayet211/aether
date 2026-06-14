import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-950 text-white">
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          </span>
          Aether
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex" aria-label="Main navigation">
          <Link href="/dashboard" className="hover:text-slate-950">
            Dashboard
          </Link>
          <Link href="/tutor" className="hover:text-slate-950">
            Tutor
          </Link>
          <Link href="/history" className="hover:text-slate-950">
            History
          </Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/assessment">Start Learning</Link>
        </Button>
      </div>
    </header>
  );
}
