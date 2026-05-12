import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-gradient text-primary-foreground"><Heart className="h-5 w-5" fill="currentColor" /></span>
            <span className="font-display text-lg font-bold">MediCare</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Trusted healthcare, personal care. Book appointments with verified doctors anytime.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/doctors" className="hover:text-primary">Find Doctors</Link></li>
            <li><Link to="/appointments" className="hover:text-primary">My Appointments</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Specialties</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Cardiology</li><li>Dermatology</li><li>Pediatrics</li><li>Neurology</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>support@medicare.health</li>
            <li>+1 (800) 555-0199</li>
            <li>24/7 Patient Support</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} MediCare. All rights reserved.</div>
    </footer>
  );
}
