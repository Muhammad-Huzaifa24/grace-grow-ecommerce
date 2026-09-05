import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl tracking-[0.3em]">ØRE</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Quiet objects for considered interiors. Made in small batches, built to last.
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow">Shop</p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-foreground">
                All products
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-foreground">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/search" search={{ q: "" }} className="hover:text-foreground">
                Search
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow">Account</p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>
              <Link to="/account" className="hover:text-foreground">
                My account
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-foreground">
                Order history
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-foreground">
                Cart
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ØRE. All rights reserved.
      </div>
    </footer>
  );
}
