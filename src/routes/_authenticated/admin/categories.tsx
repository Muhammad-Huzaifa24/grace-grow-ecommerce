import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { slugify } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/confirm-button";

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

const rowGrid = "grid gap-3 sm:grid-cols-[1fr_1fr_2fr_6rem_10rem]";

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

      <div className="overflow-x-auto rounded-sm border border-border/60 bg-card">
        <div className="min-w-[820px]">
          <div className={`${rowGrid} border-b border-border/60 p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground`}>
            <span>Name</span>
            <span>Slug</span>
            <span>Description</span>
            <span>Position</span>
            <span className="text-right">Actions</span>
          </div>

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
              className={`${rowGrid} items-center border-b border-border/40 p-4 last:border-0`}
            >
              <Input name="name" defaultValue={c.name} placeholder="Name" />
              <Input name="slug" defaultValue={c.slug} placeholder="Slug" />
              <Input name="description" defaultValue={c.description ?? ""} placeholder="Description" />
              <Input name="position" type="number" defaultValue={String(c.position)} placeholder="Position" />
              <div className="flex justify-end gap-2">
                <Button type="submit" size="sm" variant="success">
                  Save
                </Button>
                <ConfirmButton
                  label="Delete"
                  title={`Delete ${c.name}?`}
                  description="This permanently removes the category. Products in it become uncategorised."
                  onConfirm={() => remove.mutate(c.id)}
                />
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
            className={`${rowGrid} items-center border-t border-border/60 p-4`}
          >
            <Input name="name" placeholder="New category" required />
            <Input name="slug" placeholder="Slug (optional)" />
            <Input name="description" placeholder="Description" />
            <div />
            <div className="flex justify-end">
              <Button type="submit" size="sm" variant="success">
                Add category
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
