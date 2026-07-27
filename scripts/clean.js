import fs from 'node:fs/promises'
import path from 'node:path'

const directories = ['allure-results', 'allure-report']

await Promise.all(
  directories.map(async (directory) => {
    const target = path.resolve(process.cwd(), directory)
    await fs.rm(target, { recursive: true, force: true })
  })
)
