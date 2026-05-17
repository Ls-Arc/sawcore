# Delta for core-engine

## MODIFIED Requirements

### Requirement: Deterministic calculation output

The system MUST produce the same calculated result for the same valid inputs, including the declared construction profile.

The engine MUST reject invalid construction rules and MUST NOT return a partial result.
(Previously: calculation only depended on fixed cabinet dimensions.)

#### Scenario: Repeated calculation is stable

- GIVEN the same workspace, cabinet dimensions, and approved construction profile
- WHEN the engine calculates parts twice
- THEN both results MUST be identical
- AND the part breakdown MUST be the same

#### Scenario: Invalid construction rules are rejected

- GIVEN a cabinet setup with an unsupported construction rule value
- WHEN the engine calculates parts
- THEN the engine MUST reject the request
- AND it MUST NOT return a partial result

### Requirement: Units and allowances are explicit

The system MUST treat units, allowances, and supported construction gaps as part of the calculation contract.

The result MUST reflect declared units consistently, and supported allowances or gaps MUST be applied in output.
(Previously: only a single cut allowance was part of the contract.)

#### Scenario: Valid units and supported allowances are accepted

- GIVEN dimensional inputs with declared units and an approved construction profile
- WHEN the engine calculates parts
- THEN the result MUST reflect the declared units consistently
- AND the supported allowances or gaps MUST be applied

#### Scenario: Ambiguous units are rejected

- GIVEN dimensional inputs without a declared unit
- WHEN the engine calculates parts
- THEN the engine MUST reject the request
