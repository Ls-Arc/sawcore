# core-engine Specification

## Purpose

Define the v0.1 calculation contract for a parametric wood parts engine. The scope is narrow: deterministic part breakdowns, normalized units, and allowances.

## Requirements

### Requirement: Deterministic calculation output

The system MUST produce the same calculated result for the same valid inputs.

#### Scenario: Repeated calculation is stable

- GIVEN the same project, cabinet, and dimensional inputs
- WHEN the engine calculates parts twice
- THEN both results MUST be identical
- AND the result MUST include the same part breakdown

#### Scenario: Invalid input is rejected

- GIVEN an input with missing or invalid dimensions
- WHEN the engine calculates parts
- THEN the engine MUST reject the request
- AND it MUST NOT return a partial result

### Requirement: Units and allowances are explicit

The system MUST treat units and allowances as part of the calculation contract.

#### Scenario: Valid units are accepted

- GIVEN valid dimensional inputs with declared units
- WHEN the engine calculates parts
- THEN the result MUST reflect the declared units consistently
- AND allowances MUST be applied in the output

#### Scenario: Ambiguous units are rejected

- GIVEN dimensional inputs without a declared unit
- WHEN the engine calculates parts
- THEN the engine MUST reject the request
