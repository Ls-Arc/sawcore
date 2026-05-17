# Delta for template-starters

## MODIFIED Requirements

### Requirement: Starter templates initialize a workspace

The system MUST create an initial workspace setup from a selected starter template, including the template's default construction profile.

Starter templates MUST seed an approved cabinet setup and construction profile that can be used without additional configuration.
(Previously: starter templates only seeded the basic cabinet setup.)

#### Scenario: Template seeds a workspace with defaults

- GIVEN an approved starter template
- WHEN the user creates a workspace from it
- THEN the workspace MUST start with the template-defined cabinet setup
- AND it MUST include the template's default construction profile

#### Scenario: Template changes do not mutate the catalog

- GIVEN a workspace created from a starter template
- WHEN the user edits the workspace
- THEN the original starter template MUST remain unchanged
