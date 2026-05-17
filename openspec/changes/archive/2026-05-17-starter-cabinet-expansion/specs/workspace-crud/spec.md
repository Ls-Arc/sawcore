# Delta for workspace-crud

## MODIFIED Requirements

### Requirement: Workspace lifecycle is supported

The system MUST allow a workspace to be created, retrieved, updated, and deleted while preserving the full cabinet setup, including construction rules and any cabinet state seeded from an approved starter template.
(Previously: The system MUST allow a workspace to be created, retrieved, updated, and deleted while preserving the full cabinet setup, including construction rules.)

#### Scenario: Create and retrieve a workspace

- GIVEN a valid workspace request seeded from an approved starter template
- WHEN the user creates a workspace
- THEN the workspace MUST be available for retrieval
- AND it MUST expose its full cabinet setup

#### Scenario: Delete removes the workspace

- GIVEN an existing workspace
- WHEN the user deletes it
- THEN the workspace MUST no longer be retrievable

### Requirement: Basic cabinet setup is editable

The system MUST allow the workspace cabinet setup and construction profile to be updated within v0.1 bounds.
Updates to a starter-seeded workspace MUST preserve editable workspace state and MUST NOT alter the approved starter catalog.
(Previously: The system MUST allow the workspace cabinet setup and construction profile to be updated within v0.1 bounds.)

#### Scenario: Update cabinet setup and profile

- GIVEN an existing workspace with a cabinet setup and construction profile
- WHEN the user updates the cabinet setup or profile
- THEN the saved workspace MUST reflect the new setup

#### Scenario: Missing workspace is handled safely

- GIVEN a workspace identifier that does not exist
- WHEN the user reads or updates it
- THEN the system MUST report that the workspace is unavailable

#### Scenario: Unsupported rules are rejected on update

- GIVEN an existing workspace and an unsupported construction rule value
- WHEN the user updates the workspace
- THEN the system MUST reject the update
- AND it MUST NOT persist the unsupported rule
