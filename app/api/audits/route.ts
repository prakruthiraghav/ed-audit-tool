import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all audits for the user
    const audits = await prisma.audit.findMany({
      where: {
        userId: user.id,
      },
      include: {
        filter: true,
        photo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.error("Error fetching audits:", error);
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, isPublic, filterId, photoId } = body;

    // Validate required fields
    if (!title || !filterId || !photoId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the audit
    const audit = await prisma.audit.create({
      data: {
        title,
        description,
        isPublic,
        userId: user.id,
        filterId,
        photoId,
      },
    });

    return NextResponse.json(audit);
  } catch (error) {
    console.error("Error creating audit:", error);
    return NextResponse.json(
      { error: "Failed to create audit" },
      { status: 500 }
    );
  }
}
