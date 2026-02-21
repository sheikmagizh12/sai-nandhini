import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Sales by Category
    const salesByCategory = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalAmount: {
            $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
          },
          count: { $sum: "$orderItems.qty" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // 2. Top Selling Products
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          totalSales: {
            $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
          },
          totalQty: { $sum: "$orderItems.qty" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
    ]);

    // 3. Payment Method Distribution
    const paymentMethods = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    return NextResponse.json({
      salesByCategory,
      topProducts,
      paymentMethods,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
