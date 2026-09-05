import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/store";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/admin";
import type { Database } from "@/integrations/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — ØRE admin" },
      { name: "description", content: "Review ØRE orders and update fulfilment and payment status." },
      { property: "og:title", content: "Orders — ØRE admin" },
      { property: "og:description", content: "Review ØRE orders and update fulfilment and payment status." },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();

  const orders = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,email,status,payment_status,total,created_at,order_items(id,product_name,variant_label,quantity,unit_price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async (v: { id: string; patch: { status?: OrderStatus; payment_status?: PaymentStatus } }) => {
      const { error } = await supabase.from("orders").update(v.patch).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">{orders.data?.length ?? 0} orders</p>
      </div>

      <div className="space-y-4">
        {(orders.data ?? []).map((o) => (
          <div key={o.id} className="rounded-sm border border-border/60 bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg">{o.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {o.email} · {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-lg">{formatPrice(Number(o.total))}</p>
            </div>

            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {o.order_items.map((i) => (
                <li key={i.id}>
                  {i.quantity} × {i.product_name}
                  {i.variant_label ? ` (${i.variant_label})` : ""} · {formatPrice(Number(i.unit_price))}
                </li>
              ))}
            </ul>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:max-w-md">
              <Select
                value={o.status}
                onValueChange={(v) => update.mutate({ id: o.id, patch: { status: v as OrderStatus } })}
              >
                <SelectTrigger aria-label="Order status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={o.payment_status}
                onValueChange={(v) => update.mutate({ id: o.id, patch: { payment_status: v as PaymentStatus } })}
              >
                <SelectTrigger aria-label="Payment status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        {orders.data?.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  );
}
