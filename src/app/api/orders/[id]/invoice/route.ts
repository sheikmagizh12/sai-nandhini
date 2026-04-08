import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email")?.trim().toLowerCase() || null;

    // Auth
    const session = await auth.api.getSession({ headers: await headers() });

    await connectDB();
    const order = await Order.findById(id)
      .populate({ path: "orderItems.product", select: "slug name" })
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization — same 4-tier logic as the invoice page
    const isAdmin = session && (session.user as any).role === "admin";
    const isOrderOwner =
      order.user && session && (order.user as any).toString() === session.user.id;
    const isGuestOrder = !order.user;
    const isEmailVerified =
      emailParam &&
      (order.shippingAddress as any)?.email?.trim().toLowerCase() === emailParam;

    if (!isAdmin && !isOrderOwner && !isGuestOrder && !isEmailVerified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate PDF
    const { generateInvoiceHTML } = await import("@/lib/invoice-generator");
    const { generatePDFFromHTML } = await import("@/lib/pdf-generator");

    const invoiceHTML = await generateInvoiceHTML(order);
    const pdfBuffer = Buffer.from(await generatePDFFromHTML(invoiceHTML));

    const filename = `invoice-${(order as any)._id.toString().slice(-8).toUpperCase()}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("Invoice download error:", err);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
