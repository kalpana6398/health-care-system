import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setLoading(false);
    if ((res as any)?.error) toast.error((res as any).error.message || "Google sign-in failed");
  };

  const GoogleBtn = () => (
    <Button type="button" variant="outline" onClick={onGoogle} disabled={loading} className="w-full">
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
      Continue with Google
    </Button>
  );

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
