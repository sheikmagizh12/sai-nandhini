import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import UOM from "@/models/UOM";
import Product from "@/models/Product";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Only allow admins to seed (or disable entirely in production if preferred)
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Create or Find Categories
    const categoriesData = [
      {
        name: "Sweets",
        slug: "sweets",
        description: "Authentic Traditional Sweets",
      },
      { name: "Snacks", slug: "snacks", description: "Crunchy Savory Snacks" },
      {
        name: "Pickles",
        slug: "pickles",
        description: "Spicy Homemade Pickles",
      },
    ];

    const categoryMap: Record<string, any> = {};

    for (const cat of categoriesData) {
      let category = await Category.findOne({ slug: cat.slug });
      if (!category) {
        category = await Category.create(cat);
      }
      categoryMap[cat.name] = category;
    }

    // 2. Create or Find SubCategories
    const subCategoriesData = [
      { name: "Ghee Sweets", slug: "ghee-sweets", parent: "Sweets" },
      { name: "Milk Sweets", slug: "milk-sweets", parent: "Sweets" },
      {
        name: "Traditional Snacks",
        slug: "traditional-snacks",
        parent: "Snacks",
      },
      { name: "Mixtures", slug: "mixtures", parent: "Snacks" },
      { name: "Veg Pickles", slug: "veg-pickles", parent: "Pickles" },
    ];

    const subCategoryMap: Record<string, any> = {};

    for (const sub of subCategoriesData) {
      const parentCat = categoryMap[sub.parent];
      if (parentCat) {
        let subCategory = await SubCategory.findOne({ slug: sub.slug });
        if (!subCategory) {
          subCategory = await SubCategory.create({
            name: sub.name,
            slug: sub.slug,
            parentCategory: parentCat._id,
          });
        }
        subCategoryMap[sub.name] = subCategory;
      }
    }

    // 3. Create or Find UOMs
    const uomsData = [
      { name: "250gms", code: "250g" },
      { name: "500gms", code: "500g" },
      { name: "1kg", code: "1kg" },
      { name: "300gms", code: "300g" }, // For pickles
    ];

    for (const uom of uomsData) {
      const exists = await UOM.findOne({ code: uom.code });
      if (!exists) {
        await UOM.create(uom);
      }
    }

    // 4. Create Products
    const productsData = [
      {
        name: "Pure Ghee Mysore Pak",
        slug: "pure-ghee-mysore-pak",
        description:
          "Melt-in-your-mouth Mysore Pak made with generous amounts of pure ghee.",
        price: 600, // Base price (usually lowest variant or something)
        category: "Sweets",
        subCategory: "Ghee Sweets",
        variants: [
          { uom: "250g", price: 180, stock: 50 },
          { uom: "500g", price: 340, stock: 40 },
          { uom: "1kg", price: 650, stock: 20 },
        ],
        images: [
          "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        stock: 110,
        isFeatured: true,
        badge: "Bestseller",
      },
      {
        name: "Kaju Katli",
        slug: "kaju-katli",
        description:
          "Rich cashew fudge with a silver varq finish. Perfect for gifting.",
        price: 1200,
        category: "Sweets",
        subCategory: "Milk Sweets",
        variants: [
          { uom: "250g", price: 320, stock: 60 },
          { uom: "500g", price: 620, stock: 30 },
          { uom: "1kg", price: 1200, stock: 15 },
        ],
        images: [
          "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        stock: 105,
        isFeatured: true,
      },
      {
        name: "Butter Murukku",
        slug: "butter-murukku",
        description:
          "Crunchy, spiral-shaped savory snack made with rice flour and butter.",
        price: 400,
        category: "Snacks",
        subCategory: "Traditional Snacks",
        variants: [
          { uom: "250g", price: 110, stock: 80 },
          { uom: "500g", price: 210, stock: 50 },
        ],
        images: [
          "https://images.pexels.com/photos/4051610/pexels-photo-4051610.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        stock: 130,
        badge: "Fresh",
      },
      {
        name: "Madras Mixture",
        slug: "madras-mixture",
        description:
          "Spicy blend of deep-fried lentils, peanuts, curry leaves, and spices.",
        price: 420,
        category: "Snacks",
        subCategory: "Mixtures",
        variants: [
          { uom: "250g", price: 115, stock: 70 },
          { uom: "500g", price: 220, stock: 45 },
          { uom: "1kg", price: 420, stock: 25 },
        ],
        images: [
          "https://images.pexels.com/photos/4051610/pexels-photo-4051610.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        stock: 140,
      },
      {
        name: "Mango Thokku",
        slug: "mango-thokku",
        description:
          "Tangy and spicy grated mango pickle made with sesame oil.",
        price: 350,
        category: "Pickles",
        subCategory: "Veg Pickles",
        variants: [
          { uom: "300g", price: 120, stock: 65 },
          { uom: "500g", price: 190, stock: 40 },
        ],
        images: [
          "https://images.pexels.com/photos/674483/pexels-photo-674483.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        stock: 105,
        badge: "Homemade",
      },
    ];

    const createdProducts = [];

    for (const p of productsData) {
      const subCat = subCategoryMap[p.subCategory];
      if (!subCat) continue; // Should not happen

      let product = await Product.findOne({ slug: p.slug });
      if (!product) {
        product = await Product.create({
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          category: p.category, // Using name as string per schema
          subCategory: subCat._id,
          variants: p.variants,
          images: p.images,
          stock: p.stock,
          isFeatured: p.isFeatured,
          badge: p.badge,
        });
        createdProducts.push(product.name);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      products: createdProducts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
