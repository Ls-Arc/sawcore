# Delta for core-engine

## ADDED Requirements

### Requirement: Frozen engine cases remain deterministic

The system MUST preserve deterministic calculations for the frozen validation cases used by the real-world-validation-pack. The frozen cases MUST cover a compact/base cabinet, a wall cabinet, and an inset-back cabinet variant.

#### Scenario: Compact/base cabinet stays stable

- GIVEN the compact/base cabinet frozen fixture
- WHEN the engine calculates parts
- THEN the result MUST be deterministic
- AND the part breakdown MUST match the frozen validation expectation

#### Scenario: Wall cabinet stays stable

- GIVEN the wall cabinet frozen fixture
- WHEN the engine calculates parts
- THEN the result MUST be deterministic
- AND the part breakdown MUST match the frozen validation expectation

#### Scenario: Inset-back variant stays stable

- GIVEN the inset-back cabinet frozen fixture
- WHEN the engine calculates parts
- THEN the result MUST be deterministic
- AND the part breakdown MUST match the frozen validation expectation
