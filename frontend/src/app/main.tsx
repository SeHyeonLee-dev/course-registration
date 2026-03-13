import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./styles-imports";
import { AppProviders } from "./providers/AppProviders";
import { router } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("앱을 렌더링할 루트 요소를 찾을 수 없습니다.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
