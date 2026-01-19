/**
 * Health endpoint object
 *
 * Thin wrapper for the health endpoint used by integration tests.
 */
import { Endpoint } from './endpoint.js'

/**
 * Endpoint helper for the health route.
 */
class HealthEndpoint extends Endpoint {
  /**
   * Construct the health endpoint helper.
   */
  constructor() {
    super('health')
  }
}

export { HealthEndpoint }
