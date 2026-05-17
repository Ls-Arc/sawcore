# Delta for workspace-crud

## ADDED Requirements

### Requirement: Workspace repositories support listing

The system MUST allow the workspace use-case layer to enumerate persisted workspaces.
Workspace listing MUST reflect the persisted collection and MUST remain deterministic for the same stored state.

#### Scenario: List returns created workspaces

- GIVEN two workspaces have been created and persisted
- WHEN the workspace list use case is invoked
- THEN both workspaces MUST be returned

#### Scenario: Deleted workspaces are not listed

- GIVEN a persisted workspace has been deleted
- WHEN the workspace list use case is invoked
- THEN the deleted workspace MUST NOT be returned
