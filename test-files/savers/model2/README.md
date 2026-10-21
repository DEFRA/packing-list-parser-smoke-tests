# SAVERS2 CSV test fixtures

These CSV files are the source packing lists that back the `SAVERS2` smoke-test
cases defined in `test/utilities/environment-data/test/Savers/model2-*.json`.

They are **not** read directly by the test run. The smoke tests download the
packing list from blob storage using a URL built from each test's
`applicationId` and `fileName`:

```
${baseUrl}/${applicationId}/supplementary-documents/${fileName}
```

## How to use

1. Upload each CSV in this folder to the test-environment blob storage under a
   real application's `supplementary-documents/` path.
2. Replace the `"applicationId": "REPLACE_ME"` placeholder in the matching
   `model2-*.json` test entry with the real application ID you uploaded under.
   The `fileName` already matches the CSV name in this folder.

## File layout

Each CSV uses the minimal layout the parser expects:

- Row 1 (or rows 1-2): establishment / REMOS preamble.
- The next row: the mandatory SAVERS2 column header.
- Following rows: product line data (data begins on CSV line 3).

Fail cases that report row numbers use three bad data rows, so the parser
produces messages referencing "rows 3, 4 and 5".

## Expected outcome per file

| File                                                     | Model   | Outcome                                                    |
| -------------------------------------------------------- | ------- | ---------------------------------------------------------- |
| happypath-pass.csv                                       | SAVERS2 | approved                                                   |
| descriptionhasdoublequotesshould-pass.csv                | SAVERS2 | approved                                                   |
| mandatoryheaders-caseinsensitive-pass.csv                | SAVERS2 | approved                                                   |
| notnirms-pass.csv                                        | SAVERS2 | approved (Non-NIRMS, CoO not required)                     |
| filler-rows-dropped-pass.csv                             | SAVERS2 | approved (blank rows dropped)                              |
| differentcountryestablishmentnumbersincludinggb-pass.csv | SAVERS2 | approved (single GB RMS)                                   |
| empty-rms-fail.csv                                       | NOREMOS | rejected_other — Check GB Establishment RMS Number.        |
| invalidestablishmentformats-fail.csv                     | NOREMOS | rejected_other — Check GB Establishment RMS Number.        |
| incorrect-mandatoryheader-all-unparse.csv                | NOMATCH | rejected_other (valid REMOS, no retailer match)            |
| missing-mandatoryheader-netweight-unparse.csv            | NOMATCH | rejected_other (Net Weight column removed)                 |
| invalidformat-rmsgb-000000-000-unparse.csv               | NOMATCH | rejected_other (REMOS valid format, wrong number)          |
| missing-mandatorydata-desc-fail.csv                      | SAVERS2 | rejected_other — Product description is missing            |
| nullnirms-fail.csv                                       | SAVERS2 | rejected_other — NIRMS/Non-NIRMS goods not specified       |
| incorrect-netweightdata-all-fail.csv                     | SAVERS2 | rejected_other — Total net weight is invalid               |
| missing-uom-weight-fail.csv                              | SAVERS2 | rejected_other — Net Weight Unit of Measure (kg) not found |
| invalid-unit-type-fail.csv                               | SAVERS2 | rejected_other — Net Weight Unit of Measure (kg) not found |
| multipledifferent-establishment-numbers-fail.csv         | SAVERS2 | rejected_other — Multiple GB Place of Dispatch numbers     |
| nullcoo-fail.csv                                         | SAVERS2 | rejected_coo — Missing Country of Origin                   |
| invalidcoo-fail.csv                                      | SAVERS2 | rejected_coo — Invalid Country of Origin ISO Code          |
| highriskcootreatmenttypespecified-fail.csv               | SAVERS2 | rejected_ineligible — Prohibited item identified           |

## Notes / caveats

- Expected failure messages assume the data rows land on CSV lines 3, 4 and 5.
  If you add preamble rows, the row numbers in the JSON `reasonsForFailure`
  must be updated to match.
- `highriskcootreatmenttypespecified-fail.csv` relies on the `BR` + commodity
  code `0207…` ineligible rule. The commodity codes are quoted to preserve the
  leading zero; confirm the uploaded file keeps it.
- A valid GB REMOS (`RMS-GB-000247-002`) is required for a file to be matched as
  SAVERS2. Files that omit it are intentionally NOREMOS/NOMATCH cases.
