import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof search['redirect'] === "string" ? search['redirect'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — ØRE" },
      {
        name: "description",
        content: "Sign in to your ØRE account to check out faster and follow your orders.",
      },
      { property: "og:title", content: "Sign in — ØRE" },
      { property: "og:description", content: "Access your ØRE account and order history." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { redirect } = Route.useSearch();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) navigate({ to: redirect === "/checkout" ? "/checkout" : "/account", replace: true });
  }, [user, redirect, navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back");
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: { full_name: String(form.get("full_name") ?? "") },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — check your email if confirmation is required.");
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-center text-4xl">Your account</h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Sign in to check out faster and follow your orders.
      </p>

      <Tabs defaultValue="signin" className="mt-10">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={signIn} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="si-email">Email</Label>
              <Input id="si-email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-password">Password</Label>
              <Input
                id="si-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Sign in
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={signUp} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="su-name">Full name</Label>
              <Input id="su-name" name="full_name" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-email">Email</Label>
              <Input id="su-email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-password">Password</Label>
              <Input
                id="su-password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Create account
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
