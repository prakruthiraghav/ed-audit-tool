const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create filters
  const filters = await Promise.all([
    prisma.filter.create({
      data: {
        name: "Normal",
        description: "No filter effect",
        category: "Basic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Black & White",
        description: "Convert image to grayscale",
        category: "Basic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Brightness",
        description: "Increase image brightness",
        category: "Basic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Contrast",
        description: "Enhance image contrast",
        category: "Basic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Disney",
        description: "Disney-style animation effect",
        category: "Themed",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Anime",
        description: "Anime-style effect with bold lines",
        category: "Themed",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Comic Hero",
        description: "Comic book superhero style effect",
        category: "Themed",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Pixar",
        description: "Pixar-style animation effect",
        category: "Themed",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Vintage",
        description: "Classic sepia tone effect",
        category: "Basic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Rainbow",
        description: "Add colorful rainbow gradient overlay",
        category: "Basic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Pixel Art",
        description: "Convert image to pixel art style",
        category: "Artistic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Cartoon",
        description: "Cartoon-style effect with edge detection",
        category: "Artistic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Oil Painting",
        description: "Convert image to oil painting style",
        category: "Artistic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Comic Book",
        description: "Comic book style with posterization",
        category: "Artistic",
      },
    }),
    prisma.filter.create({
      data: {
        name: "Neon",
        description: "Add neon glow effect to image",
        category: "Artistic",
      },
    }),
  ]);

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
