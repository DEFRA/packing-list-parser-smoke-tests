import testData from './environment-data/test/test-data.js'
import perfTestData from './environment-data/perf-test/perf-test-data.json'
import { baseUrl, defaultEstablishmentId } from './config.js'
import { parseModelProfile } from './profile-utils.js'

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
  let data
  switch (process.env.ENVIRONMENT) {
    case 'test':
    case undefined:
      data = addBaseUrlToTests(testData)
      break
    case 'perf-test':
      data = addBaseUrlToTests(perfTestData)
      break
    default:
      data = []
  }

  // Filter by model profile if specified
  const profile = process.env.PROFILE?.toLowerCase()
  const parsed = parseModelProfile(profile)
  if (parsed) {
    data = data.filter(({ name }) => {
      // Check retailer matches
      if (!name.includes(parsed.retailer)) return false
      // If model number specified, check it matches (e.g., 'NISA1 Basic' includes 'NISA1')
      if (parsed.model && !name.includes(parsed.retailer + parsed.model))
        return false
      return true
    })
  }

  return data
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
