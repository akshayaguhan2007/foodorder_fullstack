import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Foodie" },
      { name: "description", content: "Get in touch with Foodie. Questions about your order, partnerships, or feedback — we'd love to hear from you." },
      { property: "og:title", content: "Contact — Foodie" },
      { property: "og:description", content: "Get in touch with the Foodie team." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const info = [
    { icon: Mail, label: "Email", value: "hello@foodie.app" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { icon: MapPin, label: "Address", value: "123 Flavor Street, Food City" },
    { icon: Clock, label: "Hours", value: "Mon–Sun · 10:00 – 23:00" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 pb-28 md:pb-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-semibold tracking-wide mb-4">GET IN TOUCH</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">We'd love to hear from you</h1>
        <p className="text-muted-foreground mt-3">Questions, feedback, partnership ideas — drop us a line and our team will reply within one business day.</p>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-6 md:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-3"
        >
          {info.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="glass rounded-2xl p-5 flex items-start gap-4"
            >
              <span className="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <it.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</p>
                <p className="font-medium mt-0.5">{it.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="md:col-span-3 glass rounded-3xl p-6 md:p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="mt-1.5" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="mt-1.5" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={150} className="mt-1.5" />
            {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} className="mt-1.5 resize-none" />
            <div className="flex justify-between mt-1">
              {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : <span />}
              <p className="text-xs text-muted-foreground">{form.message.length}/1000</p>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-full text-base font-semibold shadow-foodie">
              <Send className="size-4 mr-2" />
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </main>
  );
}
