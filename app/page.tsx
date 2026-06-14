import Link from "next/link";
import { ArrowRight, BrainCircuit, MessageSquareText, Target, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const values = [
  {
    title: "Socratic Guidance",
    description: "Aether asks one careful question at a time so students learn how to reason through Physics.",
    icon: MessageSquareText,
  },
  {
    title: "Personalized Practice",
    description: "Practice adapts to weak topics, mastery estimates, and recent mistakes.",
    icon: Target,
  },
  {
    title: "Misconception Detection",
    description: "Common traps are surfaced gently, then tested with guided prompts.",
    icon: TriangleAlert,
  },
];

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
            <BrainCircuit className="h-4 w-4" aria-hidden="true" />
            Deep understanding, not just answers.
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Learn Physics by reasoning, not memorizing.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Aether is an AI tutor that guides you through STEM problems step by step without simply giving away the answer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/assessment">
                Start Learning
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/tutor">View Demo</Link>
            </Button>
          </div>
        </div>

        <Card className="bg-white p-4">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-sm font-semibold">Aether Tutor</p>
                <p className="text-xs text-slate-300">Newton&apos;s Second Law · Guided Reasoning</p>
              </div>
              <span className="rounded-full bg-teal-400 px-2 py-1 text-xs font-semibold text-slate-950">Live</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="max-w-[88%] rounded-lg bg-white/10 p-3 text-sm leading-6">
                A 2 kg cart accelerates at 3 m/s². Before calculating, what equation connects net force, mass, and acceleration?
              </div>
              <div className="ml-auto max-w-[78%] rounded-lg bg-teal-500 p-3 text-sm text-slate-950">
                F = ma, so force depends on mass and acceleration.
              </div>
              <div className="max-w-[88%] rounded-lg bg-white/10 p-3 text-sm leading-6">
                Good. Which value is mass, and which value is acceleration in this problem?
              </div>
              <div className="rounded-lg border border-amber-300/40 bg-amber-300/10 p-3 text-sm text-amber-100">
                Misconception watch: net force explains acceleration, not motion itself.
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {values.map((value) => (
            <Card key={value.title} className="p-5">
              <value.icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{value.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
