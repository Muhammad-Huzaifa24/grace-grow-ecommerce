import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { formatPrice } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — ØRE" },
      { name: "description", content: "Manage your ØRE profile details and review recent orders." },
      { property: "og:title", content: "My account — ØRE" },
      { property: "og:description", content: "Manage your ØRE profile and orders." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = React.useState(false);

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name,email,phone")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const recent = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,status,total,created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(form.get("full_name") ?? ""),
        phone: String(form.get("phone") ?? ""),
      })
      .eq("id", user!.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true, search: {} });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-4xl">My account</h1>
      <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>

      <form onSubmit={save} className="mt-10 space-y-4 rounded-sm border border-border/60 bg-card p-6">
        <h2 className="text-xl">Profile</h2>
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.data?.full_name ?? ""} key={profile.data?.full_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={profile.data?.phone ?? ""} key={profile.data?.phone} />
        </div>
        <Button type="submit" disabled={saving}>
          Save changes
        </Button>
      </form>

      <section className="mt-10 rounded-sm border border-border/60 bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Recent orders</h2>
          <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <Separator className="my-4" />
        {recent.data && recent.data.length > 0 ? (
          <ul className="space-y-3 text-sm">
            {recent.data.map((o) => (
              <li key={o.id} className="flex items-center justify-between">
                <Link to="/orders/$orderId" params={{ orderId: o.id }} className="hover:underline">
                  {o.order_number}
                </Link>
                <span className="text-muted-foreground">{o.status}</span>
                <span>{formatPrice(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
      </section>

      <Button variant="outline" className="mt-10" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
