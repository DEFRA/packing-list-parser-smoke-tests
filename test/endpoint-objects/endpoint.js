/**
 * HTTP endpoint helpers
 *
 * Base class used by endpoint objects to perform HTTP requests
 * and attach results to Allure reports.
 */
import allureReporter from '@wdio/allure-reporter'

/**
 * Base endpoint class.
 */
class Endpoint {
  /**
   * Create an endpoint helper.
   * @param {string} baseUrl - Base path for the endpoint (e.g. 'health')
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  /**
   * Perform a GET request against the endpoint and attach results.
   * @param {string} [path=''] - Optional path appended to the base endpoint
   * @returns {Promise<{status: number, data: Object}>} Response status and parsed JSON body
   */
  async get(path = '') {
    const url = `${process.env.baseEndpointUrl}/${this.baseUrl}/${path}`
    allureReporter.addStep(`GET ${url}`)

    const response = await fetch(url)
    return await this.returnResponse(response)
  }

  async post(path, message) {
    const url = `${process.env.baseEndpointUrl}/${this.baseUrl}/${path}`
    allureReporter.addStep(`POST ${url}`)

    const payload = JSON.stringify(message)

    allureReporter.addAttachment('Request', payload, 'application/json')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    })

    return await this.returnResponse(response)
  }

  /**
   * Process the HTTP response, attach details to Allure report, and return structured result.
   * @param {*} response
   * @returns
   */
  async returnResponse(response) {
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
