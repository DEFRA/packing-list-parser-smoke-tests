import testData from './environment-data/test-data.json'

export function createProcessPackingListMessage(
  blobUrl,
  applicationId,
  establishmentId
) {
  return {
    packing_list_blob: blobUrl,
    application_id: applicationId,
    SupplyChainConsignment: {
      DispatchLocation: {
        IDCOMS: {
          EstablishmentId: establishmentId
        }
      }
    }
  }
}

export function getTestCases() {
  switch (process.env.ENVIRONMENT) {
    case 'test':
    case undefined:
      return addBaseUrlToTests(testData)
    default:
      return []
  }
}

function addBaseUrlToTests(data) {
  const baseUrl = process.env.packingListBaseUrl || ''
  return data.map(({ name, tests }) => ({
    name,
    tests: tests.map((test) => ({
      ...test,
      inputs: {
        ...test.inputs,
        url: `${baseUrl}/${test.inputs.url}`
      }
    }))
  }))
}
