# Delta for preview-export

## ADDED Requirements

### Requirement: Frozen validation journey keeps preview and exports aligned

The system MUST keep preview, CSV, and PDF outputs aligned for the frozen starter-seeded, material-selected validation journey. The journey MUST remain based on the current workspace state and approved material selection.

#### Scenario: Preview reflects the selected-material workspace

- GIVEN the frozen starter-seeded workspace with an approved material selected
- WHEN the user opens the preview
- THEN the preview MUST reflect that workspace state
- AND it MUST show the expected rough-cost summary when present

#### Scenario: CSV and PDF stay aligned

- GIVEN the same frozen workspace
- WHEN the user exports CSV and PDF
- THEN both exports MUST correspond to the current workspace
- AND they MUST include the same cabinet and selected-material context
