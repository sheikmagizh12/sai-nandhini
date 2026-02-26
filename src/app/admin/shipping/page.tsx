"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, Save, Loader2, Package } from "lucide-react";
import toast from "react-hot-toast";

interface ShippingRate {
  _id?: string;
  minAmount: number;
  maxAmount: number;
  rate: number;
}

export default function ShippingManagementPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRate, setNewRate] = useState<ShippingRate>({
    minAmount: 0,
    maxAmount: 0,
    rate: 0,
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/admin/shipping-rates");
      const data = await res.json();
      setRates(data);
    } catch (error) {
      toast.error("Failed to load shipping rates");
    } finally {
      setLoading(false);
    }
  };

  const addRate = async () => {
    if (newRate.minAmount >= newRate.maxAmount) {
      toast.error("Min amount must be less than max amount");
      return;
    }
    if (newRate.rate <= 0) {
      toast.error("Rate must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRate),
      });

      if (res.ok) {
        toast.success("Shipping rate added successfully");
        setNewRate({ minAmount: 0, maxAmount: 0, rate: 0 });
        fetchRates();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add rate");
      }
    } catch (error) {
      toast.error("Failed to add shipping rate");
    } finally {
      setSaving(false);
    }
  };

  const deleteRate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping rate?")) return;

    try {
      const res = await fetch(`/api/admin/shipping-rates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Shipping rate deleted");
        fetchRates();
      } else {
        toast.error("Failed to delete rate");
      }
    } catch (error) {
      toast.error("Failed to delete shipping rate");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-dark rounded-[1rem] sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Truck className="text-white sm:w-8 sm:h-8" size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-serif font-black text-primary-dark leading-none">
                Shipping Manager
              </h1>
              <p className="text-gray-400 mt-2 font-medium text-[10px] sm:text-sm truncate">
                Set and maintain amount-based delivery rates.
              </p>
            </div>
          </div>
        </div>

        {/* Add New Rate Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-serif font-black text-primary-dark mb-6 flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            Add New Shipping Rate
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                Min Amount (₹)
              </label>
              <input
                type="number"
                step="1"
                value={newRate.minAmount}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    minAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-xl py-3.5 px-4 outline-none transition-all shadow-sm font-black text-base tabular-nums focus:bg-white focus:ring-4 focus:ring-primary/5 touch-manipulation"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                Max Amount (₹)
              </label>
              <input
                type="number"
                step="1"
                value={newRate.maxAmount}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    maxAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-xl py-3.5 px-4 outline-none transition-all shadow-sm font-black text-base tabular-nums focus:bg-white focus:ring-4 focus:ring-primary/5 touch-manipulation"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                Rate (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={newRate.rate}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    rate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-xl py-3.5 px-4 outline-none transition-all shadow-sm font-black text-base tabular-nums focus:bg-white focus:ring-4 focus:ring-primary/5 touch-manipulation"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={addRate}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation text-xs uppercase tracking-widest"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Plus size={18} />
                    Add Rate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Rates */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-serif font-black text-primary-dark mb-6 flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Current Shipping Rates
          </h2>

          {rates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Truck size={48} className="mx-auto mb-4 opacity-30" />
              <p>No shipping rates configured yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rates.map((rate) => (
                <div
                  key={rate._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-primary/30 transition-all gap-4"
                >
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1.5 leading-none">
                        Order Range
                      </p>
                      <p className="text-[13px] sm:text-lg font-black text-primary-dark tabular-nums truncate">
                        ₹{rate.minAmount} - ₹{rate.maxAmount}
                      </p>
                    </div>
                    <div className="hidden sm:block h-10 w-px bg-gray-50" />
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1.5 leading-none">
                        Ship Rate
                      </p>
                      <p className="text-lg sm:text-2xl font-serif font-black text-primary tabular-nums">
                        ₹{rate.rate}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteRate(rate._id!)}
                    className="self-end sm:self-auto text-red-500 hover:text-red-700 hover:bg-red-50 p-2.5 sm:p-3 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:outline-none touch-manipulation"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
