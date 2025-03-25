import prisma from "../app/lib/prisma";

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Prak",
        email: "prak@example.com",
        password: "password123",
      },
    });
    console.log("Created user:", user);
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
