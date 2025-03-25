import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // console.log("Session in GET filters:", session);

    if (!session?.user?.id) {
      console.error("No user ID in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all filters
    const filters = await prisma.filter.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // console.log("Fetched filters:", filters.length);
    return NextResponse.json(filters);
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
