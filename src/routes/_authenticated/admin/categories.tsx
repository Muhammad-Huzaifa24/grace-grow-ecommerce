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
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border/60 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Description</th>
              <th className="w-24 p-4">Position</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((c) => (
              <tr key={c.id} className="border-b border-border/40 last:border-0">
                <td colSpan={5} className="p-0">
                  <form
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
                    className="grid grid-cols-subgrid"
                    style={{ display: "contents" }}
                  >
                    <td className="p-4">
                      <Input name="name" defaultValue={c.name} placeholder="Name" />
                    </td>
                    <td className="p-4">
                      <Input name="slug" defaultValue={c.slug} placeholder="Slug" />
                    </td>
                    <td className="p-4">
                      <Input name="description" defaultValue={c.description ?? ""} placeholder="Description" />
                    </td>
                    <td className="p-4">
                      <Input name="position" type="number" defaultValue={String(c.position)} placeholder="Position" />
                    </td>
                    <td className="p-4">
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
                    </td>
                  </form>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={5} className="p-0">
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
                  style={{ display: "contents" }}
                >
                  <td className="p-4">
                    <Input name="name" placeholder="New category" required />
                  </td>
                  <td className="p-4">
                    <Input name="slug" placeholder="Slug (optional)" />
                  </td>
                  <td className="p-4">
                    <Input name="description" placeholder="Description" />
                  </td>
                  <td className="p-4" />
                  <td className="p-4 text-right">
                    <Button type="submit" size="sm" variant="success">
                      Add category
                    </Button>
                  </td>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
