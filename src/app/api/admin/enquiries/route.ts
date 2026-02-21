import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });

    return NextResponse.json(enquiries);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch enquiries" },
      { status: 500 },
    );
  }
}
