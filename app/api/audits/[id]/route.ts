import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { authOptions } from "../../../lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the audit
    const audit = await prisma.audit.findUnique({
      where: {
        id: params.id,
        userId: user.id, // Only allow access to user's own audits
      },
      include: {
        filter: true,
        photo: true,
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error("Error fetching audit:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    const audit = await prisma.audit.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        description,
      },
    });

    return new NextResponse(JSON.stringify(audit));
  } catch (error) {
    console.error("Error updating audit:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the audit
    const audit = await prisma.audit.findUnique({
      where: {
        id: params.id,
        userId: user.id, // Only allow deletion of user's own audits
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // First, update the audit to remove the photo reference
    await prisma.audit.update({
      where: { id: params.id },
      data: { photoId: null },
    });

    // Then delete the audit
    await prisma.audit.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Audit deleted successfully" });
  } catch (error) {
    console.error("Error deleting audit:", error);
    return NextResponse.json(
      { error: "Failed to delete audit" },
      { status: 500 }
    );
  }
}
