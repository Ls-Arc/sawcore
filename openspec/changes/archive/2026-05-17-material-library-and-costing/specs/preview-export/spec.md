# Delta for preview-export

## MODIFIED Requirements

### Requirement: 2D preview reflects the current workspace

The system MUST provide a simple 2D preview of the current workspace, including workspaces seeded from approved starter templates.
The preview MUST be derived only from the current engine-calculated cabinet output.
When a rough cost summary exists, the preview MAY surface it.
(Previously: preview was limited to the current workspace geometry.)

#### Scenario: Preview matches current state

- GIVEN a workspace with a calculated cabinet setup from an approved starter template
- WHEN the user opens the preview
- THEN the preview MUST reflect the current workspace state

#### Scenario: Empty workspace is handled

- GIVEN a workspace without a complete cabinet setup
- WHEN the user opens the preview
- THEN the system MUST show a non-breaking empty or incomplete state

### Requirement: CSV and PDF export are available

The system MUST export the current workspace to CSV and PDF, including starter-seeded workspaces.
The exported content MUST correspond to the current engine-calculated cabinet output.
When available, the export MAY surface the rough cost summary.
(Previously: export covered only engine-calculated cabinet output.)

#### Scenario: Export succeeds for a valid workspace

- GIVEN a valid current workspace state seeded from an approved starter template
- WHEN the user exports to CSV or PDF
- THEN the exported content MUST correspond to the current workspace

#### Scenario: Export requires a valid current state

- GIVEN an invalid or incomplete workspace state
- WHEN the user requests export
- THEN the system MUST reject the export request
