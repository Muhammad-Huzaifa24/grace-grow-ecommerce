import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — ØRE" },
      { name: "description", content: "Overview of ØRE catalogue, orders and revenue." },
      { property: "og:title", content: "Admin dashboard — ØRE" },
      { property: "og:description", content: "Overview of ØRE catalogue, orders and revenue." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [products, orders, customers] = await Promise.all([
        supabase.from("products").select("id,name,is_active,stock"),
        supabase.from("orders").select("id,order_number,total,status,created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id"),
      ]);
      if (products.error) throw products.error;
      if (orders.error) throw orders.error;
      if (customers.error) throw customers.error;
      const orderRows = orders.data ?? [];
      return {
        products: products.data ?? [],
        orders: orderRows,
        customers: customers.data?.length ?? 0,
        revenue: orderRows.reduce((sum, o) => sum + Number(o.total), 0),
      };
    },
  });

  const d = stats.data;
  const cards = [
    { label: "Products", value: d ? String(d.products.length) : "—" },
    { label: "Published", value: d ? String(d.products.filter((p) => p.is_active).length) : "—" },
    { label: "Orders", value: d ? String(d.orders.length) : "—" },
    { label: "Revenue", value: d ? formatPrice(d.revenue) : "—" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">{d ? `${d.customers} registered customers` : "Loading…"}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-sm border border-border/60 bg-card p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
            <p className="mt-3 text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-sm border border-border/60 bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Latest orders</h2>
          <Link to="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">
            Manage orders
          </Link>
        </div>
        <ul className="mt-4 space-y-3 text-sm">
          {(d?.orders ?? []).slice(0, 6).map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4">
              <span>{o.order_number}</span>
              <span className="text-muted-foreground">{o.status}</span>
              <span>{formatPrice(Number(o.total))}</span>
            </li>
          ))}
          {d && d.orders.length === 0 && <li className="text-muted-foreground">No orders yet.</li>}
        </ul>
      </section>

      <section className="rounded-sm border border-border/60 bg-card p-6">
        <h2 className="text-xl">Low stock</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {(d?.products ?? []).filter((p) => p.stock <= 5).length === 0 && <li>Everything is well stocked.</li>}
          {(d?.products ?? [])
            .filter((p) => p.stock <= 5)
            .map((p) => (
              <li key={p.id}>{p.name} · {p.stock} left</li>
            ))}
        </ul>
      </section>
    </div>
  );
}
