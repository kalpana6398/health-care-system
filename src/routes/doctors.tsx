import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DoctorCard, type DoctorRow } from "@/components/doctor-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/doctors")({
  head: () => ({ meta: [{ title: "Find Doctors — Health Care System" }, { name: "description", content: "Browse and search verified doctors by name, specialty, or location." }] }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState<string>("all");

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as DoctorRow[];
    },
  });

  const specialties = useMemo(() => {
    const s = new Set((doctors ?? []).map((d) => d.specialization));
    return ["all", ...Array.from(s)];
  }, [doctors]);

  const filtered = (doctors ?? []).filter((d) => {
    const matchQ = q === "" || `${d.name} ${d.specialization} ${d.location}`.toLowerCase().includes(q.toLowerCase());
    const matchS = spec === "all" || d.specialization === spec;
    return matchQ && matchS;
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Find your doctor</h1>
          <p className="mt-2 text-muted-foreground">Search by name, specialty, or location.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors..." className="h-12 pl-10" />
            </div>
            <Select value={spec} onValueChange={setSpec}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>{specialties.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All specialties" : s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {isLoading ? (
          <p className="text-muted-foreground">Loading doctors...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">No doctors match your search.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
