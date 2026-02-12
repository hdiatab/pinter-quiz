import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun, Laptop } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useTheme } from "@/components/theme-provider";
import { ButtonGroup } from "@/components/ui/button-group";
import { toast } from "sonner";

import {
  setAutoNextDelayMs,
  setMode,
  setSidebarVariant,
  setSidebarCollapsible,
  setContentMaxWidth,
  type Mode,
  type SidebarVariant,
  type SidebarCollapsible,
  type ContentMaxWidth,
} from "@/store/settings/settingsSlice";

const CONTENT_WIDTH_PRESETS: Array<{
  value: ContentMaxWidth;
  title: string;
  desc: string;
}> = [
  { value: "2xl", title: "Normal", desc: "Comfortable reading width" },
  { value: "4xl", title: "Wide", desc: "More space for content" },
  { value: "6xl", title: "Ultra", desc: "Great for dashboards" },
  { value: "full", title: "Full", desc: "Use full available width" },
];

const SettingPage = () => {
  const dispatch = useDispatch<any>();
  const { theme, setTheme } = useTheme();

  const settings = useSelector((s: any) => s.settings) as {
    mode: Mode;
    autoNextDelayMs: number;
    sidebarVariant: SidebarVariant;
    sidebarCollapsible: SidebarCollapsible;
    contentMaxWidth: ContentMaxWidth;
  };

  const [delayInput, setDelayInput] = useState<string>(String(settings.autoNextDelayMs));

  useEffect(() => {
    setDelayInput(String(settings.autoNextDelayMs));
  }, [settings.autoNextDelayMs]);

  const delayNumber = useMemo(() => {
    const n = Number(delayInput);
    return Number.isFinite(n) ? n : NaN;
  }, [delayInput]);

  const isAuto = settings.mode === "auto";

  const applyDelay = () => {
    if (!Number.isFinite(delayNumber)) return;
    dispatch(setAutoNextDelayMs(delayNumber));
    toast.success("Auto-next delay saved");
  };

  const setWidth = (w: ContentMaxWidth) => {
    dispatch(setContentMaxWidth(w));
    toast.success("Content width updated");
  };

  const setSidebarV = (v: SidebarVariant) => {
    dispatch(setSidebarVariant(v));
    toast.success("Sidebar variant updated");
  };

  const setSidebarC = (c: SidebarCollapsible) => {
    dispatch(setSidebarCollapsible(c));
    toast.success("Sidebar collapsible updated");
  };

  const setThemeWithToast = (t: "light" | "dark" | "system") => {
    setTheme(t);
    toast.success("Theme updated");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure quiz behavior, layout, and appearance.</p>
      </div>

      {/* =========================
          QUIZ SETTINGS
         ========================= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quiz Settings</CardTitle>
          <CardDescription>How the quiz flow behaves while playing.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quiz Mode */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Quiz Mode</div>
            <div className="flex items-center gap-2">
              <Button
                variant={settings.mode === "auto" ? "default" : "outline"}
                onClick={() => {
                  dispatch(setMode("auto"));
                  toast.success("Quiz mode set to Auto");
                }}
              >
                Auto
              </Button>
              <Button
                variant={settings.mode === "manual" ? "default" : "outline"}
                onClick={() => {
                  dispatch(setMode("manual"));
                  toast.success("Quiz mode set to Manual");
                }}
              >
                Manual
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Auto:</span> pick → reveal → auto-advance.{" "}
              <span className="font-medium text-foreground">Manual:</span> pick → Submit → Continue.
            </div>
          </div>

          <Separator />

          {/* Auto-Next Delay */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Auto-Next Delay (ms)</div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                className="h-9 w-40 rounded-md border bg-background px-3 text-sm"
                type="number"
                min={0}
                step={100}
                value={delayInput}
                onChange={(e) => setDelayInput(e.target.value)}
                disabled={!isAuto}
                aria-label="Auto-next delay in milliseconds"
              />

              <Button onClick={applyDelay} disabled={!isAuto || !Number.isFinite(delayNumber)}>
                Save
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  dispatch(setAutoNextDelayMs(800));
                  toast.success("Auto-next delay set to 800ms");
                }}
                disabled={!isAuto}
              >
                800
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  dispatch(setAutoNextDelayMs(1200));
                  toast.success("Auto-next delay set to 1200ms");
                }}
                disabled={!isAuto}
              >
                1200
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  dispatch(setAutoNextDelayMs(2000));
                  toast.success("Auto-next delay set to 2000ms");
                }}
                disabled={!isAuto}
              >
                2000
              </Button>
            </div>

            {!isAuto ? (
              <div className="text-xs text-muted-foreground">Auto-next delay applies only in Auto mode.</div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Smaller values advance faster after revealing the answer.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* =========================
    APPEARANCE SETTINGS
   ========================= */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Theme and content width on desktop.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Theme */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Theme</div>

            <ButtonGroup>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setThemeWithToast("light")}
              >
                <Sun className="size-4" />
                Light
              </Button>

              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setThemeWithToast("dark")}
              >
                <Moon className="size-4" />
                Dark
              </Button>

              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setThemeWithToast("system")}
              >
                <Laptop className="size-4" />
                System
              </Button>
            </ButtonGroup>
          </div>

          <Separator className="md:hidden" />

          {/* Content Max Width */}
          <div className="space-y-2 max-md:hidden">
            <div className="text-sm font-medium">Desktop Content Width</div>
            <div className="text-xs text-muted-foreground">
              Controls the maximum width of the main content area on desktop screens.
            </div>

            <ButtonGroup>
              {CONTENT_WIDTH_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  variant={settings.contentMaxWidth === p.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWidth(p.value)}
                  className="h-auto py-2 px-3 flex flex-col items-start"
                >
                  <span className="text-xs font-semibold leading-tight">{p.title}</span>
                  <span className="text-[10px] opacity-70 leading-tight">{p.desc}</span>
                </Button>
              ))}
            </ButtonGroup>

            <div className="text-xs text-muted-foreground">
              Current:{" "}
              <span className="text-foreground font-medium">
                {CONTENT_WIDTH_PRESETS.find((x) => x.value === settings.contentMaxWidth)?.title ?? "Custom"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================
          LAYOUT SETTINGS
         ========================= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layout Settings</CardTitle>
          <CardDescription>Sidebar look and behavior.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Sidebar Variant */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Sidebar Variant</div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={settings.sidebarVariant === "sidebar" ? "default" : "outline"}
                onClick={() => setSidebarV("sidebar")}
              >
                Sidebar
              </Button>
              <Button
                variant={settings.sidebarVariant === "floating" ? "default" : "outline"}
                onClick={() => setSidebarV("floating")}
              >
                Floating
              </Button>
              <Button
                variant={settings.sidebarVariant === "inset" ? "default" : "outline"}
                onClick={() => setSidebarV("inset")}
              >
                Inset
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">Controls the visual style of the sidebar container.</div>
          </div>

          <Separator />

          {/* Sidebar Collapsible */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Sidebar Collapsible</div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={settings.sidebarCollapsible === "icon" ? "default" : "outline"}
                onClick={() => setSidebarC("icon")}
              >
                Icon
              </Button>
              <Button
                variant={settings.sidebarCollapsible === "offcanvas" ? "default" : "outline"}
                onClick={() => setSidebarC("offcanvas")}
              >
                Offcanvas
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Icon collapses to a compact rail, Offcanvas hides the sidebar, None disables collapsing.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingPage;
