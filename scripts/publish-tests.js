import { spawnSync } from 'node:child_process'

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status)
  }
}

run('npm', ['run', 'report'])

const destination = process.env.RESULTS_OUTPUT_S3_PATH
if (!destination) {
  console.error('RESULTS_OUTPUT_S3_PATH is not set')
  process.exit(1)
}

run('aws', ['s3', 'cp', '--quiet', 'allure-report', destination, '--recursive'])
console.log(`Test results published to ${destination}`)
