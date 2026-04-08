import { getSettings } from "@/lib/data";
import AboutPublicClient from "./AboutPublicClient";

export const metadata = {
  title: "About Us | Sai Nandhini",
  description: "Learn about the heritage, philosophy, and culinary journey of Sai Nandhini.",
};

export const revalidate = 60; // ISR cache revalidation

export default async function AboutPage() {
  const settings = await getSettings();
  
  return <AboutPublicClient initialAboutUs={settings.aboutUs} />;
}
