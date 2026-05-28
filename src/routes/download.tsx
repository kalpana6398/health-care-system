import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft, FileArchive, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/download")({
  head: () => ({ meta: [{ title: "Download Project — Health Care System" }] }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-md w-full text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary-gradient text-primary-foreground shadow-card mb-6">
            <FileArchive className="h-10 w-10" />
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight">
            Download Project
          </h1>
          <p className="mt-3 text-muted-foreground">
            Get your complete Health Care System project as a ZIP file. Ready to use instantly.
          </p>

          <div className="mt-8 rounded-2xl border bg-card p-6 shadow-soft text-left space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Full source code</p>
                <p className="text-xs text-muted-foreground">All components, routes, and styles included</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Database migrations</p>
                <p className="text-xs text-muted-foreground">Supabase schema and seed files</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Ready to deploy</p>
                <p className="text-xs text-muted-foreground">Just extract and run bun install</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button asChild size="lg" className="bg-primary-gradient w-full">
              <a href="/api/public/download" download="healthcare-project.zip">
                <Download className="mr-2 h-5 w-5" /> Download ZIP
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
