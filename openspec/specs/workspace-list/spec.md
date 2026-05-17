# workspace-list Specification

## Purpose

Define the workspace collection contract for persisted workspaces.

## Requirements

### Requirement: Workspace collection is exposed

The system MUST expose `GET /api/workspaces` and return the persisted workspace collection.

#### Scenario: Persisted workspaces are listed

- GIVEN two persisted workspaces exist
- WHEN the client requests `GET /api/workspaces`
- THEN the system MUST return both workspaces
- AND the response MUST be a collection

#### Scenario: Empty collection is handled

- GIVEN no workspaces have been persisted
- WHEN the client requests `GET /api/workspaces`
- THEN the system MUST return an empty collection

### Requirement: Workspace collection order is deterministic

The system MUST return workspaces in a stable order for the same persisted state.

#### Scenario: Repeated requests preserve order

- GIVEN persisted workspaces exist
- WHEN the client requests `GET /api/workspaces` twice
- THEN the workspaces MUST appear in the same order in both responses

#### Scenario: Restart does not change collection order

- GIVEN persisted workspaces exist before a process restart
- WHEN the client requests `GET /api/workspaces` after restart
- THEN the returned order MUST match the pre-restart order
