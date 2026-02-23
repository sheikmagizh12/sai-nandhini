import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // We only allow updating delivery or payment status manually for admin (though payment should usually be automated)
    const updateData: any = {};
    // Updatable fields
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "Delivered") {
        updateData.isDelivered = true;
        updateData.deliveredAt = Date.now();
      } else {
        updateData.isDelivered = false;
        updateData.deliveredAt = null;
      }
      // TODO: Send email notification on status change (e.g., to 'Shipping' with AWB)
    }

    if (body.awbNumber) {
      updateData.awbNumber = body.awbNumber;
    }

    if (body.isDelivered !== undefined) {
      updateData.isDelivered = body.isDelivered;
      updateData.deliveredAt = body.isDelivered ? Date.now() : null;
      if (body.isDelivered) updateData.status = "Delivered";
    }
    if (body.isPaid !== undefined) {
      updateData.isPaid = body.isPaid;
      updateData.paidAt = body.isPaid ? Date.now() : null;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
