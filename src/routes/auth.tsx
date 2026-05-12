import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as string) === "register" ? "register" : "login" }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const registerSchema = loginSchema.extend({
  fullName: z.string().min(2).max(80),
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate({ to: "/" }); }
  };

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({ email: fd.get("email"), password: fd.get("password"), fullName: fd.get("fullName") });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created!"); navigate({ to: "/" }); }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Welcome to Health Care System</h1>
        <p className="mt-2 text-muted-foreground">Login or create an account to book appointments.</p>
        <Tabs defaultValue={tab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={onLogin} className="mt-4 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
              <div><Label htmlFor="le">Email</Label><Input id="le" name="email" type="email" required /></div>
              <div><Label htmlFor="lp">Password</Label><Input id="lp" name="password" type="password" required /></div>
              <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">{loading ? "Signing in..." : "Sign in"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={onRegister} className="mt-4 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
              <div><Label htmlFor="rn">Full name</Label><Input id="rn" name="fullName" required /></div>
              <div><Label htmlFor="re">Email</Label><Input id="re" name="email" type="email" required /></div>
              <div><Label htmlFor="rp">Password</Label><Input id="rp" name="password" type="password" required minLength={6} /></div>
              <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">{loading ? "Creating..." : "Create account"}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      <SiteFooter />
    </div>
  );
}
