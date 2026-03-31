import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Settings from "@/models/Settings";
import HeroSlide from "@/models/HeroSlide";
import { cached, CACHE_KEYS } from "@/lib/cache";

// Select only fields the ShopClient component needs
const PRODUCT_LIST_FIELDS = "_id slug images name price mrp rating tag category stock variants badge uom";
// Select only fields CategorySection/ShopClient needs
const CATEGORY_LIST_FIELDS = "_id name slug image description";
// Select only fields HeroCarousel needs
const HERO_SLIDE_FIELDS = "title titleAccent tag description image ctaText ctaLink badge1 badge2";

export async function getProducts() {
  return cached(CACHE_KEYS.PRODUCTS, 60_000, async () => {
    await connectDB();
    const products = await Product.find({ isActive: { $ne: false } })
      .select(PRODUCT_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(products));
  });
}

// Home page only needs 8 featured products — avoid fetching entire catalog
export async function getFeaturedProducts(limit: number = 8) {
  return cached(`${CACHE_KEYS.FEATURED}${limit}`, 60_000, async () => {
    await connectDB();
    const products = await Product.find({ isActive: { $ne: false } })
      .select(PRODUCT_LIST_FIELDS)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return JSON.parse(JSON.stringify(products));
  });
}

export async function getCategories() {
  return cached(CACHE_KEYS.CATEGORIES, 60_000, async () => {
    await connectDB();
    const categories = await Category.find({ isActive: { $ne: false } })
      .select(CATEGORY_LIST_FIELDS)
      .sort({ order: 1 })
      .lean();
    return JSON.parse(JSON.stringify(categories));
  });
}

export async function getSettings() {
  return cached(CACHE_KEYS.SETTINGS_PUBLIC, 60_000, async () => {
    await connectDB();
    const settings = await Settings.findOne()
      .select("manageInventory")
      .lean();
    return JSON.parse(JSON.stringify(settings || {}));
  });
}

export async function getHeroSlides() {
  return cached(CACHE_KEYS.HERO_SLIDES, 60_000, async () => {
    await connectDB();
    const slides = await HeroSlide.find({ isActive: { $ne: false } })
      .select(HERO_SLIDE_FIELDS)
      .sort({ order: 1 })
      .lean();
    return JSON.parse(JSON.stringify(slides));
  });
}

export async function getProductBySlug(slug: string) {
  return cached(`${CACHE_KEYS.PRODUCT_SLUG}${slug}`, 30_000, async () => {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: { $ne: false } }).lean();
    return product ? JSON.parse(JSON.stringify(product)) : null;
  });
}
