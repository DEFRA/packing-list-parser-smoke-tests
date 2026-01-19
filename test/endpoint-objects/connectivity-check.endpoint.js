/**
 * Connectivity-check endpoint object
 *
 * Wrapper for the connectivity-check endpoint used by integration tests.
 */
import { Endpoint } from './endpoint.js'

/**
 * Endpoint helper for the connectivity-check route.
 */
class ConnectivityCheckEndpoint extends Endpoint {
  /**
   * Construct the connectivity-check endpoint helper.
   */
  constructor() {
    super('connectivity-check')
  }
}

export { ConnectivityCheckEndpoint }
