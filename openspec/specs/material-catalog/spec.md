# material-catalog Specification

## Purpose

Define the read-only approved material catalog available in v0.1.

## Requirements

### Requirement: Catalog is read-only and limited

The system MUST provide a curated catalog of approved sheet goods.
The catalog MUST be read-only and MUST NOT support create, edit, or delete operations.
It MUST NOT expose procurement, labor, tax, or offcut data.

#### Scenario: List approved materials

- GIVEN a request for the catalog
- WHEN the system returns materials
- THEN it MUST return only approved materials
- AND each item MUST include stable material identifiers

#### Scenario: Mutations are rejected

- GIVEN a client attempts to create, edit, or delete a material
- WHEN the request is processed
- THEN the system MUST reject the mutation
- AND the catalog MUST remain unchanged
