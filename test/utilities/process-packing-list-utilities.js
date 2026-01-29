import testData from './environment-data/test/test-data.js'
import perfTestData from './environment-data/perf-test/perf-test-data.json'
import prodData from './environment-data/prod/prod-data.json'
import { baseUrl, defaultEstablishmentId, environmentToTest } from './config.js'
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
  switch (environmentToTest) {
    case 'test':
    case undefined:
      data = addBaseUrlToTests(testData)
      break
    case 'perf-test':
      data = addBaseUrlToTests(perfTestData)
      break
    case 'prod':
      data = addBaseUrlToTests(prodData)
      break
    default:
      data = []
  }

  // Filter by model profile if specified
  const profile = process.env.PROFILE?.toLowerCase()
  const parsed = parseModelProfile(profile)
  if (parsed) {
    data = data.filter(({ name }) => {
      const nameLower = name.toLowerCase()
      const retailerLower = parsed.retailer.toLowerCase()
      // Check retailer matches (case-insensitive)
      if (!nameLower.includes(retailerLower)) return false
      // If model number specified, check it matches (e.g., 'NISA1 Basic' includes 'nisa1')
      if (parsed.model && !nameLower.includes(retailerLower + parsed.model))
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
