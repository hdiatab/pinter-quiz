import * as React from "react";
import { Expand, Shrink } from "lucide-react";

import { buttonVariants } from "./ui/button";

export function FullscreenToggleButton({
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "type" | "onClick" | "aria-label">) {
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
      // Usually fails if not triggered by a user gesture / blocked by the browser.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className={buttonVariants({
        variant: "ghost",
        size: "icon",
        className: `${className ?? ""}`,
      })}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      {...props}
    >
      {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
    </button>
  );
}
