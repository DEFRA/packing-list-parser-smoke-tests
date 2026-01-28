# Prompt Template: Convert CSV Test Data to JSON Test Data Files

Use this prompt when you need to convert CSV test data files into JSON test data format for the packing list parser smoke tests.

## Prompt Template

**Required Variables:**

- `[MODEL_NAME]`: The model identifier (e.g., "NISA1", "TESCO2", "ASDA3")
- `[MODEL_FOLDER]`: Derived from MODEL_NAME - the folder name (e.g., "NISA", "Tesco", "ASDA")
- `[MODEL_NOMATCH]`: The value to use when model doesn't match (typically "NOMATCH")

````
The attached CSV files contain test data with the following columns:
- ID or Application ID: The application identifier
- FileName: The test file name
- Expected: The expected test result (Pass/Fail/Unparse)
- Actual: The actual test result (for validation)
- Matching: Whether expected matches actual
- Message: Error or validation message (optional)

Create test data JSON files for the [MODEL_NAME] model using this CSV data.

Apply these transformations:

1. **Test names**:
   - Remove file extension (.xlsx, .csv, .pdf)
   - Add spaces between capital letters (e.g., "HappyPath" → "Happy Path")
   - Replace underscores with spaces (e.g., "Test_Case" → "Test Case")

2. **File names** (inputs.fileName):
   - Convert to lowercase
   - Replace underscores with hyphens (e.g., "Test_Case.xlsx" → "test-case.xlsx")

3. **Approval status** (expectedResults.approvalStatus):
   - "Pass" → "approved"
   - "Fail" with Message containing country of origin keywords → "rejected_coo"
     - Keywords: "Country of Origin", "CoO", "ISO Code"
   - "Fail" with Message containing prohibited/ineligible item keywords → "rejected_ineligible"
     - Keywords: "Prohibited item", "illegitimate items", "ineligible"
   - "Fail" (all other cases) → "rejected_other"
   - "Unparse" → "rejected_other"

4. **Model assignment** (expectedResults.model):
   - Use "[MODEL_NOMATCH]" for:
     - Any test with Expected = "Unparse"
     - Any test with Message = "Check GB Establishment RMS Number."
   - Use "[MODEL_NAME]" for all other tests

5. **Reasons for failure** (expectedResults.reasonsForFailure):
   - Copy the Message column value (preserve exact text including quotes and formatting)
   - Use `null` when Message is empty

6. **File organization**:
   - Create directory: `test/utilities/environment-data/test/[MODEL_FOLDER]/`
   - Group tests into logical JSON files by category (e.g., basic.json, validation.json, etc.)
   - Use descriptive category names based on the test file groupings

7. **Update loader**:
   - Add "[MODEL_FOLDER]" to the modelFolders array in `test/utilities/environment-data/test/test-data-loader.js`

8. **Update profile utils**:
   - Add the retailer prefix to `retailerPrefixes` in `test/utilities/profile-utils.js` if not already present
   - Use lowercase key and proper case value (e.g., `tesco: 'Tesco'`)
   - This enables running tests with `PROFILE=[retailer]` or `PROFILE=[retailer][model]` (e.g., `PROFILE=tesco2`)

JSON structure for each file:
```json
{
  "name": "[MODEL_NAME] [Category Display Name]",
  "tests": [
    {
      "testName": "[Descriptive Test Name]",
      "inputs": {
        "fileName": "[lowercase-with-hyphens.xlsx]",
        "applicationId": "[ID from CSV]"
      },
      "expectedResults": {
        "approvalStatus": "[approved|rejected_coo|rejected_ineligible|rejected_other]",
        "reasonsForFailure": "[Message from CSV or null]",
        "model": "[MODEL_NAME|MODEL_NOMATCH]"
      }
    }
  ]
}
````

```

## Example Usage

For a new model, define your variables first:
- MODEL_NAME: "TESCO2"
- MODEL_FOLDER: "Tesco" (derived from TESCO2)
- MODEL_NOMATCH: "NOMATCH"

Then use the prompt:

```

The attached CSV files contain test data for TESCO2 model...

Required Variables:

- MODEL_NAME: "TESCO2"
- MODEL_FOLDER: "Tesco"
- MODEL_NOMATCH: "NOMATCH"

Apply these transformations:
... 4. **Model assignment**:

- Use "NOMATCH" for:
  - Any test with Expected = "Unparse"
  - Any test with Message = "Check GB Establishment RMS Number."
- Use "TESCO2" for all other tests
  ...

6. **File organization**:
   - Create directory: `test/utilities/environment-data/test/Tesco/`
     ...
7. **Update loader**:

   - Add "Tesco" to the modelFolders array in test-data-loader.js

8. **Update profile utils**:
   - Add `tesco: 'Tesco'` to retailerPrefixes in profile-utils.js

```

Then attach your CSV files and the AI will process them accordingly.

## Tips

- Group related CSV files that test similar features into the same JSON file
- Use clear category names (e.g., "basic", "validation", "net-weight", "country-of-origin")
- Check the generated test names are readable and descriptive
- Verify the model NOMATCH conditions match your specific parser's behavior
- Review a sample of the generated JSON before committing

## CSV Column Requirements

Minimum required columns:
- `ID` or `Application ID` (required)
- `FileName` (required)
- `Expected` (required)
- `Message` (optional but recommended)

Other columns are optional and used for validation purposes.
```
