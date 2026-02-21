import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const rate = await ShippingRate.findByIdAndUpdate(id, body, { new: true });

    if (!rate)
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });

    return NextResponse.json(rate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const rate = await ShippingRate.findByIdAndDelete(id);

    if (!rate)
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });

    return NextResponse.json({ message: "Rate deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
