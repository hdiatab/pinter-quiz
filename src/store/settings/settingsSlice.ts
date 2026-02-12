import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Mode = "auto" | "manual";
export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsible = "offcanvas" | "icon" | "none";

/**
 * Desktop container max-width choices (Tailwind).
 * We'll map these to classes like `max-w-2xl`, `max-w-3xl`, etc.
 */
export type ContentMaxWidth = "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

export type SettingsState = {
  // Quiz
  mode: Mode;
  autoNextDelayMs: number;

  // Layout
  sidebarVariant: SidebarVariant;
  sidebarCollapsible: SidebarCollapsible;

  // Appearance / layout density
  contentMaxWidth: ContentMaxWidth;
};

export const STORAGE_KEY = "appSettings";

export const defaultState: SettingsState = {
  mode: "auto",
  autoNextDelayMs: 1200,
  sidebarVariant: "floating",
  sidebarCollapsible: "icon",
  contentMaxWidth: "6xl",
};

function isMode(v: any): v is Mode {
  return v === "auto" || v === "manual";
}
function isSidebarVariant(v: any): v is SidebarVariant {
  return v === "sidebar" || v === "floating" || v === "inset";
}
function isSidebarCollapsible(v: any): v is SidebarCollapsible {
  return v === "offcanvas" || v === "icon" || v === "none";
}
function isContentMaxWidth(v: any): v is ContentMaxWidth {
  return v === "2xl" || v === "3xl" || v === "4xl" || v === "5xl" || v === "6xl" || v === "7xl" || v === "full";
}

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as Partial<SettingsState> | null;
    if (!parsed || typeof parsed !== "object") return defaultState;

    const mode: Mode = isMode(parsed.mode) ? parsed.mode : defaultState.mode;

    const autoNextDelayMs =
      typeof parsed.autoNextDelayMs === "number" && Number.isFinite(parsed.autoNextDelayMs)
        ? Math.max(0, Math.floor(parsed.autoNextDelayMs))
        : defaultState.autoNextDelayMs;

    const sidebarVariant: SidebarVariant = isSidebarVariant(parsed.sidebarVariant)
      ? parsed.sidebarVariant
      : defaultState.sidebarVariant;

    const sidebarCollapsible: SidebarCollapsible = isSidebarCollapsible(parsed.sidebarCollapsible)
      ? parsed.sidebarCollapsible
      : defaultState.sidebarCollapsible;

    const contentMaxWidth: ContentMaxWidth = isContentMaxWidth(parsed.contentMaxWidth)
      ? parsed.contentMaxWidth
      : defaultState.contentMaxWidth;

    return { mode, autoNextDelayMs, sidebarVariant, sidebarCollapsible, contentMaxWidth };
  } catch {
    return defaultState;
  }
}

const initialState: SettingsState = loadSettings();

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Quiz
    setMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload;
    },
    setAutoNextDelayMs(state, action: PayloadAction<number>) {
      const v = Number(action.payload);
      if (Number.isFinite(v)) state.autoNextDelayMs = Math.max(0, Math.floor(v));
    },

    // Sidebar
    setSidebarVariant(state, action: PayloadAction<SidebarVariant>) {
      state.sidebarVariant = action.payload;
    },
    setSidebarCollapsible(state, action: PayloadAction<SidebarCollapsible>) {
      state.sidebarCollapsible = action.payload;
    },

    // Appearance
    setContentMaxWidth(state, action: PayloadAction<ContentMaxWidth>) {
      state.contentMaxWidth = action.payload;
    },

    resetSettings() {
      return defaultState;
    },
  },
});

export const {
  setMode,
  setAutoNextDelayMs,
  setSidebarVariant,
  setSidebarCollapsible,
  setContentMaxWidth,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
