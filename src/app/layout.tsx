import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins, Baloo_2, Geist } from "next/font/google";
import "./globals.css";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import Category from "@/models/Category";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Providers } from "@/components/Providers";
import { NavbarDataProvider } from "@/context/NavbarDataContext";
import { cn } from "@/lib/utils";
import { withCache, CACHE_KEYS } from "@/lib/cache";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const baloo = Baloo_2({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-baloo",
});

const getCachedSeoSettings = withCache(CACHE_KEYS.SEO, 60_000, async () => {
  await connectDB();
  const settings = await Settings.findOne()
    .select("seo favicon shopName")
    .lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : null;
});

export async function generateMetadata(): Promise<Metadata> {
  const defaultMeta = {
    title: "Sai Nandhini Tasty World | Authentic South Indian Delicacies",
    description:
      "Experience the magic of traditional sweets and savories crafted with love and the finest ingredients.",
    keywords:
      "sweets, snacks, pickles, south indian food, authentic delicacies",
  };

  try {
    const settings = await getCachedSeoSettings();

    if (settings) {
      const siteName = settings.shopName || "Sai Nandhini Tasty World";
      return {
        title: settings.seo?.metaTitle || siteName,
        description: settings.seo?.metaDescription || defaultMeta.description,
        keywords: settings.seo?.keywords
          ? settings.seo.keywords.split(",").map((k: string) => k.trim())
          : defaultMeta.keywords.split(","),
        openGraph: {
          title: settings.seo?.metaTitle || siteName,
          description: settings.seo?.metaDescription || defaultMeta.description,
          images: settings.seo?.ogImage ? [settings.seo.ogImage] : [],
          siteName: siteName,
        },
        icons: settings.favicon ? { icon: settings.favicon } : undefined,
      };
    }
  } catch (e) {
    console.error("SEO Fetch Error:", e);
  }

  return defaultMeta;
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const getNavbarData = withCache(CACHE_KEYS.NAVBAR, 60_000, async () => {
  try {
    await connectDB();
    const [settings, categories] = await Promise.all([
      Settings.findOne()
        .select("logo shopName contactPhone contactEmail socialMedia address")
        .lean(),
      Category.find({ isActive: { $ne: false } })
        .select("_id name slug")
        .sort({ order: 1 })
        .lean(),
    ]);
    return {
      settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
      categories: JSON.parse(JSON.stringify(categories || [])),
    };
  } catch (e) {
    console.error("Navbar data fetch error:", e);
    return { settings: null, categories: [] };
  }
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Don't await! Pass the promise down — resolves via React use() in the provider
  // This keeps the layout synchronous so pages can be statically rendered / ISR cached
  const navbarPromise = getNavbarData();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${poppins.variable} ${baloo.variable} font-sans antialiased text-gray-900 bg-secondary`}
      >
        <Providers>
          <Suspense>
            <NavbarDataProvider dataPromise={navbarPromise}>
              {children}
              <WhatsAppButton />
            </NavbarDataProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
