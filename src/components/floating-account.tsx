import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { useInitials } from "@/hooks/use-initials";
import { BellIcon } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { Progress } from "./ui/progress";

const XP_PER_LEVEL = 200;

export function FloatingAccount({ ...props }: React.ComponentProps<"div">) {
  const { user } = useSelector((state: any) => state.auth);
  const getInitials = useInitials();

  const xpTotal = Number(user?.game?.xp ?? 0);
  const level = Number(user?.game?.level ?? Math.floor(xpTotal / XP_PER_LEVEL) + 1);

  // progress within current level
  const levelStartXp = (level - 1) * XP_PER_LEVEL;
  const xpInLevel = Math.max(0, xpTotal - levelStartXp);
  const progress = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100));

  return (
    <div className={"fixed top-4 left-1/2 z-50 -translate-x-1/2 w-full"} {...props}>
      <nav className="m-4 flex items-center justify-between gap-3" aria-label="Quick navigation">
        {/* Left: Avatar */}
        <Link to={"/account"} className="shrink-0">
          <Avatar className="size-10 rounded-full">
            <AvatarImage src={user?.profileImage} alt={user?.name} />
            <AvatarFallback className="rounded-lg">{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
        </Link>

        {/* Middle: Level Progress */}
        <div className="flex w-full items-center gap-3 rounded-full px-4 py-2">
          {/* Lv */}
          <div className="shrink-0 text-xs font-medium text-muted-foreground">
            Lv <span className="text-foreground">{level}</span>
          </div>

          {/* Bar + labels */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Level progress</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {xpInLevel}/{XP_PER_LEVEL} XP
              </span>
            </div>

            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <Progress className="h-full rounded-full" value={progress} />
            </div>
          </div>
          {/* Total XP (di pinggir) */}
          <div className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{xpTotal} XP</div>
        </div>

        {/* Right: Notifications */}
        <Link
          to={"/notification"}
          className={buttonVariants({
            variant: "outline",
            size: "icon",
            className: "!rounded-full size-10 shrink-0",
          })}
        >
          <BellIcon className="h-4 w-4" />
        </Link>
      </nav>
    </div>
  );
}
