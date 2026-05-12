import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/appointments")({
  component: MyAppointments,
});

const statusColor: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  accepted: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive",
  completed: "bg-primary-soft text-primary",
};

function MyAppointments() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["my-appts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, problem, doctor:doctors(name, specialization)")
        .eq("patient_id", user!.id)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">My Appointments</h1>
          <Button asChild className="bg-primary-gradient"><Link to="/doctors">Book new</Link></Button>
        </div>
        <div className="mt-6 space-y-3">
          {(data ?? []).length === 0 && (
            <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
              <CalendarDays className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 text-muted-foreground">No appointments yet. Book your first visit.</p>
              <Button asChild className="mt-4 bg-primary-gradient"><Link to="/doctors">Find a doctor</Link></Button>
            </div>
          )}
          {data?.map((a: any) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{a.doctor?.name}</h3>
                <p className="text-sm text-muted-foreground">{a.doctor?.specialization}</p>
                <p className="mt-1 text-sm">{a.appointment_date} at {a.appointment_time?.slice(0, 5)}</p>
                {a.problem && <p className="mt-1 text-sm text-muted-foreground">"{a.problem}"</p>}
              </div>
              <Badge className={statusColor[a.status]}>{a.status}</Badge>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
