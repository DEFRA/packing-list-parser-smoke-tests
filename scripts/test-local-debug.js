import { spawnSync } from 'node:child_process'

const result = spawnSync('npm', ['run', 'test:local'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DEBUG: 'true' }
})

process.exit(result.status ?? 1)
