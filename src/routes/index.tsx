import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, Search, ShieldCheck, Stethoscope, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DoctorCard, type DoctorRow } from "@/components/doctor-card";
import heroImage from "@/assets/hero-doctor.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "MediCare — Book trusted doctors online" }] }),
  component: HomePage,
});

const features = [
  { icon: Search, title: "Find specialists", desc: "Browse verified doctors by specialty, location, and experience." },
  { icon: CalendarCheck, title: "Book in seconds", desc: "Pick a date and time that works — confirmation in real time." },
  { icon: ShieldCheck, title: "Private & secure", desc: "Your health data is encrypted and never shared without consent." },
];

function HomePage() {
  const { data: doctors } = useQuery({
    queryKey: ["featured-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").limit(3);
      if (error) throw error;
      return data as DoctorRow[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-success" /> 24/7 patient support
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Healthcare made <span className="text-primary">human</span>, again.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Discover trusted doctors, view profiles, and book appointments online — all in one calm, modern place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary-gradient">
                <Link to="/doctors">Find a doctor <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Create account</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm">
              <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> <span><strong>10k+</strong> happy patients</span></div>
              <div className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" /> <span><strong>200+</strong> specialists</span></div>
              <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> <span><strong>2 min</strong> booking</span></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
            <img src={heroImage} alt="Friendly doctor" width={1280} height={1280} className="relative aspect-square w-full rounded-3xl object-cover shadow-card" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary"><f.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Featured doctors</h2>
            <p className="mt-1 text-muted-foreground">Hand-picked specialists available this week.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/doctors">See all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors?.map((d) => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
