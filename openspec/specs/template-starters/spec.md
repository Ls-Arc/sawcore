# template-starters Specification

## Purpose

Define the starter templates that seed a new v0.1 workspace. The set MUST remain small and opinionated.

## Requirements

### Requirement: Limited starter template set

The system MUST provide one or two starter cabinet templates.

#### Scenario: Starter list is available

- GIVEN a user is creating a new workspace
- WHEN the user requests starter templates
- THEN the system MUST present the available starter set
- AND the set MUST be limited to the approved v0.1 templates

#### Scenario: Unsupported template is rejected

- GIVEN a template name outside the approved starter set
- WHEN the user selects it
- THEN the system MUST reject the selection

### Requirement: Starter templates initialize a workspace

The system MUST create an initial workspace setup from a selected starter template.

#### Scenario: Template seeds a new workspace

- GIVEN an approved starter template
- WHEN the user creates a workspace from it
- THEN the workspace MUST start with the template-defined cabinet setup

#### Scenario: Template changes do not mutate the catalog

- GIVEN a workspace created from a starter template
- WHEN the user edits the workspace
- THEN the original starter template MUST remain unchanged
