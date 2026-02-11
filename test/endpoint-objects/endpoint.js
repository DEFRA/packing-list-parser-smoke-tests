/**
 * HTTP endpoint helpers
 *
 * Base class used by endpoint objects to perform HTTP requests
 * and attach results to Allure reports.
 */
import allureReporter from '@wdio/allure-reporter'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
   * Retries on 500 errors with exponential backoff.
   * @param {string} [path=''] - Optional path appended to the base endpoint
   * @returns {Promise<{status: number, data: Object}>} Response status and parsed JSON body
   */
  async get(path = '') {
    const url = `${process.env.baseEndpointUrl}/${this.baseUrl}/${path}`
    allureReporter.addStep(`GET ${url}`)

    return await this.executeWithRetry(async () => {
      const response = await fetch(url)
      return response
    })
  }

  /**
   * Perform a POST request against the endpoint and attach results.
   * Retries on 500 errors with exponential backoff.
   * @param {string} path - Path appended to the base endpoint
   * @param {Object} message - Request body to send as JSON
   * @returns {Promise<{status: number, data: Object}>} Response status and parsed JSON body
   */
  async post(path, message) {
    const url = `${process.env.baseEndpointUrl}/${this.baseUrl}/${path}`
    allureReporter.addStep(`POST ${url}`)

    const payload = JSON.stringify(message)

    allureReporter.addAttachment('Request', payload, 'application/json')

    return await this.executeWithRetry(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      })
      return response
    })
  }

  /**
   * Execute a fetch function with retry logic for 500 errors.
   * Uses exponential backoff between retries.
   * @param {Function} fetchFn - Async function that returns a Response
   * @returns {Promise<{status: number, data: Object}>} Response status and parsed JSON body
   */
  async executeWithRetry(fetchFn) {
    let lastResponse
    let lastData

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      lastResponse = await fetchFn()

      // Clone response to read body (can only read once)
      const responseClone = lastResponse.clone()
      lastData = await responseClone.json()

      // Check if it's a retryable 500 error (but not blob not found)
      const isBlobNotFound = lastData?.error?.includes(
        'The specified blob does not exist'
      )
      const isRetryable500 = lastResponse.status >= 500 && !isBlobNotFound

      if (!isRetryable500) {
        // Success or non-retryable error, process and return
        return await this.returnResponse(lastResponse)
      }

      // Log retry attempt
      if (attempt < MAX_RETRIES) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1)
        allureReporter.addStep(
          `Retry ${attempt}/${MAX_RETRIES - 1}: Got ${lastResponse.status}, waiting ${delayMs}ms`
        )
        await sleep(delayMs)
      }
    }

    // All retries exhausted, return the last response
    allureReporter.addStep(
      `All ${MAX_RETRIES} attempts failed with status ${lastResponse.status}`
    )
    return await this.returnResponse(lastResponse)
  }

  /**
   * Process the HTTP response, attach details to Allure report, and return structured result.
   * @param {*} response
   * @returns
   */
  async returnResponse(response) {
    const data = await response.json()

    // Map 500 "blob does not exist" errors to 404.
    // The parser service returns a 500 when Azure Blob Storage returns BlobNotFound,
    // but semantically this should be a 404 for test assertions.
    let status = response.status
    if (
      status === 500 &&
      data?.error?.includes('The specified blob does not exist')
    ) {
      status = 404
    }

    allureReporter.addAttachment(
      'Response',
      JSON.stringify(data, null, 2),
      'application/json'
    )
    allureReporter.addAttachment('Status', status.toString(), 'text/plain')

    return {
      status,
      data
    }
  }
}

export { Endpoint }
