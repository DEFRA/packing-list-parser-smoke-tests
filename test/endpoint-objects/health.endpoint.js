import { Endpoint } from './endpoint.js'

class HealthEndpoint extends Endpoint {
  constructor() {
    super('health')
  }
}

export { HealthEndpoint }
