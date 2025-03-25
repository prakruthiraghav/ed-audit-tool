import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // Get all public audits with their related data
    const audits = await prisma.audit.findMany({
      where: {
        isPublic: true,
      },
      include: {
        filter: true,
        photo: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.error("Error fetching public audits:", error);
    return NextResponse.json(
      { error: "Failed to fetch public audits" },
      { status: 500 }
    );
  }
}
