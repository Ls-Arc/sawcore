import { useMutation } from "@tanstack/react-query";

import { exportWorkspace } from "../api/exportWorkspace";
import type { WorkspaceExportFormat } from "../../../lib/api/types";

type ExportWorkspaceInput = {
  readonly format: WorkspaceExportFormat;
  readonly workspaceName: string;
};

export function useWorkspaceExport(workspaceId: string) {
  return useMutation({
    mutationFn: ({ format, workspaceName }: ExportWorkspaceInput) =>
      exportWorkspace(workspaceId, workspaceName, format),
  });
}
