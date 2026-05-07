import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-card flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="h-full grid place-items-center text-center text-muted-foreground">
                  <div>
                    <ShoppingBag className="size-12 mx-auto mb-3 opacity-40" />
                    <p>Your cart is empty</p>
                  </div>
                </div>
              ) : (
                items.map((i) => (
                  <motion.div
                    key={i.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 p-3 rounded-2xl bg-muted/40"
                  >
                    {i.image_url && <img src={i.image_url} className="size-16 rounded-xl object-cover" alt={i.name} />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{i.name}</p>
                      <p className="text-sm text-primary font-bold">${i.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => setQty(i.id, i.quantity - 1)} className="size-7 rounded-full bg-background grid place-items-center hover:bg-muted"><Minus className="size-3.5" /></button>
                        <span className="font-medium w-5 text-center">{i.quantity}</span>
                        <button onClick={() => setQty(i.id, i.quantity + 1)} className="size-7 rounded-full bg-background grid place-items-center hover:bg-muted"><Plus className="size-3.5" /></button>
                      </div>
                    </div>
                    <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                  </motion.div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t p-5 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-foodie"
                  onClick={() => { onClose(); navigate({ to: "/checkout" }); }}
                >
                  Checkout
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
