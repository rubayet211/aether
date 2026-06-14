import { physicsTopics } from "@/lib/topics";

export type StudentLevel = "beginner" | "intermediate" | "advanced";

export type DiagnosticQuestion = {
  id: string;
  prompt: string;
  topicSlug: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
};

export type DiagnosticAnswer = {
  questionId: string;
  selectedOptionId: string;
  reasoning: string;
};

export type AssessmentResult = {
  score: number;
  level: StudentLevel;
  weakAreas: string[];
  recommendedTopic: { slug: string; name: string };
  masteryByTopic: Record<string, number>;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "balanced-rest",
    topicSlug: "newtons-first-law",
    prompt: "A book rests on a table. Which statement best describes the forces on it?",
    correctOptionId: "balanced",
    options: [
      { id: "balanced", label: "Gravity and the table's normal force balance." },
      { id: "none", label: "No forces act because the book is not moving." },
      { id: "gravity-only", label: "Only gravity acts downward." },
      { id: "more-up", label: "The upward force is larger than gravity." },
    ],
  },
  {
    id: "constant-velocity",
    topicSlug: "newtons-first-law",
    prompt: "A puck slides in a straight line at constant velocity. What is its net force?",
    correctOptionId: "zero",
    options: [
      { id: "forward", label: "A forward net force keeps it moving." },
      { id: "zero", label: "The net force is zero." },
      { id: "backward", label: "A backward net force balances motion." },
      { id: "depends-speed", label: "The net force depends only on speed." },
    ],
  },
  {
    id: "force-mass-acceleration",
    topicSlug: "newtons-second-law",
    prompt: "Two carts have the same net force. Cart A has less mass. What happens?",
    correctOptionId: "more-acceleration",
    options: [
      { id: "less-acceleration", label: "Cart A accelerates less." },
      { id: "more-acceleration", label: "Cart A accelerates more." },
      { id: "same-acceleration", label: "Both accelerate the same." },
      { id: "no-motion", label: "Cart A cannot accelerate." },
    ],
  },
  {
    id: "third-law",
    topicSlug: "newtons-third-law",
    prompt: "A skateboarder pushes on a wall and rolls backward. What is the reaction force?",
    correctOptionId: "wall-on-skater",
    options: [
      { id: "wall-on-skater", label: "The wall pushes on the skateboarder." },
      { id: "ground-on-wall", label: "The ground pushes on the wall." },
      { id: "skater-weight", label: "The skateboarder's weight increases." },
      { id: "friction-only", label: "Only friction acts backward." },
    ],
  },
  {
    id: "fbd-incline",
    topicSlug: "free-body-diagrams",
    prompt: "A box slides down a rough ramp. Which force should appear in its free body diagram?",
    correctOptionId: "friction-up-ramp",
    options: [
      { id: "motion-force", label: "A force in the direction of motion." },
      { id: "friction-up-ramp", label: "Friction up the ramp." },
      { id: "normal-down", label: "Normal force down into the ramp." },
      { id: "mass-force", label: "Mass as a force." },
    ],
  },
  {
    id: "weight-mass",
    topicSlug: "gravity-and-weight",
    prompt: "What changes if an astronaut goes from Earth to the Moon?",
    correctOptionId: "weight-changes",
    options: [
      { id: "mass-changes", label: "Mass changes, weight stays the same." },
      { id: "weight-changes", label: "Weight changes, mass stays the same." },
      { id: "both-same", label: "Both mass and weight stay the same." },
      { id: "both-zero", label: "Both mass and weight become zero." },
    ],
  },
  {
    id: "work-energy",
    topicSlug: "work-and-energy",
    prompt: "When does a constant force do positive work on an object?",
    correctOptionId: "same-direction",
    options: [
      { id: "any-force", label: "Whenever any force acts." },
      { id: "same-direction", label: "When the force has a component along displacement." },
      { id: "no-motion", label: "When the object does not move." },
      { id: "perpendicular", label: "When force is perpendicular to displacement." },
    ],
  },
];

function reasoningBonus(reasoning: string): number {
  const text = reasoning.trim().toLowerCase();
  if (text.length < 12 || text.includes("guess")) return 0;
  const keywords = ["force", "net", "mass", "acceleration", "balance", "direction", "energy", "work"];
  return keywords.some((keyword) => text.includes(keyword)) ? 2 : 1;
}

export function calculateAssessmentResult(answers: DiagnosticAnswer[]): AssessmentResult {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const topicScores = new Map<string, { earned: number; possible: number }>();
  let earned = 0;
  let possible = 0;

  for (const question of diagnosticQuestions) {
    const answer = byId.get(question.id);
    const correct = answer?.selectedOptionId === question.correctOptionId;
    const points = (correct ? 8 : 0) + (answer ? reasoningBonus(answer.reasoning) : 0);
    earned += points;
    possible += 10;

    const current = topicScores.get(question.topicSlug) ?? { earned: 0, possible: 0 };
    current.earned += points;
    current.possible += 10;
    topicScores.set(question.topicSlug, current);
  }

  const score = Math.round((earned / possible) * 100);
  const level: StudentLevel = score <= 40 ? "beginner" : score <= 75 ? "intermediate" : "advanced";
  const masteryByTopic: Record<string, number> = {};

  for (const topic of physicsTopics) {
    const topicScore = topicScores.get(topic.slug);
    masteryByTopic[topic.slug] = topicScore
      ? Math.round((topicScore.earned / topicScore.possible) * 100)
      : topic.order <= 6
        ? 30
        : 25;
  }

  const assessedSlugs = new Set(diagnosticQuestions.map((question) => question.topicSlug));
  const weakTopics = physicsTopics.filter(
    (topic) => assessedSlugs.has(topic.slug) && masteryByTopic[topic.slug] < 55,
  );
  const recommendedTopic = weakTopics[0] ?? physicsTopics[0];

  return {
    score,
    level,
    weakAreas: weakTopics.map((topic) => topic.name),
    recommendedTopic: { slug: recommendedTopic.slug, name: recommendedTopic.name },
    masteryByTopic,
  };
}
