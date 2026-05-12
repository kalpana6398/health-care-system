import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/book/$doctorId")({
  component: BookPage,
});

const schema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  problem: z.string().trim().min(5).max(500),
});

function BookPage() {
  const { doctorId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { data: doctor } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").eq("id", doctorId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ date: fd.get("date"), time: fd.get("time"), problem: fd.get("problem") });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      patient_id: user!.id,
      doctor_id: doctorId,
      appointment_date: parsed.data.date,
      appointment_time: parsed.data.time,
      problem: parsed.data.problem,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Appointment requested!"); navigate({ to: "/appointments" }); }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Button asChild variant="ghost" className="mb-4"><Link to="/doctors/$doctorId" params={{ doctorId }}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link></Button>
        <h1 className="font-display text-3xl font-bold">Book appointment</h1>
        {doctor && <p className="mt-1 text-muted-foreground">with <strong>{doctor.name}</strong> · {doctor.specialization} · ${Number(doctor.fee).toFixed(0)}</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label htmlFor="date">Date</Label><Input id="date" name="date" type="date" min={today} required /></div>
            <div><Label htmlFor="time">Time</Label><Input id="time" name="time" type="time" required /></div>
          </div>
          <div>
            <Label htmlFor="problem">Describe your concern</Label>
            <Textarea id="problem" name="problem" rows={5} placeholder="Briefly describe symptoms or reason for visit" required maxLength={500} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">{loading ? "Booking..." : "Confirm appointment"}</Button>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}
