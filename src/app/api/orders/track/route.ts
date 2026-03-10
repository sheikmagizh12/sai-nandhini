import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req: Request) {
    try {
        const { orderId, email } = await req.json();

        if (!orderId || !email) {
            return NextResponse.json(
                { error: "Order ID and email are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Simple validation for MongoDB ID
        if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
            return NextResponse.json({ error: "Invalid Order ID format" }, { status: 400 });
        }

        // Check if order exists with this ID and email
        const order = await Order.findById(orderId).populate({
            path: "orderItems.product",
            select: "slug name",
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Verify email matches the order
        if (order.shippingAddress.email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
