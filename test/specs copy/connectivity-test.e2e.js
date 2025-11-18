import { ConnectivityTestEndpoint } from '../endpoint-objects/connectivity-check.endpoint.js'

describe('Connectivity Check Endpoint', () => {
  it('should return status 200', async () => {
    const endpoint = new ConnectivityTestEndpoint()
    const response = await endpoint.get()
    expect(response.status).toBe(200)
  })
})
