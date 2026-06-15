import type { GeneratedProblem, SessionSummary, TutorResponse } from "@/lib/ai/schemas";

export const aiUnavailableMessage =
  "Aether cannot reach Ollama Cloud. Check OLLAMA_API_KEY, OLLAMA_BASE_URL, and OLLAMA_MODEL.";

export function demoTutorResponse(
  userMessage: string,
  action: "message" | "hint" | "explain" | "practice" = "message",
): TutorResponse {
  const lower = userMessage.toLowerCase();
  const misconception = lower.includes("moving means force") ||
    lower.includes("force keeps") ||
    lower.includes("force keeping") ||
    lower.includes("must be a force")
    ? ["Motion does not require a continuing net force; acceleration does."]
    : [];

  const reasoningQuality: TutorResponse["reasoningQuality"] =
    lower.includes("because") || lower.includes("net force") ? "strong" : "partial";

  // The action drives the *kind* of reply so Hint / Explain / Practice are
  // visibly different from a normal reasoning turn (and testable in demo mode).
  if (action === "hint") {
    return {
      message:
        "Hint: start by drawing the free body diagram and writing the net force. Then connect it to acceleration with F = ma.",
      detectedMisconceptions: misconception,
      suggestedNextAction: "answer_next_question",
      reasoningQuality,
      misconceptionPersisted: false,
    };
  }

  if (action === "explain") {
    return {
      message:
        "Here's the idea: a net force changes an object's motion, and F = ma ties them together. For example, a heavier cart needs more force for the same acceleration. Does that match what you expected?",
      detectedMisconceptions: misconception,
      suggestedNextAction: "answer_next_question",
      reasoningQuality,
      misconceptionPersisted: false,
    };
  }

  if (action === "practice") {
    return {
      message: "Great idea. Use the Generate Practice button and I'll create problems tuned to this topic.",
      detectedMisconceptions: misconception,
      suggestedNextAction: "generate_practice",
      reasoningQuality,
      misconceptionPersisted: false,
    };
  }

  return {
    message:
      misconception.length > 0
        ? "That is a common thought. Let's test it: if an object moves at constant velocity, is its velocity changing?"
        : "Good start. Before we calculate anything, what forces would you include on the free body diagram?",
    detectedMisconceptions: misconception,
    suggestedNextAction: misconception.length > 0 ? "try_hint" : "answer_next_question",
    reasoningQuality,
    misconceptionPersisted: false,
  };
}

type ProblemTemplate = Omit<GeneratedProblem, "topic" | "difficulty">;

// Topic-aware demo problem templates keyed by a substring of the topic name so
// demo mode adapts to the requested topic instead of always returning the same
// Newton's Second Law content. Matched case-insensitively.
const demoProblemTemplates: { match: string; problems: ProblemTemplate[] }[] = [
  {
    match: "second law",
    problems: [
      {
        question: "A 3 kg box is pushed with a 12 N net force on a frictionless surface. What is its acceleration?",
        given: ["mass = 3 kg", "net force = 12 N"],
        goal: "Find acceleration",
        hints: ["Start with F = ma.", "Solve for acceleration: a = F / m."],
        expectedReasoningPath: ["Identify net force", "Identify mass", "Rearrange F = ma", "Divide 12 by 3"],
        finalAnswer: "4 m/s^2",
        commonMisconceptions: ["Using mass as force", "Forgetting that net force is already the total force"],
      },
      {
        question: "A 10 N net force gives an object an acceleration of 2 m/s^2. What is its mass?",
        given: ["net force = 10 N", "acceleration = 2 m/s^2"],
        goal: "Find mass",
        hints: ["Rearrange F = ma to solve for m.", "Divide force by acceleration."],
        expectedReasoningPath: ["Write F = ma", "Solve m = F / a", "Divide 10 by 2"],
        finalAnswer: "5 kg",
        commonMisconceptions: ["Multiplying instead of dividing", "Confusing mass with weight"],
      },
    ],
  },
  {
    match: "first law",
    problems: [
      {
        question: "A hockey puck slides at constant velocity across frictionless ice. What is the net force on it?",
        given: ["constant velocity", "no friction"],
        goal: "Determine the net force",
        hints: ["What does constant velocity tell you about acceleration?", "Relate zero acceleration to net force."],
        expectedReasoningPath: ["Constant velocity means zero acceleration", "Zero acceleration means zero net force"],
        finalAnswer: "Zero net force.",
        commonMisconceptions: ["Thinking motion requires a forward force", "Confusing speed with force"],
      },
      {
        question: "A book rests on a table. Explain why it does not accelerate.",
        given: ["book is at rest", "gravity acts downward", "table pushes upward"],
        goal: "Explain balanced forces",
        hints: ["What is the net force if acceleration is zero?", "Compare gravity and the normal force."],
        expectedReasoningPath: ["List forces", "Recognize no acceleration", "Conclude forces balance"],
        finalAnswer: "The upward normal force balances the downward weight, so net force is zero.",
        commonMisconceptions: ["Thinking no motion means no forces", "Forgetting the normal force"],
      },
    ],
  },
  {
    match: "third law",
    problems: [
      {
        question: "A swimmer pushes water backward with their hands. Identify the action-reaction pair and the swimmer's motion.",
        given: ["swimmer pushes water backward"],
        goal: "Identify the reaction force and resulting motion",
        hints: ["Forces come in equal and opposite pairs.", "Which force acts on the swimmer?"],
        expectedReasoningPath: ["Swimmer pushes water backward", "Water pushes swimmer forward", "Swimmer accelerates forward"],
        finalAnswer: "The water pushes the swimmer forward with an equal and opposite force, so the swimmer moves forward.",
        commonMisconceptions: ["Thinking the action force is larger", "Applying both forces to the same object"],
      },
      {
        question: "A 50 N force is applied by a hammer on a nail. What force does the nail exert on the hammer?",
        given: ["hammer pushes nail with 50 N"],
        goal: "Find the reaction force",
        hints: ["Newton's third law: equal and opposite.", "The pair acts on different objects."],
        expectedReasoningPath: ["Identify action force", "Apply equal and opposite", "State reaction force"],
        finalAnswer: "The nail exerts 50 N back on the hammer in the opposite direction.",
        commonMisconceptions: ["Thinking the heavier object pushes harder", "Forgetting the forces are equal"],
      },
    ],
  },
  {
    match: "free body",
    problems: [
      {
        question: "A box slides down a rough ramp. List every force that should appear on its free body diagram.",
        given: ["box on an inclined ramp", "ramp is rough"],
        goal: "Enumerate the forces for the diagram",
        hints: ["Include gravity, the surface push, and resistance.", "Friction opposes motion."],
        expectedReasoningPath: ["Weight acts straight down", "Normal force perpendicular to ramp", "Friction up the ramp opposing the slide"],
        finalAnswer: "Weight (down), normal force (perpendicular to the ramp), and friction (up the ramp).",
        commonMisconceptions: ["Adding a force in the direction of motion", "Drawing the normal force vertically"],
      },
      {
        question: "A lamp hangs from a single cord. Draw and describe its free body diagram.",
        given: ["lamp hangs at rest", "supported by one cord"],
        goal: "Describe the balanced forces",
        hints: ["The lamp is in equilibrium.", "Tension balances weight."],
        expectedReasoningPath: ["Weight pulls down", "Tension pulls up", "Forces are equal because acceleration is zero"],
        finalAnswer: "Tension upward equals weight downward, so the net force is zero.",
        commonMisconceptions: ["Forgetting tension", "Thinking a resting object has no forces"],
      },
    ],
  },
  {
    match: "friction",
    problems: [
      {
        question: "A 4 kg crate sits on a surface with a coefficient of static friction of 0.5. What horizontal force is needed to start it moving? (g = 10 m/s^2)",
        given: ["mass = 4 kg", "coefficient of static friction = 0.5", "g = 10 m/s^2"],
        goal: "Find the force needed to overcome static friction",
        hints: ["Normal force equals weight here.", "Maximum static friction = coefficient x normal force."],
        expectedReasoningPath: ["Normal force = m*g = 40 N", "Friction = 0.5 * 40", "Force needed just exceeds 20 N"],
        finalAnswer: "Just over 20 N.",
        commonMisconceptions: ["Forgetting to compute the normal force", "Using mass instead of weight"],
      },
      {
        question: "Why does kinetic friction not depend on how fast an object slides (to a good approximation)?",
        given: ["object sliding on a surface"],
        goal: "Explain the kinetic friction model",
        hints: ["Kinetic friction depends on the normal force.", "It is roughly constant regardless of speed."],
        expectedReasoningPath: ["Friction = coefficient x normal force", "Neither term depends on speed", "So friction stays roughly constant"],
        finalAnswer: "Kinetic friction depends on the normal force and the surfaces, not on sliding speed.",
        commonMisconceptions: ["Thinking faster sliding means more friction", "Confusing static and kinetic friction"],
      },
    ],
  },
  {
    match: "gravity",
    problems: [
      {
        question: "An astronaut has a mass of 70 kg. What is the astronaut's weight on the Moon where g = 1.6 m/s^2?",
        given: ["mass = 70 kg", "g on Moon = 1.6 m/s^2"],
        goal: "Find weight on the Moon",
        hints: ["Weight = mass x gravitational field strength.", "Mass does not change between locations."],
        expectedReasoningPath: ["Write W = m*g", "Substitute 70 and 1.6", "Compute 112"],
        finalAnswer: "112 N",
        commonMisconceptions: ["Thinking mass changes on the Moon", "Using Earth's g instead of the Moon's"],
      },
      {
        question: "Explain the difference between mass and weight for an object moved from Earth to space.",
        given: ["object taken from Earth into orbit"],
        goal: "Distinguish mass from weight",
        hints: ["Mass measures the amount of matter.", "Weight depends on the gravitational field."],
        expectedReasoningPath: ["Mass is constant", "Gravitational field changes", "Weight changes while mass stays the same"],
        finalAnswer: "Mass stays the same; weight changes because the gravitational field strength changes.",
        commonMisconceptions: ["Treating mass and weight as the same", "Thinking weightless means massless"],
      },
    ],
  },
  {
    match: "work",
    problems: [
      {
        question: "A 20 N force pushes a box 5 m in the direction of the force. How much work is done?",
        given: ["force = 20 N", "displacement = 5 m", "force along displacement"],
        goal: "Find the work done",
        hints: ["Work = force x displacement (along the force).", "Multiply the values."],
        expectedReasoningPath: ["Write W = F*d", "Substitute 20 and 5", "Compute 100"],
        finalAnswer: "100 J",
        commonMisconceptions: ["Including perpendicular forces", "Forgetting work needs displacement"],
      },
      {
        question: "A waiter carries a tray horizontally at constant speed. How much work does the lifting force do on the tray?",
        given: ["tray carried horizontally", "lifting force is vertical"],
        goal: "Determine the work done by the vertical force",
        hints: ["Work depends on the force component along displacement.", "The force is perpendicular to the motion."],
        expectedReasoningPath: ["Force is vertical", "Displacement is horizontal", "Perpendicular force does zero work"],
        finalAnswer: "Zero work, because the force is perpendicular to the displacement.",
        commonMisconceptions: ["Thinking any force does work", "Confusing effort with work"],
      },
    ],
  },
  {
    match: "momentum",
    problems: [
      {
        question: "A 2 kg ball moves at 3 m/s. What is its momentum?",
        given: ["mass = 2 kg", "velocity = 3 m/s"],
        goal: "Find the momentum",
        hints: ["Momentum = mass x velocity.", "Multiply the values."],
        expectedReasoningPath: ["Write p = m*v", "Substitute 2 and 3", "Compute 6"],
        finalAnswer: "6 kg*m/s",
        commonMisconceptions: ["Confusing momentum with energy", "Forgetting momentum has direction"],
      },
      {
        question: "Two ice skaters push off each other. If one moves right, what can you say about the other, using conservation of momentum?",
        given: ["skaters initially at rest", "they push off each other"],
        goal: "Apply conservation of momentum",
        hints: ["Total momentum starts at zero.", "It must stay zero afterward."],
        expectedReasoningPath: ["Initial momentum is zero", "Total momentum is conserved", "The other skater moves left with equal momentum"],
        finalAnswer: "The other skater moves in the opposite direction with equal and opposite momentum.",
        commonMisconceptions: ["Thinking the heavier skater stays still", "Ignoring direction of momentum"],
      },
    ],
  },
];

export function demoProblems(topic: string, difficulty: "easy" | "medium" | "hard"): GeneratedProblem[] {
  const normalized = topic.toLowerCase();
  const entry =
    demoProblemTemplates.find((candidate) => normalized.includes(candidate.match)) ??
    demoProblemTemplates[0];

  return entry.problems.map((problem) => ({ topic, difficulty, ...problem }));
}

export function demoSessionSummary(topicName: string, mastery: number): SessionSummary {
  return {
    summary: `You practiced reasoning through ${topicName} by naming forces before using equations.`,
    keyTakeaways: ["Start with a free body diagram.", "Net force explains acceleration, not motion itself."],
    misconceptions: ["Watch for the idea that moving objects always need a forward net force."],
    recommendedNextStep: "Try two more guided Newton's Second Law problems.",
    updatedMasteryEstimate: Math.min(100, mastery + 5),
  };
}
