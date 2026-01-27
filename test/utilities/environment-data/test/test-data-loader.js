import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Dynamically loads all model test data from their respective folders
 * @returns {Array} Combined array of all model test data
 */
export function loadTestData() {
  const testData = []
  const baseDir = __dirname

  // Define the model folders to load
  const modelFolders = [
    'ASDA',
    'Giovani',
    'Iceland',
    'M&S',
    'NISA',
    'Sainsburys'
  ]

  modelFolders.forEach((modelFolder) => {
    const folderPath = join(baseDir, modelFolder)

    // Read all JSON files in the model folder
    const files = readdirSync(folderPath).filter((file) =>
      file.endsWith('.json')
    )

    files.forEach((file) => {
      const filePath = join(folderPath, file)
      const fileContent = readFileSync(filePath, 'utf-8')
      const modelData = JSON.parse(fileContent)
      testData.push(modelData)
    })
  })

  return testData
}

// Export the loaded data as default
export default loadTestData()
