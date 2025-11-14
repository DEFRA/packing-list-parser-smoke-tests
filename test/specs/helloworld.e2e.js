import { HelloWorldEndpoint } from '../endpoint-objects/helloworld.endpoint.js'

describe('Hello World Endpoint', () => {
  it('should return status 200', async () => {
    const response = await HelloWorldEndpoint.get('')
    expect(response.status).toBe(200)
  })
})
