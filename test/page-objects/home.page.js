/**
 * Home page object
 *
 * Page object for the Home page used in UI tests.
 */
import { Page } from 'page-objects/page'

/**
 * Page object representing the Home page.
 */
class HomePage extends Page {
  /**
   * Open the Home page.
   * @returns {Promise<void>} Resolves when navigation completes
   */
  open() {
    return super.open('/')
  }
}

export default new HomePage()
