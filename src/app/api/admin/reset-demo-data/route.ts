import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/cache";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Order from "@/models/Order";
import Enquiry from "@/models/Enquiry";
import Coupon from "@/models/Coupon";
import UOM from "@/models/UOM";
import StockTransaction from "@/models/StockTransaction";
import ShippingRate from "@/models/ShippingRate";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Delete all transactional and catalog data
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      SubCategory.deleteMany({}),
      Order.deleteMany({}),
      Enquiry.deleteMany({}),
      Coupon.deleteMany({}),
      UOM.deleteMany({}),
      StockTransaction.deleteMany({}),
      ShippingRate.deleteMany({}),
    ]);

    invalidateCache(); // Clear all caches
    return NextResponse.json({ message: "All demo data erased successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to erase data" },
      { status: 500 },
    );
  }
}
