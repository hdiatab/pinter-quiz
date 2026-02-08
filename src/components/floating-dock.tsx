import { NAV_ITEMS } from "@/constants/dashboard-navigation.constant";
import { Link } from "react-router-dom";

export function FloatingDock({ className = "" }: { className?: string }) {
  const navItemsWithActive = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.url || location.pathname.startsWith(item.url + "/"),
  }));

  return (
    <div className={["fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-full", "", className].join(" ")}>
      <nav
        className="items-center justify-between gap-2 rounded-full bg-primary-foreground p-3 flex mx-4 border"
        aria-label="Quick navigation"
      >
        {navItemsWithActive.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.url}
              to={item.url}
              aria-label={item.title}
              className={`flex h-10 w-fit p-3 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-all ${
                item.isActive ? "border shrink-0 gap-2" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
              <p className={`shrink-0 ${item.isActive ? "" : "hidden"}`}>{item.title}</p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
