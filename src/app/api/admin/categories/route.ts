import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { name, image, description } = await req.json();

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 },
      );
    }

    const category = await Category.create({ name, slug, image, description });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
