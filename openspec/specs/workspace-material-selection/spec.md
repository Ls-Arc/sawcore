# workspace-material-selection Specification

## Purpose

Define how a workspace selects one approved material and persists that choice.

## Requirements

### Requirement: Workspace stores one selected material

The system MUST allow each workspace to reference at most one selected material from the approved catalog.
The selected material MUST round-trip with workspace state.
The system MUST reject material ids that are not in the catalog.

#### Scenario: Select a catalog material

- GIVEN a workspace and an approved catalog material
- WHEN the user selects it for the workspace
- THEN the workspace MUST persist that material reference
- AND retrieval MUST return the same selection

#### Scenario: Replace the selection

- GIVEN a workspace with an existing selected material
- WHEN the user selects a different approved material
- THEN the workspace MUST store only the new selection
