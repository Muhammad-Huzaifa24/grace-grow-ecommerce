import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/account" }, replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="mx-auto max-w-5xl px-5 py-24 text-sm text-muted-foreground">Loading…</div>;
  }

  return <Outlet />;
}
