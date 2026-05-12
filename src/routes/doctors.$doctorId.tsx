import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, MapPin, Stethoscope, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/doctors/$doctorId")({
  component: DoctorDetail,
});

function DoctorDetail() {
  const { doctorId } = Route.useParams();
  const { data: d, isLoading } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").eq("id", doctorId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Button asChild variant="ghost" className="mb-6"><Link to="/doctors"><ArrowLeft className="mr-1 h-4 w-4" /> All doctors</Link></Button>
        {isLoading || !d ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-[320px_1fr]">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
              <div className="aspect-square bg-hero-gradient">
                {d.image_url ? (
                  <img src={d.image_url} alt={d.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-7xl font-bold text-primary/60">
                    {d.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="text-sm text-muted-foreground">Consultation fee</div>
                <div className="font-display text-3xl font-bold text-primary">${Number(d.fee).toFixed(0)}</div>
                <Button asChild className="mt-4 w-full bg-primary-gradient"><Link to="/book/$doctorId" params={{ doctorId: d.id }}>Book appointment</Link></Button>
              </div>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{d.name}</h1>
              <p className="mt-1 text-primary">{d.specialization}</p>
              <div className="mt-6 grid gap-3 text-sm">
                <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> {d.specialization}</div>
                <div className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> {d.experience_years} years experience</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {d.location || "Online consultations"}</div>
              </div>
              <div className="mt-8">
                <h2 className="font-display text-xl font-semibold">About</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{d.bio || "No bio provided."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
