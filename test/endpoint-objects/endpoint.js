import allureReporter from '@wdio/allure-reporter'

class Endpoint {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async get(path = '') {
    const url = `${process.env.baseEndpointUrl}/${this.baseUrl}/${path}`
    allureReporter.addStep(`GET ${url}`)

    const response = await fetch(url)
    const data = await response.json()
    allureReporter.addAttachment(
      'Response',
      JSON.stringify(data, null, 2),
      'application/json'
    )
    allureReporter.addAttachment(
      'Status',
      response.status.toString(),
      'text/plain'
    )

    return {
      status: response.status,
      data
    }
  }
}

export { Endpoint }
