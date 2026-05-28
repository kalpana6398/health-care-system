import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Check, Stethoscope, Trash2, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    if (!(data ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/" });
  },
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: doctors } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: async () => (await supabase.from("doctors").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: appts } = useQuery({
    queryKey: ["admin-appts"],
    queryFn: async () => (await supabase.from("appointments").select("id, appointment_date, appointment_time, status, problem, patient_id, doctor:doctors(name, specialization)").order("appointment_date", { ascending: false })).data ?? [],
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const stats = [
    { label: "Patients", value: profiles?.length ?? 0, icon: Users },
    { label: "Doctors", value: doctors?.length ?? 0, icon: Stethoscope },
    { label: "Appointments", value: appts?.length ?? 0, icon: CalendarCheck },
  ];

  const onSaveDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      specialization: String(fd.get("specialization") || "").trim(),
      experience_years: Number(fd.get("experience_years") || 0),
      location: String(fd.get("location") || "").trim(),
      fee: Number(fd.get("fee") || 0),
      bio: String(fd.get("bio") || ""),
    };
    if (!payload.name || !payload.specialization) { toast.error("Name and specialization required"); return; }
    const { error } = editingId
      ? await supabase.from("doctors").update(payload).eq("id", editingId)
      : await supabase.from("doctors").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Doctor updated" : "Doctor added");
    setEditingId(null);
    (e.target as HTMLFormElement).reset();
    qc.invalidateQueries({ queryKey: ["admin-doctors"] });
  };

  const deleteDoctor = async (id: string) => {
    if (!confirm("Delete this doctor?")) return;
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-doctors"] }); }
  };

  const updateFee = async (id: string, fee: number) => {
    const { error } = await supabase.from("doctors").update({ fee }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Price updated"); qc.invalidateQueries({ queryKey: ["admin-doctors"] }); }
  };

  const editing = doctors?.find((d: any) => d.id === editingId);

  const updateApptStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Appointment ${status}`); qc.invalidateQueries({ queryKey: ["admin-appts"] }); }
  };
  const deleteAppt = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-appts"] }); }
  };
  const patientById = (id: string) => profiles?.find((p: any) => p.id === id);

  const filteredAppts = (appts ?? []).filter((a: any) => statusFilter === "all" || a.status === statusFilter);
  const statusCounts = {
    all: appts?.length ?? 0,
    pending: appts?.filter((a: any) => a.status === "pending").length ?? 0,
    accepted: appts?.filter((a: any) => a.status === "accepted").length ?? 0,
    rejected: appts?.filter((a: any) => a.status === "rejected").length ?? 0,
    completed: appts?.filter((a: any) => a.status === "completed").length ?? 0,
  };
  const statusBadge: Record<string, string> = {
    pending: "bg-warning/20 text-warning-foreground",
    accepted: "bg-success/20 text-success",
    rejected: "bg-destructive/20 text-destructive",
    completed: "bg-primary-soft text-primary",
  };


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary"><s.icon className="h-6 w-6" /></div>
              <div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="font-display text-2xl font-bold">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="doctors" className="mt-8">
          <TabsList>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {doctors?.map((d: any) => (
                <div key={d.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-soft md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-sm text-muted-foreground">{d.specialization} · {d.location || "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={d.fee} className="w-24" onBlur={(e) => { const v = Number(e.target.value); if (v !== Number(d.fee)) updateFee(d.id, v); }} />
                    <Button size="sm" variant="outline" onClick={() => setEditingId(d.id)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteDoctor(d.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={onSaveDoctor} key={editingId ?? "new"} className="space-y-3 rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-display font-semibold">{editingId ? "Edit doctor" : "Add doctor"}</h3>
              <div><Label>Name</Label><Input name="name" defaultValue={editing?.name} required /></div>
              <div><Label>Specialization</Label><Input name="specialization" defaultValue={editing?.specialization} required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Experience (yrs)</Label><Input name="experience_years" type="number" defaultValue={editing?.experience_years ?? 0} /></div>
                <div><Label>Fee ($)</Label><Input name="fee" type="number" defaultValue={editing?.fee ?? 0} /></div>
              </div>
              <div><Label>Location</Label><Input name="location" defaultValue={editing?.location} /></div>
              <div><Label>Bio</Label><Textarea name="bio" rows={3} defaultValue={editing?.bio ?? ""} /></div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-primary-gradient">{editingId ? "Save" : "Add doctor"}</Button>
                {editingId && <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="appointments" className="mt-4 space-y-2">
            {appts?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-soft">
                <div>
                  <div className="font-medium">{a.doctor?.name ?? "—"}</div>
                  <div className="text-sm text-muted-foreground">{a.appointment_date}</div>
                </div>
                <Badge>{a.status}</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="users" className="mt-4 space-y-2">
            {profiles?.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-soft">
                <div>
                  <div className="font-medium">{p.full_name || "Unnamed"}</div>
                  <div className="text-xs text-muted-foreground">{p.id}</div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <SiteFooter />
    </div>
  );
}
