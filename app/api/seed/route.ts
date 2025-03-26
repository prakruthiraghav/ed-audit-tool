import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import { seed } from "../../../prisma/seed";

export async function POST() {
  try {
    // Run migrations first
    await prisma.$executeRaw`prisma migrate deploy`;

    // Generate Prisma client
    await prisma.$executeRaw`prisma generate`;

    // Run seed script
    await seed();

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
