import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, Menu, X, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { user, isAdmin, isDoctor, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const navLinks = (
    <>
      <Link to="/" className="text-sm font-medium hover:text-primary transition" activeProps={{ className: "text-primary" }}>Home</Link>
      <Link to="/doctors" className="text-sm font-medium hover:text-primary transition" activeProps={{ className: "text-primary" }}>Doctors</Link>
      <Link to="/contact" className="text-sm font-medium hover:text-primary transition" activeProps={{ className: "text-primary" }}>Contact</Link>
      {user && <Link to="/appointments" className="text-sm font-medium hover:text-primary transition" activeProps={{ className: "text-primary" }}>My Appointments</Link>}
      {isDoctor && <Link to="/doctor" className="text-sm font-medium hover:text-primary transition" activeProps={{ className: "text-primary" }}>Doctor Panel</Link>}
      {isAdmin && <Link to="/admin" className="text-sm font-medium hover:text-primary transition" activeProps={{ className: "text-primary" }}>Admin</Link>}
      <Link to="/download" className="text-sm font-medium hover:text-primary transition flex items-center gap-1" activeProps={{ className: "text-primary" }}><Download className="h-3.5 w-3.5" /> Download</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-gradient text-primary-foreground shadow-soft">
            <Heart className="h-5 w-5" fill="currentColor" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Health Care System</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">{navLinks}</nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/auth">Login</Link></Button>
              <Button size="sm" asChild className="bg-primary-gradient"><Link to="/auth" search={{ tab: "register" }}>Get started</Link></Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="flex flex-col gap-3 px-4 py-4" onClick={() => setOpen(false)}>
            {navLinks}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button variant="outline" size="sm" onClick={handleSignOut} className="flex-1"><LogOut className="mr-1 h-4 w-4" /> Sign out</Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="flex-1"><Link to="/auth">Login</Link></Button>
                  <Button size="sm" asChild className="flex-1 bg-primary-gradient"><Link to="/auth">Sign up</Link></Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
