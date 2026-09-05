import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { useIsAdmin } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/banners", label: "Banners" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function AdminLayout() {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return <div className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <h1 className="text-3xl">Not authorised</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is reserved for store administrators.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm underline">
          Back to the store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Store admin</p>
      <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-border/60 pb-4 text-sm text-muted-foreground">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item }}
            activeProps={{ className: "text-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  );
}
