import { browser, $ } from '@wdio/globals'

class Page {
  get pageHeading() {
    return $('h1')
  }

  async getById(id) {
    return $(`#${id}`)
  }

  async getTextForId(id) {
    const element = await this.getById(id)
    return element.getText()
  }

  open(path) {
    return browser.url(path)
  }
}

export { Page }
