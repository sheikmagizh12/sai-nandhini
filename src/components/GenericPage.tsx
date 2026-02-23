"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function GenericPageComponent({ slug }: { slug: string }) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/page?slug=${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPage(data);
      } catch (err: any) {
        if (err.message !== "Not found") {
          console.error(err);
        }
        setPage(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-400 mb-4 tracking-tighter">
            Content Coming Soon
          </h1>
          <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
            We are updating our policies. Please check back later.
          </p>
          <a
            href="/"
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            Back Home
          </a>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {/* Header */}
      <div className="bg-secondary/10 pt-40 pb-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-black text-primary-dark tracking-tighter mb-4 capitalize leading-tight">
            {page.title}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Last Updated: {new Date(page.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div
          className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-headings:text-primary-dark prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-primary-dark whitespace-pre-wrap"
          // We render HTML but use whitespace-pre-wrap to respect newlines if user typed plain text
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
      <Footer />
    </main>
  );
}
