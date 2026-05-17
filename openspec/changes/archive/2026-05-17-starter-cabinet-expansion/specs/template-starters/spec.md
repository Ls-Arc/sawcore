# Delta for template-starters

## MODIFIED Requirements

### Requirement: Limited starter template set

The system MUST provide exactly two approved starter cabinet templates for v0.1: one base starter and one wall-cabinet starter.
The approved set MUST NOT contain a third starter template.
(Previously: The system MUST provide one or two starter cabinet templates.)

#### Scenario: Starter list exposes the approved pair

- GIVEN a user requests starter templates
- WHEN the system returns the catalog
- THEN it MUST include the base starter and the wall-cabinet starter
- AND it MUST contain exactly two templates

#### Scenario: Unsupported template is rejected

- GIVEN a template name outside the approved starter set
- WHEN the user selects it
- THEN the system MUST reject the selection
- AND it MUST NOT add the template to the approved set

### Requirement: Starter templates initialize a workspace

The system MUST create an initial workspace from a selected approved starter template, preserving that template's cabinet setup and default construction profile.
Starter templates MUST remain plain cabinet setups and MUST NOT introduce drawer or door-first-class modeling.
(Previously: The system MUST create an initial workspace setup from a selected starter template, including the template's default construction profile. Starter templates MUST seed an approved cabinet setup and construction profile that can be used without additional configuration.)

#### Scenario: Template seeds a new workspace

- GIVEN an approved starter template
- WHEN the user creates a workspace from it
- THEN the workspace MUST start with the template-defined cabinet setup
- AND it MUST include the template's default construction profile

#### Scenario: Starter changes do not mutate the catalog

- GIVEN a workspace created from a starter template
- WHEN the user edits the workspace
- THEN the original starter template MUST remain unchanged
