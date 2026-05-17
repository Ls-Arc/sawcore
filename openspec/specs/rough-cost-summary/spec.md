# rough-cost-summary Specification

## Purpose

Define the rough, approximate material cost summary derived from engine output.

## Requirements

### Requirement: Approximate cost summary is derived from engine output

The system MUST provide a rough cost summary for a workspace using only current engine output and the selected material.
The summary MUST be clearly approximate and MUST NOT claim production pricing.
The system MUST NOT use optimization, BOM detail, procurement, labor, tax, discount, currency conversion, or offcut inventory logic.

#### Scenario: Summarize cost for a valid workspace

- GIVEN a workspace with engine output and a selected material
- WHEN the system generates a cost summary
- THEN it MUST return a rough material estimate
- AND it MUST identify the summary as approximate

#### Scenario: Missing engine output blocks summary

- GIVEN a workspace without engine output
- WHEN the system requests a cost summary
- THEN it MUST not invent a total
- AND it MUST report that the summary is unavailable
