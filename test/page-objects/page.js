/**
 * Base page object utilities
 *
 * Provides common helpers for page objects used in UI tests.
 */
import { browser, $ } from '@wdio/globals'

/**
 * Generic page base class with common helpers.
 */
class Page {
  /**
   * Get the main page heading element.
   * @returns {Element} The heading element selected by `h1`
   */
  get pageHeading() {
    return $('h1')
  }

  /**
   * Find an element by its id attribute.
   * @param {string} id - DOM element id
   * @returns {Promise<Element>} Element promise for the id
   */
  async getById(id) {
    return $(`#${id}`)
  }

  /**
   * Get the text content for an element identified by id.
   * @param {string} id - DOM element id
   * @returns {Promise<string>} Text content of the element
   */
  async getTextForId(id) {
    const element = await this.getById(id)
    return element.getText()
  }

  /**
   * Navigate the browser to a given path.
   * @param {string} path - Path to open (relative to base URL)
   * @returns {Promise<void>} Resolves when navigation completes
   */
  open(path) {
    return browser.url(path)
  }
}

export { Page }
