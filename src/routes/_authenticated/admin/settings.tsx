import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Store settings — ØRE admin" },
      { name: "description", content: "Edit ØRE store name, contact details, currency and shipping rules." },
      { property: "og:title", content: "Store settings — ØRE admin" },
      { property: "og:description", content: "Edit ØRE store name, contact details, currency and shipping rules." },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("id,store_name,tagline,support_email,support_phone,currency,shipping_flat_rate,free_shipping_threshold")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (form: FormData) => {
      const values = {
        store_name: String(form.get("store_name") ?? ""),
        tagline: String(form.get("tagline") ?? "") || null,
        support_email: String(form.get("support_email") ?? "") || null,
        support_phone: String(form.get("support_phone") ?? "") || null,
        currency: String(form.get("currency") ?? "USD"),
        shipping_flat_rate: Number(form.get("shipping_flat_rate") ?? 0),
        free_shipping_threshold: Number(form.get("free_shipping_threshold") ?? 0),
      };
      const { error } = settings.data
        ? await supabase.from("store_settings").update(values).eq("id", settings.data.id)
        : await supabase.from("store_settings").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const s = settings.data;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Store settings</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(new FormData(e.currentTarget));
        }}
        className="grid gap-4 rounded-sm border border-border/60 bg-card p-6 sm:grid-cols-2"
        key={s?.store_name ?? "empty"}
      >
        <div className="space-y-2">
          <Label htmlFor="store_name">Store name</Label>
          <Input id="store_name" name="store_name" defaultValue={s?.store_name ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" defaultValue={s?.tagline ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support_email">Support email</Label>
          <Input id="support_email" name="support_email" type="email" defaultValue={s?.support_email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support_phone">Support phone</Label>
          <Input id="support_phone" name="support_phone" defaultValue={s?.support_phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={s?.currency ?? "USD"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shipping_flat_rate">Flat shipping rate</Label>
          <Input
            id="shipping_flat_rate"
            name="shipping_flat_rate"
            type="number"
            step="0.01"
            defaultValue={s ? String(s.shipping_flat_rate) : "0"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="free_shipping_threshold">Free shipping over</Label>
          <Input
            id="free_shipping_threshold"
            name="free_shipping_threshold"
            type="number"
            step="0.01"
            defaultValue={s ? String(s.free_shipping_threshold) : "0"}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            Save settings
          </Button>
        </div>
      </form>
    </div>
  );
}
