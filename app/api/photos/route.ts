import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // console.log("Session in GET:", session);

    if (!session?.user?.id) {
      console.error("No user ID in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all photos for the user with filter relation
    const photos = await prisma.photo.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        filter: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

   // console.log("Fetched photos:", photos.length);
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in POST:", session);

    if (!session?.user?.id) {
      console.error("No user ID in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as Blob;
    const filterId = formData.get("filterId") as string;

    console.log("Received form data:", {
      filterId,
      imageSize: image?.size,
      imageType: image?.type,
      hasImage: !!image,
      hasFilterId: !!filterId,
      userId: session.user.id,
    });

    if (!image || !filterId) {
      console.error("Missing required fields:", {
        hasImage: !!image,
        hasFilterId: !!filterId,
      });
      return NextResponse.json(
        { error: "Image and filter ID are required" },
        { status: 400 }
      );
    }

    // Verify filter exists
    const filter = await prisma.filter.findUnique({
      where: { id: filterId },
    });

    if (!filter) {
      console.error("Filter not found:", filterId);
      return NextResponse.json({ error: "Filter not found" }, { status: 404 });
    }

    // Create photos directory if it doesn't exist
    const photosDir = join(process.cwd(), "public", "photos");
    console.log("Creating photos directory:", photosDir);
    try {
      await mkdir(photosDir, { recursive: true });
      console.log("Photos directory created/verified");
    } catch (dirError) {
      console.error("Error creating photos directory:", dirError);
      throw dirError;
    }

    // Generate unique filename
    const uniqueFilename = `${session.user.id}-${Date.now()}.jpg`;
    const filePath = join(photosDir, uniqueFilename);

    console.log("Saving photo to:", filePath);

    // Convert blob to buffer and save
    try {
      const buffer = Buffer.from(await image.arrayBuffer());
      await writeFile(filePath, buffer);
      console.log("Photo file saved successfully");
    } catch (fileError) {
      console.error("Error saving photo file:", fileError);
      throw fileError;
    }

    // Save photo record in database
    try {
      console.log("Creating photo record with data:", {
        userId: session.user.id,
        filterId: filterId,
        url: `/photos/${uniqueFilename}`,
      });

      const photo = await prisma.photo.create({
        data: {
          userId: session.user.id,
          filterId: filterId,
          url: `/photos/${uniqueFilename}`,
        },
        include: {
          filter: true,
        },
      });

      console.log("Created new photo record:", photo.id);
      return NextResponse.json(photo);
    } catch (dbError) {
      console.error("Error creating photo record:", dbError);
      // Try to clean up the file if database insert fails
      try {
        await unlink(filePath);
        console.log("Cleaned up photo file after database error");
      } catch (cleanupError) {
        console.error("Error cleaning up photo file:", cleanupError);
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error saving photo:", error);
    return NextResponse.json(
      {
        error: "Failed to save photo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
