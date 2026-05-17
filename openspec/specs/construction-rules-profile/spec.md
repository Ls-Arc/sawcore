# construction-rules-profile Specification

## Purpose

Define the approved construction profile attached to a cabinet setup. The profile MUST stay finite, typed, and small.

## Requirements

### Requirement: Construction profile is bounded

The system MUST accept only approved construction profile values. `backPanelFit` MUST be `overlay` or `inset`, and allowances/gaps MUST be limited to approved fields.

#### Scenario: Approved profile is accepted

- GIVEN a cabinet setup with approved construction profile values
- WHEN the profile is validated or stored
- THEN the system MUST accept it

#### Scenario: Unknown profile values are rejected

- GIVEN a profile containing an unknown mode or free-form rule set
- WHEN the profile is validated or stored
- THEN the system MUST reject it

### Requirement: Default construction profile is available

The system MUST supply a default construction profile when one is not provided.

#### Scenario: Missing profile uses defaults

- GIVEN a workspace or starter template without an explicit construction profile
- WHEN the setup is created
- THEN the system MUST apply the default profile

#### Scenario: Explicit profile is preserved

- GIVEN a workspace or template with an explicit approved profile
- WHEN the setup is created
- THEN the system MUST preserve the explicit profile
