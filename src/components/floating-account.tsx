import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Expand, Shrink } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { buttonVariants } from "./ui/button";
import { Progress } from "./ui/progress";
import { useInitials } from "@/hooks/use-initials";

import { calcLevelFromXp, xpRequiredForLevel, xpRangeForLevel } from "@/lib/userGame";

export function FloatingAccount({ ...props }: React.ComponentProps<"div">) {
  const { user } = useSelector((state: any) => state.auth);
  const getInitials = useInitials();

  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(Boolean(document.fullscreenElement));

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // biasanya gagal kalau bukan dari user gesture / diblok browser
    }
  };

  const xpTotal = Number(user?.game?.xp ?? 0);
  const level = calcLevelFromXp(xpTotal);
  const levelStartXp = xpRequiredForLevel(level);
  const levelSize = xpRangeForLevel(level);
  const xpInLevel = Math.max(0, xpTotal - levelStartXp);
  const progress = Math.min(100, Math.round((xpInLevel / levelSize) * 100));

  return (
    <div className={"fixed top-4 left-1/2 z-50 w-full -translate-x-1/2"} {...props}>
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
          <div className="shrink-0 text-xs font-medium text-muted-foreground">
            Lv <span className="text-foreground">{level}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Level progress</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {xpInLevel}/{levelSize} XP
              </span>
            </div>

            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <Progress className="h-full rounded-full" value={progress} />
            </div>
          </div>

          <div className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{xpTotal} XP</div>
        </div>

        {/* Right: Fullscreen toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={buttonVariants({
            variant: "outline",
            size: "icon",
            className: "!rounded-full size-10 shrink-0",
          })}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </button>
      </nav>
    </div>
  );
}
