class Endpoint {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  get(path) {
    return fetch(`${this.baseUrl}/${path}`)
  }
}

export { Endpoint }
