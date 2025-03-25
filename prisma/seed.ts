const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Define the filters
  const filters = [
    {
      name: "Normal",
      description: "No filter applied",
      category: "Basic",
    },
    {
      name: "Black & White",
      description: "Convert image to grayscale",
      category: "Basic",
    },
    {
      name: "Vintage",
      description: "Apply vintage sepia effect",
      category: "Basic",
    },
    {
      name: "Rainbow",
      description: "Add rainbow gradient overlay",
      category: "Basic",
    },
    {
      name: "Pixel Art",
      description: "Convert image to pixel art style",
      category: "Artistic",
    },
    {
      name: "Disney",
      description:
        "Apply Disney animation style effect with enhanced colors and soft edges",
      category: "Themed",
    },
    {
      name: "Anime",
      description:
        "Convert image to anime style with bold lines and cel shading",
      category: "Themed",
    },
    {
      name: "Comic Hero",
      description:
        "Create a comic book superhero effect with bold colors and halftone patterns",
      category: "Themed",
    },
    {
      name: "Pixar",
      description:
        "Apply Pixar-inspired 3D animation style with smooth shading",
      category: "Themed",
    },
  ];

  // Add filters to database
  for (const filter of filters) {
    await prisma.filter.upsert({
      where: { name: filter.name },
      update: filter,
      create: filter,
    });
  }

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
