import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Health Care System" }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl font-bold">We're here to help</h1>
          <p className="mt-3 text-muted-foreground">Reach our patient support team any time, any day.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 md:grid-cols-3">
        {[
          { icon: Mail, title: "Email", value: "support@healthcaresystem.health" },
          { icon: Phone, title: "Phone", value: "+1 (800) 555-0199" },
          { icon: MapPin, title: "Office", value: "100 Wellness Ave, NY" },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border bg-card p-6 text-center shadow-soft">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary"><c.icon className="h-6 w-6" /></div>
            <h3 className="mt-4 font-display font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.value}</p>
          </div>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
