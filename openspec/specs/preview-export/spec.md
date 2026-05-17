# preview-export Specification

## Purpose

Define the v0.1 preview and export contract: a simple 2D preview plus CSV and PDF exports aligned with the current workspace state.

## Requirements

### Requirement: 2D preview reflects the current workspace

The system MUST provide a simple 2D preview of the current workspace.

#### Scenario: Preview matches current state

- GIVEN a workspace with a calculated cabinet setup
- WHEN the user opens the preview
- THEN the preview MUST reflect the current workspace state

#### Scenario: Empty workspace is handled

- GIVEN a workspace without a complete cabinet setup
- WHEN the user opens the preview
- THEN the system MUST show a non-breaking empty or incomplete state

### Requirement: CSV and PDF export are available

The system MUST export the current workspace to CSV and PDF.

#### Scenario: Export succeeds for a valid workspace

- GIVEN a valid current workspace state
- WHEN the user exports to CSV or PDF
- THEN the exported content MUST correspond to the current workspace

#### Scenario: Export requires a valid current state

- GIVEN an invalid or incomplete workspace state
- WHEN the user requests export
- THEN the system MUST reject the export request
