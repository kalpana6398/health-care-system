import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/doctor")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isDoctor = (data ?? []).some((r) => r.role === "doctor");
    const isAdmin = (data ?? []).some((r) => r.role === "admin");
    if (!isDoctor && !isAdmin) throw redirect({ to: "/" });
  },
  component: DoctorDashboard,
});

const statusColor: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  accepted: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive",
  completed: "bg-primary-soft text-primary",
};

function DoctorDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: doctor } = useQuery({
    queryKey: ["my-doctor", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: appts } = useQuery({
    queryKey: ["doctor-appts", doctor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, problem")
        .eq("doctor_id", doctor!.id)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!doctor,
  });

  const setStatus = async (id: string, status: "accepted" | "rejected" | "completed") => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Appointment ${status}`); qc.invalidateQueries({ queryKey: ["doctor-appts"] }); }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Doctor Dashboard</h1>
        {!doctor ? (
          <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
            <p className="text-muted-foreground">No doctor profile linked to your account yet. Please ask an admin to create your doctor profile.</p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-muted-foreground">{doctor.name} · {doctor.specialization}</p>
            <div className="mt-8 space-y-3">
              <h2 className="font-display text-xl font-semibold">Your appointments</h2>
              {(appts ?? []).length === 0 && <p className="text-muted-foreground">No appointments yet.</p>}
              {appts?.map((a: any) => (
                <div key={a.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{a.appointment_date} at {a.appointment_time?.slice(0, 5)}</p>
                    <p className="text-sm text-muted-foreground">"{a.problem}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor[a.status]}>{a.status}</Badge>
                    {a.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "rejected")}><X className="h-4 w-4" /></Button>
                        <Button size="sm" className="bg-primary-gradient" onClick={() => setStatus(a.id, "accepted")}><Check className="h-4 w-4" /></Button>
                      </>
                    )}
                    {a.status === "accepted" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "completed")}>Mark completed</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
