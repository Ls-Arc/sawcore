# local-deployment Specification

## Purpose

Define the v0.1 local execution contract. The product MUST be runnable on a developer machine with a local deployment definition.

## Requirements

### Requirement: Local deployment is supported

The system MUST support local execution through Docker Compose.

#### Scenario: Local stack starts

- GIVEN the required local prerequisites are available
- WHEN the user starts the local deployment definition
- THEN the application services MUST become available locally

#### Scenario: Local start failure is visible

- GIVEN a missing prerequisite or invalid local configuration
- WHEN the user starts the local deployment definition
- THEN the system MUST fail clearly

### Requirement: Local deployment is scoped to v0.1

The local deployment MUST support the narrow PRD foundation scope and nothing broader.

#### Scenario: Core v0.1 flow is available locally

- GIVEN the local deployment is running
- WHEN the user exercises the approved v0.1 flow
- THEN the flow MUST be available end to end locally

#### Scenario: Out-of-scope features are not required

- GIVEN the v0.1 local deployment
- WHEN the user expects cloud or collaborative features
- THEN the system MUST NOT require them for local use

### Requirement: Local runtime uses SQLite persistence by default

The system MUST start local runtime with SQLite as the default persistence backend.
The system MUST use a stable file path or mounted volume so persisted workspace data survives process restarts.

#### Scenario: Workspace data survives restart

- GIVEN a workspace has been created in the local runtime
- WHEN the process restarts
- THEN the workspace MUST still be available

#### Scenario: Local startup remains available without preexisting data

- GIVEN no SQLite database file exists yet
- WHEN the local runtime starts
- THEN the system MUST start successfully and create persistent storage as needed
