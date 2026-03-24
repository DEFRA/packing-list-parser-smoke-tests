Smoke Test Data Structure

Tests in [process-packing-list.e2e.js](../../specs/process-packing-list.e2e.js) are designed to run tests in a repeatable format. To make them easier to maintain they use a data structure similar to the sample below, which when combined with information from [config.js](../config.js) are used to create a sample message that can be sent to the process-packing-list endoint and describe what it expects to receive back as a response

```
Input data

[
  {
    "name": "Packing List Smoke tests (name of the test suite)",
    "tests": [
      {
        "testName": "ASDA3 | Happypath Pass (name of the test)",
        "inputs": {
          "fileName": "happypath-pass.xlsx", // used to identify the file in blob storage
          "applicationId": "1816178161495" // Required by the message and used to find the blob location
        },
        "expectedResults": {
          "approvalStatus": "approved",
          "reasonsForFailure": null,
          "model": "ASDA3"
        }
      },
      // more tests
    ]
  }
]
```

This relies on the following values beings set in config.js

packingListBaseUrl - The path to the application forms folder
defaultEstablishmentId - The guid for a dispatch location
