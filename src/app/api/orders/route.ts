import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      customerId,
    } = await req.json();

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "No order items" }, { status: 400 });
    }

    await connectDB();

    // Fix for "admin-fallback" or missing user ID
    let userId = session.user.id;

    // Allow admins to create orders for other customers
    if (customerId && (session.user as any).role === "admin") {
      userId = customerId;
    }

    // If still fallback or invalid (only for admin context logic if needed), try to find a root admin or use a specific system user
    if (userId === "admin-fallback" && (session.user as any).role === "admin") {
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) userId = adminUser._id;
      else
        return NextResponse.json(
          { error: "No valid admin user found in database to associate order" },
          { status: 400 },
        );
    }

    const order = new Order({
      orderItems: orderItems.map((x: any) => ({
        ...x,
        product: x.productId,
        _id: undefined,
      })),
      user: userId,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ user: session.user.id }).sort({
      createdAt: -1,
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
