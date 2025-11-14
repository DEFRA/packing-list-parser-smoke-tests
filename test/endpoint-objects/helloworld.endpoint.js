import { Endpoint } from './endpoint.js'

class HelloWorldEndpoint extends Endpoint {
  constructor() {
    super('/helloworld')
  }
}

export { HelloWorldEndpoint }
