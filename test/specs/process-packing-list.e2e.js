/**
 * process packing list endpoint tests
 *
 * Ensures the process-packing-list endpoint responds successfully.
 */
import { ProcessPackingListEndpoint } from '../endpoint-objects/process-packing-list.endpoint.js'
import {
  createProcessPackingListMessage,
  getTestCases
} from '../utilities/process-packing-list-utilities.js'

const data = getTestCases()

data.forEach(({ name, tests }) => {
  describe(`${name} tests`, () => {
    tests.forEach(({ testName, inputs, expectedResults }) => {
      it(testName, async () => {
        const endpoint = new ProcessPackingListEndpoint()
        const message = createProcessPackingListMessage(
          inputs.url,
          inputs.applicationId,
          inputs.establishmentId
        )
        const response = await endpoint.submitPackingList(message)

        expect(response.status).toBe(200)
        expect(response.data.data.parserModel).toBe(expectedResults.model)
        expect(response.data.data.approvalStatus).toBe(
          expectedResults.approvalStatus
        )
        expect(response.data.data.reasonsForFailure).toBe(
          expectedResults.reasonsForFailure
        )
      })
    })
  })
})
