/**
 * Process-packing-list endpoint object
 *
 * Wrapper for the process-packing-list endpoint used by integration tests.
 */
import { Endpoint } from './endpoint.js'

/**
 * Endpoint helper for the process-packing-list route.
 */
class ProcessPackingListEndpoint extends Endpoint {
  /**
   * Construct the process-packing-list endpoint helper.
   */
  constructor() {
    super('process-packing-list')
  }

  async submitPackingList(message) {
    return super.post('?stopDataExit=true', message)
  }
}

export { ProcessPackingListEndpoint }
