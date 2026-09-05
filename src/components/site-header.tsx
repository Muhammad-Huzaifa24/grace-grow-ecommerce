import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const { user } = useSession();
  const navigate = useNavigate();
  const [term, setTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/search", search: { q: term.trim() } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-6">
            <SheetTitle className="text-lg">Menu</SheetTitle>
            <nav className="mt-6 flex flex-col gap-4 text-sm">
              {NAV.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link to="/account" onClick={() => setOpen(false)}>
                Account
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="font-serif text-2xl tracking-[0.3em]">
          ØRE
        </Link>

        <nav className="ml-6 hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden w-56 items-center lg:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="h-9 pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <Button asChild variant="ghost" size="icon" className="lg:hidden" aria-label="Search">
            <Link to="/search" search={{ q: "" }}>
              <Search className="size-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Account">
            {user ? (
              <Link to="/account">
                <User className="size-5" />
              </Link>
            ) : (
              <Link to="/auth" search={{ redirect: "/account" }}>
                <User className="size-5" />
              </Link>
            )}
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Cart" className="relative">
            <Link to="/cart">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
