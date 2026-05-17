import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

import { CalculationError } from "@modulewood/core-engine";
import { UnsupportedMaterialError } from "@modulewood/material-catalog";
import { WorkspaceMissingError } from "@modulewood/workspace-crud";

import { createWebFlow, type WebFlow } from "./flow.js";

interface JsonResponseBody {
  readonly ok: boolean;
  readonly data?: unknown;
  readonly error?: string;
}

const APPROVED_FLOW = {
  name: "openmodulewood-prd-foundation v0.1",
  endpoints: [
    "GET /health",
    "GET /api/flow",
    "GET /api/materials",
    "GET /api/templates",
    "GET /api/workspaces",
    "POST /api/workspaces/from-template",
    "GET /api/workspaces/:id",
    "PATCH /api/workspaces/:id",
    "DELETE /api/workspaces/:id",
    "POST /api/workspaces/:id/preview",
    "POST /api/workspaces/:id/export/csv",
    "POST /api/workspaces/:id/export/pdf",
  ],
} as const;

function readBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }

      const raw = Buffer.concat(chunks).toString("utf8");

      if (raw.trim().length === 0) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(raw) as unknown);
      } catch (error) {
        reject(new Error(`Invalid JSON payload: ${(error as Error).message}`));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, body: JsonResponseBody): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function sendText(response: ServerResponse, statusCode: number, body: string, contentType = "text/plain; charset=utf-8"): void {
  response.writeHead(statusCode, { "content-type": contentType });
  response.end(body);
}

function sendBinary(response: ServerResponse, statusCode: number, body: Uint8Array, contentType: string): void {
  response.writeHead(statusCode, { "content-type": contentType });
  response.end(body);
}

function splitPath(url: string | undefined): string[] {
  return new URL(url ?? "/", "http://localhost").pathname.split("/").filter(Boolean);
}

function requirePathSegment(path: string[], index: number, label: string): string {
  const segment = path[index];

  if (segment === undefined || segment.length === 0) {
    throw new Error(`Missing ${label}`);
  }

  return segment;
}

function isCalculationError(error: unknown): error is CalculationError {
  return error instanceof CalculationError;
}

export function createWebServer(flow: WebFlow = createWebFlow()): Server {
  return createServer(async (request, response) => {
    const method = request.method ?? "GET";
    const path = splitPath(request.url);

    try {
      if (method === "GET" && path.length === 1 && path[0] === "health") {
        sendJson(response, 200, { ok: true, data: { status: "ok", flow: APPROVED_FLOW.name } });
        return;
      }

      if (method === "GET" && path.length === 2 && path[0] === "api" && path[1] === "flow") {
        sendJson(response, 200, { ok: true, data: APPROVED_FLOW });
        return;
      }

      if (method === "GET" && path.length === 2 && path[0] === "api" && path[1] === "materials") {
        sendJson(response, 200, { ok: true, data: flow.listMaterials() });
        return;
      }

      if (method === "GET" && path.length === 2 && path[0] === "api" && path[1] === "templates") {
        sendJson(response, 200, { ok: true, data: flow.listTemplates() });
        return;
      }

      if (method === "GET" && path.length === 2 && path[0] === "api" && path[1] === "workspaces") {
        sendJson(response, 200, { ok: true, data: await flow.listWorkspaces() });
        return;
      }

      if (method === "POST" && path.length === 3 && path[0] === "api" && path[1] === "workspaces" && path[2] === "from-template") {
        const body = (await readBody(request)) as {
          workspaceId?: string;
          templateId?: string;
          workspaceName?: string;
          selectedMaterialId?: string;
        };

        const workspaceInput: Parameters<WebFlow["createWorkspaceFromTemplate"]>[0] = {
          workspaceId: body.workspaceId ?? "workspace-1",
          templateId: body.templateId ?? "compact-base",
          ...(body.workspaceName !== undefined ? { workspaceName: body.workspaceName } : {}),
          ...(body.selectedMaterialId !== undefined ? { selectedMaterialId: body.selectedMaterialId } : {}),
        };

        const workspace = await flow.createWorkspaceFromTemplate(workspaceInput);

        sendJson(response, 201, { ok: true, data: workspace });
        return;
      }

      if (path.length === 3 && path[0] === "api" && path[1] === "workspaces") {
        const workspaceId = requirePathSegment(path, 2, "workspaceId");

        if (method === "GET") {
          sendJson(response, 200, { ok: true, data: await flow.readWorkspace(workspaceId) });
          return;
        }

        if (method === "PATCH") {
          const body = (await readBody(request)) as Parameters<WebFlow["updateWorkspace"]>[1];
          sendJson(response, 200, { ok: true, data: await flow.updateWorkspace(workspaceId, body ?? {}) });
          return;
        }

        if (method === "DELETE") {
          await flow.deleteWorkspace(workspaceId);
          sendJson(response, 200, { ok: true });
          return;
        }
      }

      if (path.length === 4 && path[0] === "api" && path[1] === "workspaces") {
        const workspaceId = requirePathSegment(path, 2, "workspaceId");
        const action = requirePathSegment(path, 3, "action");

        if (method === "POST" && action === "preview") {
          sendJson(response, 200, { ok: true, data: await flow.previewWorkspace(workspaceId) });
          return;
        }

        if (method === "POST" && action === "export") {
          const body = await readBody(request);
          const format = typeof body === "object" && body !== null && "format" in body ? String((body as { format?: string }).format) : "csv";

          if (format === "pdf") {
            const artifact = await flow.exportWorkspacePdf(workspaceId);
            sendBinary(response, 200, artifact.body, artifact.mimeType);
            return;
          }

          const artifact = await flow.exportWorkspaceCsv(workspaceId);
          sendText(response, 200, artifact.body, artifact.mimeType);
          return;
        }
      }

      if (path.length === 5 && path[0] === "api" && path[1] === "workspaces" && path[3] === "export") {
        const workspaceId = requirePathSegment(path, 2, "workspaceId");
        const format = requirePathSegment(path, 4, "format");

        if (method === "POST" && format === "csv") {
          const artifact = await flow.exportWorkspaceCsv(workspaceId);
          sendText(response, 200, artifact.body, artifact.mimeType);
          return;
        }

        if (method === "POST" && format === "pdf") {
          const artifact = await flow.exportWorkspacePdf(workspaceId);
          sendBinary(response, 200, artifact.body, artifact.mimeType);
          return;
        }
      }

      sendJson(response, 404, { ok: false, error: "Not found" });
    } catch (error) {
      if (error instanceof WorkspaceMissingError) {
        sendJson(response, 404, { ok: false, error: error.message });
        return;
      }

      if (error instanceof UnsupportedMaterialError) {
        sendJson(response, 422, { ok: false, error: error.message });
        return;
      }

      if (isCalculationError(error)) {
        sendJson(response, 422, { ok: false, error: error.message });
        return;
      }

      sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : "Unexpected error" });
    }
  });
}

export { APPROVED_FLOW };
