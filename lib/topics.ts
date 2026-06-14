export type TopicSeed = {
  name: string;
  slug: string;
  subject: "Physics";
  description: string;
  order: number;
};

export const physicsTopics: TopicSeed[] = [
  {
    name: "Newton's First Law",
    slug: "newtons-first-law",
    subject: "Physics",
    description: "Balanced forces, inertia, rest, and constant velocity.",
    order: 1,
  },
  {
    name: "Newton's Second Law",
    slug: "newtons-second-law",
    subject: "Physics",
    description: "How net force, mass, and acceleration connect through F = ma.",
    order: 2,
  },
  {
    name: "Newton's Third Law",
    slug: "newtons-third-law",
    subject: "Physics",
    description: "Action-reaction force pairs between interacting objects.",
    order: 3,
  },
  {
    name: "Free Body Diagrams",
    slug: "free-body-diagrams",
    subject: "Physics",
    description: "Representing all external forces acting on an object.",
    order: 4,
  },
  {
    name: "Friction",
    slug: "friction",
    subject: "Physics",
    description: "Static and kinetic friction, direction, and surface interactions.",
    order: 5,
  },
  {
    name: "Gravity and Weight",
    slug: "gravity-and-weight",
    subject: "Physics",
    description: "Mass, weight, gravitational field strength, and normal force.",
    order: 6,
  },
  {
    name: "Work and Energy",
    slug: "work-and-energy",
    subject: "Physics",
    description: "Work, kinetic energy, potential energy, and energy transfer.",
    order: 7,
  },
  {
    name: "Momentum",
    slug: "momentum",
    subject: "Physics",
    description: "Momentum, impulse, and conservation in collisions.",
    order: 8,
  },
];

export function topicNameFromSlug(slug: string): string {
  return physicsTopics.find((topic) => topic.slug === slug)?.name ?? slug;
}
