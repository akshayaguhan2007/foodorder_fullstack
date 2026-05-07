import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ChefHat, Clock, Bike, PackageCheck } from "lucide-react";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items_json: { name: string; quantity: number; price: number }[];
};

const STATUSES = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
const ICONS: Record<string, any> = {
  Pending: Clock, Preparing: ChefHat, "Out for Delivery": Bike, Delivered: PackageCheck,
};

export const Route = createFileRoute("/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setOrders(data as any); });
    const ch = supabase
      .channel("user-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, (payload) => {
        setOrders((curr) => {
          if (payload.eventType === "INSERT") return [payload.new as any, ...curr];
          if (payload.eventType === "UPDATE") return curr.map((o) => o.id === (payload.new as any).id ? (payload.new as any) : o);
          return curr;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  if (authLoading) return null;
  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Sign in to see your orders</h1>
        <Link to="/auth" className="inline-block mt-6 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium">Sign in</Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <p className="text-muted-foreground text-sm mt-1">Live status updates from the kitchen</p>
      <div className="mt-6 space-y-4">
        <AnimatePresence>
          {orders.map((o) => {
            const idx = STATUSES.indexOf(o.status);
            return (
              <motion.div
                key={o.id} layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-3xl p-5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="font-bold text-lg">${Number(o.total).toFixed(2)}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">{o.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {STATUSES.map((s, i) => {
                    const Icon = ICONS[s];
                    const active = i <= idx;
                    return (
                      <div key={s} className="flex flex-col items-center gap-1.5">
                        <motion.div
                          animate={{ scale: i === idx ? [1, 1.15, 1] : 1 }}
                          transition={{ repeat: i === idx ? Infinity : 0, duration: 1.6 }}
                          className={`size-10 rounded-2xl grid place-items-center transition ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          {active && i === idx ? <Icon className="size-5" /> : active ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                        </motion.div>
                        <span className="text-[10px] text-center text-muted-foreground">{s}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                  {(o.items_json || []).map((i) => `${i.name} ×${i.quantity}`).join(" · ")}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {orders.length === 0 && <p className="text-center text-muted-foreground py-12">No orders yet</p>}
      </div>
    </main>
  );
}
