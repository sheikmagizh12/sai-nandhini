import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getUrlFromPublicId,
  getPublicIdFromUrl,
} from "@/lib/cloudinary";

/* ────────── PUT — update a slide ────────── */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const existing = await HeroSlide.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Slide not found" },
        { status: 404 },
      );
    }

    // Handle image changes
    let imageValue: string | undefined;
    if (body.image) {
      const imgData = body.image;

      if (imgData.startsWith("data:image")) {
        // New base64 image → upload to Cloudinary
        // Delete old Cloudinary image first
        if (existing.image && !existing.image.startsWith("http")) {
          await deleteFromCloudinary(existing.image);
        }

        const result = await uploadToCloudinary(
          imgData,
          "sainandhini/images/hero",
        );
        imageValue = result.public_id;
      } else if (imgData.startsWith("http")) {
        // Direct URL — extract public_id if Cloudinary, else store URL as-is
        const publicId = getPublicIdFromUrl(imgData);
        imageValue = publicId || imgData;
      }
    }

    // Build update object
    const updateData: any = { ...body };
    if (imageValue !== undefined) {
      updateData.image = imageValue;
    } else {
      delete updateData.image; // Keep existing image
    }

    const slide = await HeroSlide.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Slide updated",
      data: {
        ...slide._doc,
        image:
          slide.image && !slide.image.startsWith("http")
            ? getUrlFromPublicId(slide.image)
            : slide.image,
      },
    });
  } catch (error: any) {
    console.error("PUT hero-slides error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

/* ────────── DELETE — remove a slide ────────── */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return NextResponse.json(
        { success: false, message: "Slide not found" },
        { status: 404 },
      );
    }

    // Delete from Cloudinary if it's a public_id
    if (slide.image && !slide.image.startsWith("http")) {
      await deleteFromCloudinary(slide.image);
    }

    await HeroSlide.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Slide deleted",
    });
  } catch (error: any) {
    console.error("DELETE hero-slides error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
