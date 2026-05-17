import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../pages/home/HomePage";
import { TemplatesPage } from "../pages/templates/TemplatesPage";
import { WorkspacePage } from "../pages/workspace/WorkspacePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "workspaces/:id", element: <WorkspacePage /> },
    ],
  },
]);
