import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
};

export const Route = createFileRoute("/")({
  component: MenuPage,
});

function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("products").select("*").order("created_at").then(({ data }) => {
      if (data) setProducts(data as Product[]);
    });
    const channel = supabase
      .channel("products-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        setProducts((curr) => {
          if (payload.eventType === "INSERT") return [...curr, payload.new as Product];
          if (payload.eventType === "UPDATE") return curr.map((p) => (p.id === (payload.new as Product).id ? (payload.new as Product) : p));
          if (payload.eventType === "DELETE") return curr.filter((p) => p.id !== (payload.old as Product).id);
          return curr;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = products.filter((p) => {
    const cat = category === "All" || p.category === category;
    const s = p.name.toLowerCase().includes(search.toLowerCase());
    return cat && s;
  });

  const handleAdd = (p: Product) => {
    add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
    setAdded(p.id);
    toast.success(`Added ${p.name}`);
    setTimeout(() => setAdded((id) => (id === p.id ? null : id)), 700);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-14 mb-8 bg-gradient-to-br from-primary to-[oklch(0.7_0.18_45)] text-primary-foreground shadow-foodie"
      >
        <div className="absolute -right-10 -top-10 size-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-xl">
          <p className="text-sm font-medium opacity-80">Live kitchen, hot from the pan</p>
          <h1 className="mt-2 text-4xl sm:text-6xl font-bold tracking-tight">Crave it. Tap it. Eat it.</h1>
          <p className="mt-3 text-base sm:text-lg opacity-90">Real-time orders, curated menu, zero friction.</p>
        </div>
      </motion.section>

      {/* Search + categories */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="w-full pl-12 pr-4 h-12 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${category === c ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-muted border-border"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence>
          {filtered.map((p, i) => (
            <motion.article
              key={p.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="group bg-card rounded-3xl overflow-hidden border hover:shadow-foodie transition"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                )}
                {!p.is_available && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm grid place-items-center">
                    <span className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold">SOLD OUT</span>
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur">{p.category}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-lg">${Number(p.price).toFixed(2)}</span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    disabled={!p.is_available}
                    onClick={() => handleAdd(p)}
                    className="size-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-foodie disabled:opacity-40 disabled:shadow-none"
                  >
                    <AnimatePresence mode="wait">
                      {added === p.id ? (
                        <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="size-5" /></motion.span>
                      ) : (
                        <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Plus className="size-5" /></motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-16">No dishes found.</p>
      )}
    </main>
  );
}
