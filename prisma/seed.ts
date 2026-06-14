import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../lib/generated/prisma/client";
import { diagnosticQuestions } from "../lib/assessment/diagnostic";
import { physicsTopics } from "../lib/topics";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.");
}

const adapter = new PrismaLibSql({ url, authToken });

const prisma = new PrismaClient({ adapter });

async function main() {
  for (const topic of physicsTopics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: topic,
      create: topic,
    });
  }

  const secondLaw = await prisma.topic.findUniqueOrThrow({
    where: { slug: "newtons-second-law" },
  });

  await prisma.problem.deleteMany({ where: { topicId: secondLaw.id } });

  await prisma.problem.createMany({
    data: [
      {
        topicId: secondLaw.id,
        difficulty: "easy",
        question: "A 2 kg cart accelerates at 3 m/s^2. What net force acts on it?",
        solution: "Use F = ma: F = 2 kg * 3 m/s^2 = 6 N.",
        hints: ["What equation connects force, mass, and acceleration?", "Substitute m = 2 and a = 3."],
      },
      {
        topicId: secondLaw.id,
        difficulty: "medium",
        question: "A 10 N net force acts on a 5 kg object. What is its acceleration?",
        solution: "Use a = F / m: a = 10 N / 5 kg = 2 m/s^2.",
        hints: ["Rearrange F = ma.", "Divide net force by mass."],
      },
    ],
  });

  console.log(`Seeded ${physicsTopics.length} physics topics and ${diagnosticQuestions.length} diagnostic questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
