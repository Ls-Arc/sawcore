# workspace-crud Specification

## Purpose

Define the minimum workspace lifecycle for v0.1: create, read, update, and delete a project and its basic cabinet setup.

## Requirements

### Requirement: Workspace lifecycle is supported

The system MUST allow a workspace to be created, retrieved, updated, and deleted.

#### Scenario: Create and retrieve a workspace

- GIVEN a valid workspace request
- WHEN the user creates a workspace
- THEN the workspace MUST be available for retrieval
- AND it MUST expose its basic cabinet setup

#### Scenario: Delete removes the workspace

- GIVEN an existing workspace
- WHEN the user deletes it
- THEN the workspace MUST no longer be retrievable

### Requirement: Basic cabinet setup is editable

The system MUST allow the workspace cabinet setup to be updated within v0.1 bounds.

#### Scenario: Update cabinet setup

- GIVEN an existing workspace with a cabinet setup
- WHEN the user updates the basic cabinet parameters
- THEN the saved workspace MUST reflect the new setup

#### Scenario: Missing workspace is handled safely

- GIVEN a workspace identifier that does not exist
- WHEN the user reads or updates it
- THEN the system MUST report that the workspace is unavailable
