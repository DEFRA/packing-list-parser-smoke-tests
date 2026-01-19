/**
 * Health endpoint integration tests
 *
 * Verifies the health endpoint returns expected responses.
 */
import { HealthEndpoint } from '../endpoint-objects/health.endpoint.js'

describe('Health Endpoint', () => {
  it('should return status 200', async () => {
    const endpoint = new HealthEndpoint()
    const response = await endpoint.get()
    expect(response.status).toBe(200)
  })
})
