import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type Order = { id: string; user_id: string; total: number; status: string; created_at: string; items_json: any };
type Product = { id: string; name: string; description: string | null; price: number; image_url: string | null; category: string; is_available: boolean };

const STATUSES = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"orders" | "menu">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => { if (data) setOrders(data as any); });
    supabase.from("products").select("*").order("created_at").then(({ data }) => { if (data) setProducts(data as any); });

    const o = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (p) => {
      setOrders((c) => {
        if (p.eventType === "INSERT") { toast.success("New order received!"); return [p.new as any, ...c]; }
        if (p.eventType === "UPDATE") return c.map((x) => x.id === (p.new as any).id ? p.new as any : x);
        if (p.eventType === "DELETE") return c.filter((x) => x.id !== (p.old as any).id);
        return c;
      });
    }).subscribe();
    const pr = supabase.channel("admin-products").on("postgres_changes", { event: "*", schema: "public", table: "products" }, (p) => {
      setProducts((c) => {
        if (p.eventType === "INSERT") return [...c, p.new as any];
        if (p.eventType === "UPDATE") return c.map((x) => x.id === (p.new as any).id ? p.new as any : x);
        if (p.eventType === "DELETE") return c.filter((x) => x.id !== (p.old as any).id);
        return c;
      });
    }).subscribe();
    return () => { supabase.removeChannel(o); supabase.removeChannel(pr); };
  }, [isAdmin]);

  const stats = useMemo(() => {
    const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + Number(o.total), 0);
    return { revenue, count: orders.length, avg: orders.length ? revenue / orders.length : 0 };
  }, [orders]);

  if (loading) return null;
  if (!user) return <main className="p-8 text-center"><p>Please <Link to="/auth" className="underline">sign in</Link></p></main>;
  if (!isAdmin) return (
    <main className="max-w-xl mx-auto p-8 text-center space-y-4">
      <h1 className="text-2xl font-bold">Admin Access Required</h1>
      <p className="text-muted-foreground text-sm">If no admin exists yet, you can claim the role for your account.</p>
      <Button
        onClick={async () => {
          const { data, error } = await supabase.rpc("claim_admin");
          if (error) return toast.error(error.message);
          if (data) { toast.success("You are now admin! Reloading…"); setTimeout(() => location.reload(), 700); }
          else toast.error("An admin already exists.");
        }}
      >Make me admin</Button>
    </main>
  );

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Status updated");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold">Command Center</h1>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
        <Stat icon={DollarSign} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
        <Stat icon={ShoppingBag} label="Orders" value={String(stats.count)} />
        <Stat icon={TrendingUp} label="Avg Order" value={`$${stats.avg.toFixed(2)}`} />
      </div>

      <div className="mt-6 inline-flex gap-1 p-1 bg-muted rounded-2xl">
        {(["orders", "menu"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize ${tab === t ? "bg-card shadow" : ""}`}>{t}</button>
        ))}
      </div>

      {tab === "orders" ? (
        <div className="mt-5 space-y-3">
          <AnimatePresence>
            {orders.map((o) => (
              <motion.div key={o.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="font-bold text-lg">${Number(o.total).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {(o.items_json || []).map((i: any) => `${i.name}×${i.quantity}`).join(", ")}
                  </p>
                </div>
                <select
                  value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="h-10 px-3 rounded-xl bg-muted border-0 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </motion.div>
            ))}
          </AnimatePresence>
          {orders.length === 0 && <p className="text-center py-12 text-muted-foreground">No orders yet</p>}
        </div>
      ) : (
        <MenuAdmin products={products} />
      )}
    </main>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-card border rounded-2xl p-4 sm:p-5">
      <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3"><Icon className="size-5" /></div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl sm:text-2xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

function MenuAdmin({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const toggle = async (p: Product) => {
    await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id);
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted");
  };
  const save = async () => {
    if (!editing?.name || !editing?.category || editing?.price == null) { toast.error("Fill all fields"); return; }
    const payload = {
      name: editing.name, description: editing.description ?? null, price: Number(editing.price),
      category: editing.category, image_url: editing.image_url ?? null, is_available: editing.is_available ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null);
  };

  return (
    <div className="mt-5">
      <Button onClick={() => setEditing({ is_available: true })} className="rounded-2xl bg-primary hover:bg-primary/90"><Plus className="size-4 mr-1" />Add Item</Button>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.id} className="bg-card border rounded-2xl p-3 flex gap-3">
            {p.image_url && <img src={p.image_url} className="size-20 rounded-xl object-cover" alt={p.name} />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.name}</p>
              <p className="text-sm text-primary font-bold">${Number(p.price).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => toggle(p)}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${p.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {p.is_available ? "Available" : "Sold out"}
                </button>
                <button onClick={() => setEditing(p)} className="text-muted-foreground hover:text-foreground"><Pencil className="size-4" /></button>
                <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditing(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed z-50 inset-x-4 top-20 max-w-md mx-auto bg-card border rounded-3xl p-6 space-y-3">
              <h2 className="text-xl font-bold">{editing.id ? "Edit" : "New"} item</h2>
              <input className="w-full h-11 px-4 rounded-xl bg-muted/50 border" placeholder="Name"
                value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <input className="w-full h-11 px-4 rounded-xl bg-muted/50 border" placeholder="Description"
                value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <input type="number" step="0.01" className="w-full h-11 px-4 rounded-xl bg-muted/50 border" placeholder="Price"
                value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              <input className="w-full h-11 px-4 rounded-xl bg-muted/50 border" placeholder="Category"
                value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              <input className="w-full h-11 px-4 rounded-xl bg-muted/50 border" placeholder="Image URL"
                value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <Button onClick={save} className="flex-1 rounded-xl bg-primary hover:bg-primary/90">Save</Button>
                <Button variant="ghost" onClick={() => setEditing(null)} className="rounded-xl">Cancel</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
