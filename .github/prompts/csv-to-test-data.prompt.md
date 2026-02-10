# Convert CSV Test Data to JSON Test Data Files

## Task

Take two CSV files as input and directly create JSON test data files for the packing list parser smoke tests. Do not create intermediate scripts - process the data and create the JSON files directly.

The reference CSV provides the correct Application IDs which are matched to test results by filename.

## Input Files

### File 1: Test Results CSV

- Has a header row
- Format: `ID,Folder,SubFolder,FileName,Expected,Actual,Matching,Message`
- The `FileName` column is used for matching
- The `Expected` and `Message` columns determine test expectations

### File 2: Reference CSV (contains Application IDs)

- No header row
- Format: `ModelName,FileName,ApplicationId`
- The `FileName` column (column 2) is used for matching
- The `ApplicationId` column (column 3) provides the correct ID values
- Handle scientific notation (e.g., `1.81618E+12` → `1816180000000`)

## Required Variables

Before processing, define these variables:

- `[MODEL_NAME]`: The model identifier (e.g., "SAVERS1", "TESCO2", "ASDA3")
- `[MODEL_FOLDER]`: The folder name, derived from MODEL_NAME (e.g., "Savers", "Tesco", "ASDA")
- `[MODEL_NOMATCH]`: Value when model doesn't match (typically "NOMATCH")

## Transformations

### 1. Test Names

- Remove file extension (.xlsx, .csv, .pdf)
- Add spaces between capital letters (e.g., "HappyPath" → "Happy Path")
- Replace underscores with spaces (e.g., "Test_Case" → "Test Case")

### 2. File Names (inputs.fileName)

- Convert to lowercase
- Remove spaces
- Replace underscores with hyphens (e.g., "Test_Case.xlsx" → "test-case.xlsx")
- Remove special characters such as parentheses, brackets

### 3. Row Numbers

- For .xlsx, .xls, or .csv files: increment all row numbers in messages by 1
- This accounts for the header row in spreadsheet formats

### 4. Approval Status (expectedResults.approvalStatus)

| Expected | Message Contains                                      | approvalStatus        |
| -------- | ----------------------------------------------------- | --------------------- |
| Pass     | -                                                     | `approved`            |
| Fail     | "Country of Origin", "CoO", "ISO Code"                | `rejected_coo`        |
| Fail     | "Prohibited item", "illegitimate items", "ineligible" | `rejected_ineligible` |
| Fail     | (other)                                               | `rejected_other`      |
| Unparse  | -                                                     | `rejected_other`      |

### 5. Model Assignment (expectedResults.model)

| Condition                                      | Model Value       |
| ---------------------------------------------- | ----------------- |
| Message = "Check GB Establishment RMS Number." | `NOREMOS`         |
| Expected = "Unparse"                           | `[MODEL_NOMATCH]` |
| All other cases                                | `[MODEL_NAME]`    |

### 6. Reasons for Failure (expectedResults.reasonsForFailure)

- Copy the Message column value exactly (preserve quotes and formatting)
- Use `null` when Message is empty
- **Newline formatting**:
  - Multiple sentences: Add `\n` between each AND end with `\n`
  - Single sentence: End with `\n` EXCEPT for "Check GB Establishment RMS Number."

### 7. File Organization

- Create directory: `test/utilities/environment-data/test/[MODEL_FOLDER]/`
- Group tests by SubFolder from CSV (e.g., SAVERS1_Basic → basic category)
- File naming format: `model[N]-[category].json` (lowercase)
  - Example: `model1-basic.json`, `model1-coo.json`, `model1-netweight.json`
  - The model number comes from the SubFolder prefix (e.g., "SAVERS1_Basic" → "model1", "TESCO2_CoO" → "model2")
  - The category comes from the SubFolder suffix (e.g., "SAVERS1_Basic" → "basic")

### 8. Update Profile Utils

- Add retailer prefix to `retailerPrefixes` in `test/utilities/profile-utils.js`
- Use lowercase key and proper case value (e.g., `savers: 'Savers'`)

## Output JSON Structure

```json
{
  "name": "[MODEL_NAME] [Category Display Name]",
  "tests": [
    {
      "testName": "[Descriptive Test Name]",
      "inputs": {
        "fileName": "[lowercase-with-hyphens.xlsx]",
        "applicationId": "[ApplicationId from Reference CSV]"
      },
      "expectedResults": {
        "approvalStatus": "[approved|rejected_coo|rejected_ineligible|rejected_other]",
        "reasonsForFailure": "[Message with newlines or null]",
        "model": "[MODEL_NAME|MODEL_NOMATCH|NOREMOS]"
      }
    }
  ]
}
```

## Unmatched Files Report

After processing, report any unmatched files:

- List filenames from test results with no match in reference CSV
- List filenames from reference CSV with no match in test results
- Include counts for each category

## Example

**Input - Test Results CSV:**

```csv
ID,Folder,SubFolder,FileName,Expected,Actual,Matching,Message
1,"packing-lists","SAVERS1_Basic","Happypath_Pass.xlsx","Pass","Pass","Pass",""
2,"packing-lists","SAVERS1_Basic","Empty_RMS_Fail.xlsx","Fail","Fail","Pass","Check GB Establishment RMS Number."
```

**Input - Reference CSV:**

```csv
SAVERS1_Basic,Happypath_Pass.xlsx,1816178189770
SAVERS1_Basic,Empty_RMS_Fail.xlsx,1816178190421
```

**Output - test/utilities/environment-data/test/Savers/model1-basic.json:**

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

1. Attach both CSV files to your prompt
2. Specify the required variables:
   - MODEL_NAME: "SAVERS1"
   - MODEL_FOLDER: "Savers"
   - MODEL_NOMATCH: "NOMATCH"
3. Ask Copilot to process and create JSON test data files

## Tips

- Review SubFolder groupings to ensure logical JSON file organization
- Verify scientific notation IDs are properly expanded
- Check test names are readable after transformation
- Confirm newline formatting in reasonsForFailure messages
