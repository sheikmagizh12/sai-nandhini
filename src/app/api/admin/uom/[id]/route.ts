import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UOM from "@/models/UOM";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    // Prevent updating to a duplicate code if code is changed
    if (body.code) {
      const existingUOM = await UOM.findOne({
        code: body.code,
        _id: { $ne: id },
      });
      if (existingUOM) {
        return NextResponse.json(
          { error: "UOM code already exists" },
          { status: 400 },
        );
      }
    }

    const uom = await UOM.findByIdAndUpdate(id, body, { new: true });
    if (!uom) {
      return NextResponse.json({ error: "UOM not found" }, { status: 404 });
    }
    return NextResponse.json(uom);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Find the UOM first to get its name before deleting
    const uom = await UOM.findById(id);
    if (!uom) {
      return NextResponse.json({ error: "UOM not found" }, { status: 404 });
    }

    // Check if any product uses this UOM name in variants or top-level uom field
    const assignedCount = await Product.countDocuments({
      $or: [
        { "variants.uom": uom.name },
        { uom: uom.name },
      ],
    });

    if (assignedCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${uom.name}" — it is assigned to ${assignedCount} product${assignedCount > 1 ? "s" : ""}. Remove it from all products first.`,
          assignedCount,
        },
        { status: 409 },
      );
    }

    await UOM.findByIdAndDelete(id);
    return NextResponse.json({ message: "UOM deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
