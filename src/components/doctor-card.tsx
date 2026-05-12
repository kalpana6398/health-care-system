import { Link } from "@tanstack/react-router";
import { MapPin, Stethoscope, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DoctorRow {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  location: string;
  fee: number;
  image_url: string | null;
}

const initials = (name: string) =>
  name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

export function DoctorCard({ doctor }: { doctor: DoctorRow }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-card">
      <div className="relative h-48 bg-hero-gradient">
        {doctor.image_url ? (
          <img src={doctor.image_url} alt={doctor.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl font-bold text-primary/60">
            {initials(doctor.name)}
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary shadow-soft">
          ${Number(doctor.fee).toFixed(0)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold">{doctor.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Stethoscope className="h-4 w-4 text-primary" /> {doctor.specialization}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-primary" /> {doctor.experience_years} yrs experience
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> {doctor.location || "Online"}
        </div>
        <div className="mt-auto flex gap-2 pt-3">
          <Button asChild variant="outline" className="flex-1"><Link to="/doctors/$doctorId" params={{ doctorId: doctor.id }}>View</Link></Button>
          <Button asChild className="flex-1 bg-primary-gradient"><Link to="/book/$doctorId" params={{ doctorId: doctor.id }}>Book</Link></Button>
        </div>
      </div>
    </div>
  );
}
