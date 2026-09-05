import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({
    meta: [
      { title: "Banners — ØRE admin" },
      { name: "description", content: "Manage the homepage banners shown on the ØRE storefront." },
      { property: "og:title", content: "Banners — ØRE admin" },
      { property: "og:description", content: "Manage the homepage banners shown on the ØRE storefront." },
    ],
  }),
  component: AdminBanners,
});

function AdminBanners() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id,title,subtitle,image_url,link_url,position,is_active")
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "banners"] });
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  const upsert = useMutation({
    mutationFn: async (v: { id?: string; values: TablesUpdate<"banners"> & { title?: string } }) => {
      if (v.id) {
        const { error } = await supabase.from("banners").update(v.values).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(v.values as TablesInsert<"banners">);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Banner saved");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Homepage banners</h1>

      <div className="space-y-6 rounded-sm border border-border/60 bg-card p-6">
        {(list.data ?? []).map((b) => (
          <form
            key={b.id}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              upsert.mutate({
                id: b.id,
                values: {
                  title: String(form.get("title") ?? ""),
                  subtitle: String(form.get("subtitle") ?? "") || null,
                  image_url: String(form.get("image_url") ?? "") || null,
                  link_url: String(form.get("link_url") ?? "") || null,
                  position: Number(form.get("position") ?? 0),
                },
              });
            }}
            className="space-y-3 border-b border-border/40 pb-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="title" defaultValue={b.title} placeholder="Title" />
              <Input name="subtitle" defaultValue={b.subtitle ?? ""} placeholder="Subtitle" />
              <Input name="image_url" defaultValue={b.image_url ?? ""} placeholder="Image URL" />
              <Input name="link_url" defaultValue={b.link_url ?? ""} placeholder="Link URL" />
              <Input name="position" type="number" defaultValue={String(b.position)} placeholder="Position" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Switch
                  checked={b.is_active}
                  onCheckedChange={(v) => upsert.mutate({ id: b.id, values: { is_active: v } })}
                  aria-label="Active"
                />
                Active
              </div>
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => remove.mutate(b.id)}>
                Delete
              </Button>
            </div>
          </form>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            upsert.mutate({
              values: {
                title: String(form.get("title") ?? ""),
                subtitle: String(form.get("subtitle") ?? "") || null,
                image_url: String(form.get("image_url") ?? "") || null,
                link_url: String(form.get("link_url") ?? "") || null,
                position: (list.data ?? []).length,
                is_active: true,
              },
            });
            e.currentTarget.reset();
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <Input name="title" placeholder="New banner title" required />
          <Input name="subtitle" placeholder="Subtitle" />
          <Input name="image_url" placeholder="Image URL" />
          <Input name="link_url" placeholder="Link URL" />
          <Button type="submit" size="sm" variant="outline" className="justify-self-start">
            Add banner
          </Button>
        </form>
      </div>
    </div>
  );
}
