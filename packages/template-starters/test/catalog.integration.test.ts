import assert from "node:assert/strict";
import test from "node:test";

import {
  getStarterTemplate,
  listStarterTemplates,
  seedWorkspaceFromTemplate,
  UnsupportedStarterTemplateError,
} from "../src/index.js";

test("starter catalog exposes the approved template set", () => {
  const templates = listStarterTemplates();

  assert.equal(templates.length, 2);
  assert.deepStrictEqual(
    templates.map((template) => template.id),
    ["compact-base", "tall-pantry"],
  );
});

test("template seeding does not mutate the catalog", () => {
  const template = getStarterTemplate("compact-base");

  assert.ok(template);

  const workspace = seedWorkspaceFromTemplate({
    workspaceId: "workspace-2",
    templateId: "compact-base",
  });

  assert.notStrictEqual(workspace.cabinetSetup, template.cabinetSetup);

  workspace.cabinetSetup.width.value = 999;

  const refreshedTemplate = getStarterTemplate("compact-base");
  assert.equal(refreshedTemplate?.cabinetSetup.width.value, 80);
});

test("unsupported templates are rejected", () => {
  assert.throws(
    () => seedWorkspaceFromTemplate({ workspaceId: "workspace-3", templateId: "legacy" }),
    (error: unknown) => error instanceof UnsupportedStarterTemplateError,
  );
});
