import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { ThemeProvider } from "@/components/theme-provider.tsx";

import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider defaultTheme="dark" storageKey="pinter-ui-theme">
      <HashRouter>
        <App />
      </HashRouter>
      <Toaster />
    </ThemeProvider>
  </Provider>
);
