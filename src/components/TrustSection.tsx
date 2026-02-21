"use client";

import { motion } from "framer-motion";
import { Leaf, Timer, Heart, Award } from "lucide-react";

const trustPoints = [
  {
    icon: Leaf,
    title: "100% Natural",
    desc: "Pure ingredients with zero preservatives. Every product passes our quality check.",
    accent: "bg-emerald-50 text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    icon: Timer,
    title: "Fresh Daily",
    desc: "Made fresh every morning in our Madurai kitchen using traditional wood-fired methods.",
    accent: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Sourced from 12+ partner farms in Tamil Nadu. Supporting sustainable local agriculture.",
    accent: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Heart,
    title: "Made with Love",
    desc: "Heritage recipes refined over 25 years — delivering the authentic taste of home.",
    accent: "bg-rose-50 text-rose-600",
    iconBg: "bg-rose-100",
  },
];

export default function TrustSection() {
  return (
    <section className="py-20 bg-[#F8F6F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] mb-3 block">
            Why Sai Nandhini
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-[#2F3E2C] tracking-tight">
            The Promise Behind Every Bite
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-7 relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#2F3E2C]/5 border border-gray-100"
            >
              <div
                className={`w-12 h-12 ${point.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <point.icon size={22} className={point.accent.split(" ")[1]} />
              </div>

              <h3 className="text-lg font-bold text-[#2F3E2C] mb-2">
                {point.title}
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                {point.desc}
              </p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-[#C6A75E] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
