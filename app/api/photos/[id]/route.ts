import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import fs from "fs";
import path from "path";

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

    // Get the photo
    const photo = await prisma.photo.findUnique({
      where: {
        id: params.id,
        userId: user.id, // Only allow deletion of user's own photos
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete the photo file from the filesystem
    const photoPath = path.join(process.cwd(), "public", photo.url);
    try {
      fs.unlinkSync(photoPath);
    } catch (error) {
      console.error("Error deleting photo file:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the photo from the database
    await prisma.photo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
