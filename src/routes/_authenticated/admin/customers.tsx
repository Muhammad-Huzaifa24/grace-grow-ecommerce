import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,email,phone,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
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
                <td className="p-4">{c.full_name ?? "—"}</td>
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
