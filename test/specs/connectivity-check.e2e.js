/**
 * Connectivity check endpoint tests
 *
 * Ensures the connectivity-check endpoint responds successfully.
 */
import { ConnectivityCheckEndpoint } from '../endpoint-objects/connectivity-check.endpoint.js'

describe('Connectivity Check Endpoint', () => {
  it('should return status 200', async () => {
    const endpoint = new ConnectivityCheckEndpoint()
    const response = await endpoint.get()
    expect(response.status).toBe(200)
  })
})
