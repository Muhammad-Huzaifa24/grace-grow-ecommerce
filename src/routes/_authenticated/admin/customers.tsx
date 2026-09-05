import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — ØRE admin" },
      { name: "description", content: "Browse registered ØRE customers and their contact details." },
      { property: "og:title", content: "Customers — ØRE admin" },
      { property: "og:description", content: "Browse registered ØRE customers and their contact details." },
    ],
  }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const customers = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const [profilesResult, rolesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,full_name,email,phone,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
      ]);
      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;

      const adminIds = new Set((rolesResult.data ?? []).map((role) => role.user_id));
      return (profilesResult.data ?? []).map((profile) => ({
        ...profile,
        isAdmin: adminIds.has(profile.id),
      }));
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl">Customers</h1>
        <p className="mt-2 text-sm text-muted-foreground">{customers.data?.length ?? 0} accounts</p>
      </div>
      <div className="overflow-x-auto rounded-sm border border-border/60 bg-card">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-border/60 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(customers.data ?? []).map((c) => (
              <tr key={c.id} className="border-b border-border/40 last:border-0">
                <td className="p-4">
                  {c.isAdmin ? (
                    <span className="relative inline-flex items-center overflow-hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/25 to-transparent" />
                      <span className="relative">{c.full_name ?? "—"}</span>
                    </span>
                  ) : (
                    <span>{c.full_name ?? "—"}</span>
                  )}
                </td>

                <td className="p-4">{c.email ?? "—"}</td>
                <td className="p-4">{c.phone ?? "—"}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
