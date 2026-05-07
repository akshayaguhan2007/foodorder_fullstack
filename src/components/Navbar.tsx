import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, ShoppingBag, ReceiptText, LayoutDashboard, LogIn, LogOut, UtensilsCrossed, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/store/cart";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Navbar({ onCartClick }: { onCartClick: () => void }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const count = useCart((s) => s.count());

  const links = [
    { to: "/", label: "Menu", icon: Home },
    { to: "/orders", label: "Orders", icon: ReceiptText },
    { to: "/contact", label: "Contact", icon: Mail },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: LayoutDashboard }] : []),
  ];

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:block sticky top-0 z-40 glass border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="size-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-foodie">
              <UtensilsCrossed className="size-5" />
            </span>
            Foodie
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = loc.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? "bg-foreground text-background" : "hover:bg-muted"}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={onCartClick}
              className="relative px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-foodie hover:opacity-90 transition flex items-center gap-2"
            >
              <ShoppingBag className="size-4" />
              Cart
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 size-5 rounded-full bg-accent text-accent-foreground text-xs font-bold grid place-items-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={logout}><LogOut className="size-4" /></Button>
            ) : (
              <Link to="/auth" className="px-4 py-2 rounded-full text-sm font-medium hover:bg-muted">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 glass border-b border-border/60">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <UtensilsCrossed className="size-4" />
            </span>
            Foodie
          </Link>
          <button onClick={onCartClick} className="relative p-2">
            <ShoppingBag className="size-6" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60">
        <div className="flex px-2 py-2 [&>*]:flex-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = loc.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-xs ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                <Icon className="size-5" />
                {l.label}
              </Link>
            );
          })}
          {user ? (
            <button onClick={logout} className="flex flex-col items-center gap-0.5 py-1.5 text-xs text-muted-foreground">
              <LogOut className="size-5" />
              Logout
            </button>
          ) : (
            <Link to="/auth" className="flex flex-col items-center gap-0.5 py-1.5 text-xs text-muted-foreground">
              <LogIn className="size-5" />
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
