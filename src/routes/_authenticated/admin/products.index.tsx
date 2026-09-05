import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { formatPrice } from "@/lib/store";
import { slugify } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  head: () => ({
    meta: [
      { title: "Products — ØRE admin" },
      { name: "description", content: "Create, publish and manage the ØRE product catalogue." },
      { property: "og:title", content: "Products — ØRE admin" },
      { property: "og:description", content: "Create, publish and manage the ØRE product catalogue." },
    ],
  }),
  component: AdminProducts,
});

const adminProductsKey = ["admin", "products"];

function AdminProducts() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");

  const products = useQuery({
    queryKey: adminProductsKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,price,stock,is_active,is_featured,categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: adminProductsKey });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        slug: slugify(name),
        price: Number(price || 0),
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product created as a draft");
      setOpen(false);
      setName("");
      setPrice("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (v: { id: string; patch: TablesUpdate<"products"> }) => {
      const { error } = await supabase.from("products").update(v.patch).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">{products.data?.length ?? 0} items in the catalogue</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="np-name">Name</Label>
                <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-price">Price</Label>
                <Input id="np-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={!name.trim() || create.isPending}>
                Create draft
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border/60 bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border/60 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Published</th>
              <th className="p-4">Featured</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {(products.data ?? []).map((p) => (
              <tr key={p.id} className="border-b border-border/40 last:border-0">
                <td className="p-4">
                  <Link to="/admin/products/$productId" params={{ productId: p.id }} className="hover:underline">
                    {p.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{p.categories?.name ?? "Uncategorised"}</div>
                </td>
                <td className="p-4">{formatPrice(Number(p.price))}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <Switch
                    checked={p.is_active}
                    onCheckedChange={(v) => toggle.mutate({ id: p.id, patch: { is_active: v } })}
                    aria-label="Published"
                  />
                </td>
                <td className="p-4">
                  <Switch
                    checked={p.is_featured}
                    onCheckedChange={(v) => toggle.mutate({ id: p.id, patch: { is_featured: v } })}
                    aria-label="Featured"
                  />
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete ${p.name}?`)) remove.mutate(p.id);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
