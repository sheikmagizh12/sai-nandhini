"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShoppingBag,
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MyOrdersPage() {
  const { data: session, isPending: status } = authClient.useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!status && !session) {
      router.push("/login?callbackUrl=/orders");
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchOrders();
    }
  }, [session, status]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow pt-48 pb-32 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
              Order History
            </span>
            <h1 className="text-5xl font-serif font-bold text-primary-dark">
              Your Past <span className="text-primary italic">Delights</span>
            </h1>
          </div>
          <div className="hidden md:block">
            <p className="text-gray-400 font-medium text-sm text-right">
              Showing {orders.length} orders from
              <br />
              your lifetime collection.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[4rem] text-center shadow-xl border border-gray-100">
            <ShoppingBag size={64} className="text-gray-100 mx-auto mb-8" />
            <h3 className="text-3xl font-serif font-bold text-primary-dark mb-4">
              No orders yet.
            </h3>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
              Your basket is waiting to be filled with authentic South Indian
              flavors.
            </p>
            <Link
              href="/shop"
              className="bg-primary text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:bg-primary-dark transition-all inline-flex items-center gap-3"
            >
              Start Shopping <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col md:flex-row justify-between gap-10">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                          Order ID
                        </p>
                        <p className="text-lg font-serif font-bold text-primary-dark mt-1">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        {order.awbNumber && (
                          <p className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded mt-1 inline-block font-mono tracking-tighter border border-blue-100">
                            AWB: {order.awbNumber}
                          </p>
                        )}
                      </div>
                      <div className="ml-auto md:ml-6 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                        {order.status === "Delivered" ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : order.status === "Shipping" ? (
                          <Truck size={14} className="text-blue-500" />
                        ) : order.status === "Processing" ? (
                          <Package size={14} className="text-orange-500" />
                        ) : (
                          <Clock size={14} className="text-gray-400" />
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest 
                                                    ${
                                                      order.status ===
                                                      "Delivered"
                                                        ? "text-green-500"
                                                        : order.status ===
                                                            "Shipping"
                                                          ? "text-blue-500"
                                                          : order.status ===
                                                              "Processing"
                                                            ? "text-orange-500"
                                                            : "text-gray-500"
                                                    }`}
                        >
                          {order.status ||
                            (order.isDelivered ? "Delivered" : "Pending")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {order.orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex-shrink-0 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden mb-2">
                            <img
                              src={item.image}
                              className="w-full h-full object-cover"
                              alt={item.name}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-primary-dark line-clamp-1 w-20">
                            x{item.qty} {item.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end md:w-48 border-t md:border-t-0 md:border-l border-gray-50 pt-8 md:pt-0 md:pl-10">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold text-primary mt-1">
                        ₹{order.totalPrice.toLocaleString()}
                      </p>
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest mt-2 ${order.isPaid ? "text-green-500" : "text-orange-400"}`}
                      >
                        {order.isPaid ? "Payment Verified" : "Payment Pending"}
                      </p>
                    </div>
                    <Link
                      href={`/orders/${order._id}`}
                      className="mt-8 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors"
                    >
                      Order Details <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
