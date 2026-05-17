import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_CONSTRUCTION_RULES } from "@modulewood/domain";

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
    ["compact-base", "wall-cabinet"],
  );
  assert.deepStrictEqual(templates[0].cabinetSetup.constructionRules, DEFAULT_CONSTRUCTION_RULES);
  assert.deepStrictEqual(templates[1].cabinetSetup, {
    width: { value: 80, unit: "cm" },
    height: { value: 72, unit: "cm" },
    depth: { value: 35, unit: "cm" },
    materialThickness: { value: 18, unit: "mm" },
    allowances: { cut: { value: 2, unit: "mm" } },
    constructionRules: DEFAULT_CONSTRUCTION_RULES,
  });
});

test("template seeding does not mutate the catalog", () => {
  const template = getStarterTemplate("compact-base");

  assert.ok(template);

  const workspace = seedWorkspaceFromTemplate({
    workspaceId: "workspace-2",
    templateId: "compact-base",
  });

  assert.notStrictEqual(workspace.cabinetSetup, template.cabinetSetup);
  assert.deepStrictEqual(workspace.cabinetSetup.constructionRules, DEFAULT_CONSTRUCTION_RULES);

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
