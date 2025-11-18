import { Endpoint } from './endpoint.js'

class ConnectivityCheckEndpoint extends Endpoint {
  constructor() {
    super('connectivity-check')
  }
}

export { ConnectivityCheckEndpoint }
