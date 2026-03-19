# Convert CSV Test Data to JSON Test Data Files (single combined CSV)

## Task

Accept a single combined CSV file that contains both the test-result fields and the reference fields (ID and ModelName) on the same row, and directly create JSON test data files for the packing list parser smoke tests. Do not create intermediate scripts — process rows and create the JSON files directly in `test/utilities/environment-data/test/`.

This combined-CSV replaces the previous two-file workflow: each row must contain the data required to build a single test entry (see Required Columns below).

## Input (single CSV)

### Required Columns (case-insensitive)

- `FileName` (required) — name of the packing list file
- `SubFolder` (required) — grouping used to derive category and `modelN-` filename
  -- `Expected` (required) — Pass / Fail / Unparse
  -- `Message` (optional) — failure / validation message (column previously named `ExpectedMessage`)
  `ID` (required where available) — the ID to place in `inputs.applicationId`
- `ModelName` (required where available) — e.g. `SAVERS1`, `TESCO2` (used as `MODEL_NAME` when present)

Additional columns that may be present and will be accepted: `ID`, `AppID`, `Model` (map to `ID`/`ModelName` respectively). If `ID` or `ModelName` are missing on some rows, those rows will be listed in the unmatched report (see Unmatched rows report).

## Required Variables (prompt-level)

The converter still needs these variables supplied once when you invoke it:

- `[MODEL_NAME]`: The primary model identifier to use for tests where `ModelName` is not provided per-row (e.g., `TESCO2`).
- `[MODEL_NOMATCH]`: Value to use when no parser could be found for the file (typically `NOMATCH`). Only applies when the system could not identify any matching parser — do **not** use this for files that were found by a parser but failed to parse.

Derive `MODEL_FOLDER` per-row by removing trailing digits from the `ModelName` value (e.g., `SAVERS1` → `SAVERS`) and using that as the directory under `test/utilities/environment-data/test/`. If a row lacks `ModelName`, fall back to the prompt-supplied `[MODEL_NAME]` to derive the folder.

## Transformations

### 1. Test Names

- Remove file extension (.xlsx, .csv, .pdf)
- Replace underscores with spaces (e.g., "Test_Case" → "Test Case")
- Split camelCase into words using a **two-pass** rule:
  1. Insert a space before an uppercase letter that starts a new word when preceded by another uppercase letter (handles acronym-word boundaries): `RMSHas` → `RMS Has`
  2. Insert a space before an uppercase letter when preceded by a lowercase letter or digit: `HasWrong` → `Has Wrong`, `3Digits` → `3 Digits`
- Apply known abbreviation normalisation **after** splitting (see table below). This corrects mixed-case variants that appear in filenames.

#### Known Abbreviations (normalise to the canonical form shown)

| As written in filename | Canonical form | Notes                                   |
| ---------------------- | -------------- | --------------------------------------- |
| `Rms`, `rms`           | `RMS`          | Registered Market Supplier reference    |
| `Gb`, `gb`             | `GB`           | Great Britain                           |
| `Coo`, `coo`, `CoO`    | `CoO`          | Country of Origin                       |
| `Tc`, `tc`             | `TC`           | Test Case prefix                        |
| `Uom`, `uom`           | `UOM`          | Unit of Measure                         |
| `Kgs`, `kgs`           | `KGS`          | Kilograms                               |
| `Nirms`, `nirms`       | `NIRMS`        | Northern Ireland Retail Movement Scheme |
| `Spl`                  | `Special`      | Expand abbreviation to full word        |
| `Noofpkgs`             | `No Of Pkgs`   | Number of Packages                      |

> If a filename contains an unrecognised abbreviation that produces an unclear test name, flag it in the unmatched rows report for manual review rather than guessing.

### 2. File Names (inputs.fileName)

- Convert to lowercase
- Remove spaces
- Replace underscores with hyphens (e.g., "Test_Case.xlsx" → "test-case.xlsx")
- Remove special characters such as parentheses and brackets
- **DO NOT** add hyphens between camelCase words (e.g., `HappyPath.xlsx` → `happypath.xlsx`)

### 3. Row Numbers

- For `.xlsx`, `.xls`, or `.csv` files: increment all row numbers mentioned in `Message` by 1 to account for the header row.

  Example: "Missing identifier on rows 2,3" becomes "Missing identifier on rows 3,4".

### 4. Approval Status (expectedResults.approvalStatus)

| Expected | Message Contains                                      | approvalStatus        |
| -------- | ----------------------------------------------------- | --------------------- |
| Pass     | -                                                     | `approved`            |
| Fail     | "Country of Origin", "CoO", "ISO Code"                | `rejected_coo`        |
| Fail     | "Prohibited item", "illegitimate items", "ineligible" | `rejected_ineligible` |
| Fail     | (other)                                               | `rejected_other`      |
| Unparse  | -                                                     | `rejected_other`      |

### 5. Model Assignment (expectedResults.model)

Apply the following mapping (checked per-row):

-- If `Message` exactly equals "Check GB Establishment RMS Number.": set model to `NOREMOS`.

- Else if `Expected` equals `Unparse` **and** `ModelName` is absent or empty (i.e., no parser was found): set model to `[MODEL_NOMATCH]` (the prompt-supplied value).
- Else: set model to the row's `ModelName` if present, otherwise use prompt `[MODEL_NAME]`.

### 6. Reasons for Failure (expectedResults.reasonsForFailure)

-- Copy the `Message` value exactly (preserve quotes and formatting).
-- Use `null` when `Message` is empty.
-- Newline formatting rules:

- Multiple sentences (multiple periods): add `\n` between each sentence and end with `\n`.
- Single sentence: end with `\n`, except when the `Message` is exactly "Check GB Establishment RMS Number." — in that case DO NOT append `\n`.

Example: `"Identifier missing in rows 3, 4. Product description missing in rows 3, 4."` → `"Identifier missing in rows 3, 4.\nProduct description missing in rows 3, 4.\n"`.

### 7. File Organization

- Create directory: `test/utilities/environment-data/test/[MODEL_FOLDER]/` (folder derived per-row from `ModelName` by stripping trailing digits and preserving casing; create if missing).
- Group tests into JSON files by `SubFolder` category. Parse `SubFolder` like `SAVERS1_Basic` → numeric prefix `1` gives `model1-`, suffix `Basic` becomes `basic`.
- File naming: `model[N]-[category].json` (all lowercase). Examples: `model1-basic.json`, `model2-coo.json`.

Derive `N` from the numeric suffix on the `ModelName` or the `SubFolder` prefix when `ModelName` is not present for a row. If `SubFolder` does not follow the expected pattern, fall back to using the numeric digit in `ModelName`.

### 8. Update Profile Utils

- If the retailer prefix is missing, add a mapping in `test/utilities/profile-utils.js` under `retailerPrefixes`.
- Use a lowercase key and use the folder casing as the value. Example: add `cds: 'CDS'` for rows with `ModelName` like `CDS2`.

Do not change `profile-utils.js` automatically; the prompt should instruct the user to add the entry if missing and show a copy-paste snippet.

## Output JSON Structure

```json
{
  "name": "[MODEL_NAME] [Category Display Name]",
  "tests": [
    {
      "testName": "[Descriptive Test Name]",
      "inputs": {
        "fileName": "[lowercase-with-hyphens.xlsx]",
        "applicationId": "[ID from CSV row]"
      },
      "expectedResults": {
        "approvalStatus": "[approved|rejected_coo|rejected_ineligible|rejected_other]",
        "reasonsForFailure": ["Message with newlines or null"],
        "model": "[MODEL_NAME|MODEL_NOMATCH|NOREMOS]"
      }
    }
  ]
}
```

## Unmatched rows report

After processing, output a short report that lists:

-- Rows where `ID` is missing (include `FileName` and row number).

- Rows where `ModelName` is missing (include `FileName`, row number) — these will fall back to prompt `[MODEL_NAME]` but must be reported.
- Duplicate `FileName` rows (if any) that may cause ambiguous matching.
- Counts for each category above.

If there are `FileName` values in the original two-file reference workflow that cannot be matched to any combined-CSV row, list them separately (if the user provides the old reference file for comparison).

## Example (combined CSV)

Input (CSV rows):

```csv
FileName,SubFolder,Expected,Message,ID,ModelName
Happypath_Pass.xlsx,SAVERS1_Basic,Pass,"",1816178189770,SAVERS1
Empty_RMS_Fail.xlsx,SAVERS1_Basic,Fail,"Check GB Establishment RMS Number.",1816178190421,SAVERS1
```

Output file (`test/utilities/environment-data/test/Savers/model1-basic.json`):

```json
{
  "name": "SAVERS1 Basic",
  "tests": [
    {
      "testName": "Happypath Pass",
      "inputs": {
        "fileName": "happypath-pass.xlsx",
        "applicationId": "1816178189770"
      },
      "expectedResults": {
        "approvalStatus": "approved",
        "reasonsForFailure": null,
        "model": "SAVERS1"
      }
    },
    {
      "testName": "Empty RMS Fail",
      "inputs": {
        "fileName": "empty-rms-fail.xlsx",
        "applicationId": "1816178190421"
      },
      "expectedResults": {
        "approvalStatus": "rejected_other",
        "reasonsForFailure": "Check GB Establishment RMS Number.",
        "model": "NOREMOS"
      }
    }
  ]
}
```

## Usage

1. Provide a single combined CSV containing the required columns (see above).
2. Supply prompt variables once: `[MODEL_NAME]` and `[MODEL_NOMATCH]`.
3. Run the converter; it will create/overwrite files under `test/utilities/environment-data/test/[MODEL_FOLDER]/` grouped by `SubFolder`.

Notes and tips:

-- Ensure `ID` is stored as text in CSV (avoid scientific notation).
-- Verify `SubFolder` patterns (e.g., `SAVERS1_Basic`) to ensure correct grouping and `modelN-` filename derivation.
-- Review the generated unmatched rows report for any missing `ID` or `ModelName` values.

If you want, request a sample conversion and I will run it against a small CSV to verify outputs.
