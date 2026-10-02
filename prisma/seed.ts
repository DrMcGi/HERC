import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.cohort.createMany({
    data: [
      { label: "5-9 October 2026", training: "5-9 October 2026", assessment: "12-13 October 2026", position: 0 },
      { label: "26-30 October 2026", training: "26-30 October 2026", assessment: "2-3 November 2026", position: 1 },
      { label: "16-20 November 2026", training: "16-20 November 2026", assessment: "23-24 November 2026", position: 2 },
    ],
    skipDuplicates: true,
  });

  await prisma.portalContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      programmeTitle: "PV GreenCard 2026",
      programmeDescription: "Five days of practical training and two days of assessment, accredited with SAPVIA.",
      welcomeMessage: "Your HERC learning space is ready. Keep your momentum and make every session count.",
    },
  });
}

main().finally(() => prisma.$disconnect());
