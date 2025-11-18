class Endpoint {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  get(path = '') {
    const url = `${process.env.baseEndpointUrl}/${this.baseUrl}/${path}`
    return fetch(url)
  }
}

export { Endpoint }
