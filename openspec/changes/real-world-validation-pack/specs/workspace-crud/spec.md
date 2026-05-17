# Delta for workspace-crud

## ADDED Requirements

### Requirement: Frozen starter-seeded workspace round-trips cleanly

The system MUST preserve the starter-seeded cabinet setup and selected material across create, read, and update for the validation journey. The frozen journey MUST remain editable without changing the approved starter catalog.

#### Scenario: Starter workspace is created and retrieved

- GIVEN the frozen starter template and an approved material selection
- WHEN the workspace is created
- THEN the saved workspace MUST be retrievable
- AND it MUST preserve the starter-seeded cabinet setup and selected material

#### Scenario: Update keeps the selected material attached

- GIVEN the frozen starter-seeded workspace
- WHEN the user updates the workspace without changing the validation intent
- THEN the workspace MUST still reflect the selected material and cabinet setup
