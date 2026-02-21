"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-48 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif font-bold text-primary-dark"
          >
            How Can We <span className="text-primary italic">Help?</span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Contact Info */}
          <div className="lg:col-span-4 space-y-8">
            {[
              {
                title: "Visit Us",
                content:
                  "# 3/81, 1st Floor, Kaveri Main Street, SRV Nagar, Thirunagar, Madurai - 625006",
                icon: MapPin,
              },
              {
                title: "WhatsApp / Call Us",
                content: "+91 96009 16065",
                icon: Phone,
              },
              {
                title: "Email Us",
                content: "info@sainandhini.com",
                icon: Mail,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-start gap-6 border border-gray-100 group hover:border-primary/20 transition-all"
              >
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-primary-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm">
                    {item.content}
                  </p>
                </div>
              </motion.div>
            ))}

            <div className="bg-primary-dark p-10 rounded-[3rem] text-white relative overflow-hidden">
              <MessageSquare className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
              <h3 className="text-xl font-serif font-bold mb-4">
                Bulk Orders?
              </h3>
              <p className="text-primary-light text-sm font-medium mb-6">
                Planning a wedding or a corporate event? We handle bulk orders
                with custom branding.
              </p>
              <button className="text-xs font-bold uppercase tracking-widest text-accent hover:underline">
                Connect with Sales →
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-100"
            >
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-gray-50 border border-transparent focus:border-primary/10 rounded-2xl py-5 px-8 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full bg-gray-50 border border-transparent focus:border-primary/10 rounded-2xl py-5 px-8 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Subject
                  </label>
                  <select className="w-full bg-gray-50 border border-transparent focus:border-primary/10 rounded-2xl py-5 px-8 outline-none transition-all font-medium appearance-none">
                    <option>General Inquiry</option>
                    <option>Order Support</option>
                    <option>Bulk Order / Events</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="How can we help you today?"
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/10 rounded-2xl py-6 px-8 outline-none transition-all font-medium"
                  />
                </div>

                <button className="w-full bg-primary text-white py-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl active:scale-95 group">
                  Send Deep Message{" "}
                  <Send
                    size={20}
                    className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
