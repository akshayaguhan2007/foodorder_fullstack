import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (items.length === 0) return;
    setLoading(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      total: total(),
      status: "Pending",
      items_json: items as any,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    clear();
    toast.success("Order placed!");
    navigate({ to: "/orders" });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold">Checkout</motion.h1>
      <div className="mt-6 bg-card border rounded-3xl p-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground">Your cart is empty.</p>
        ) : (
          <>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span>{i.name} × {i.quantity}</span>
                <span className="font-medium">${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span><span>${total().toFixed(2)}</span>
            </div>
            <Button
              onClick={placeOrder} disabled={loading}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-foodie"
            >
              {loading ? "Placing..." : user ? "Place Order" : "Sign in to order"}
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
