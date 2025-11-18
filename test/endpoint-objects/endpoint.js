class Endpoint {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  get(path = '') {
    const url = `http://localhost:3001/${this.baseUrl}/${path}`
    return fetch(url)
  }
}

export { Endpoint }
