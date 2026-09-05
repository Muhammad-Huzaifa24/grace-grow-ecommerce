import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { slugify } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — ØRE admin" },
      { name: "description", content: "Create and organise ØRE product categories." },
      { property: "og:title", content: "Categories — ØRE admin" },
      { property: "og:description", content: "Create and organise ØRE product categories." },
    ],
  }),
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin", "categories", "full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id,name,slug,description,position")
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const upsert = useMutation({
    mutationFn: async (v: { id?: string; values: TablesUpdate<"categories"> }) => {
      if (v.id) {
        const { error } = await supabase.from("categories").update(v.values).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(v.values as TablesInsert<"categories">);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Category saved");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Categories</h1>

      <div className="space-y-4 rounded-sm border border-border/60 bg-card p-6">
        {(list.data ?? []).map((c) => (
          <form
            key={c.id}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const name = String(form.get("name") ?? "");
              upsert.mutate({
                id: c.id,
                values: {
                  name,
                  slug: slugify(String(form.get("slug") ?? "") || name),
                  description: String(form.get("description") ?? "") || null,
                  position: Number(form.get("position") ?? 0),
                },
              });
            }}
            className="grid gap-3 border-b border-border/40 pb-4 sm:grid-cols-5"
          >
            <Input name="name" defaultValue={c.name} placeholder="Name" />
            <Input name="slug" defaultValue={c.slug} placeholder="Slug" />
            <Input name="description" defaultValue={c.description ?? ""} placeholder="Description" />
            <Input name="position" type="number" defaultValue={String(c.position)} placeholder="Position" />
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`Delete ${c.name}?`)) remove.mutate(c.id);
                }}
              >
                Delete
              </Button>
            </div>
          </form>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const name = String(form.get("name") ?? "");
            upsert.mutate({
              values: {
                name,
                slug: slugify(String(form.get("slug") ?? "") || name),
                description: String(form.get("description") ?? "") || null,
                position: (list.data ?? []).length,
              },
            });
            e.currentTarget.reset();
          }}
          className="grid gap-3 sm:grid-cols-5"
        >
          <Input name="name" placeholder="New category" required />
          <Input name="slug" placeholder="Slug (optional)" />
          <Input name="description" placeholder="Description" />
          <div />
          <Button type="submit" size="sm" variant="outline">
            Add category
          </Button>
        </form>
      </div>
    </div>
  );
}
