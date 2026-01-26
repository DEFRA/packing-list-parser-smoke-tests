import testData from './environment-data/test/test-data.js'
import perfTestData from './environment-data/perf-test/perf-test-data.json'
import { baseUrl, defaultEstablishmentId } from './config.js'

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
    case 'perf-test':
      return addBaseUrlToTests(perfTestData)
    default:
      return []
  }
}

function addBaseUrlToTests(data) {
  return data.map(({ name, tests }) => ({
    name,
    tests: tests.map((test) => ({
      ...test,
      inputs: {
        ...test.inputs,
        url: `${baseUrl}/${test.inputs.applicationId}/supplementary-documents/${test.inputs.fileName}`,
        establishmentId: test.inputs.establishmentId ?? defaultEstablishmentId
      }
    }))
  }))
}
