# Delta for local-deployment

## ADDED Requirements

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
