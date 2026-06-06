import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const service = process.argv[2] ?? 'server'
const defaultPorts: Record<string, string> = {
  server: '8080',
  'saas-dx': '8081',
  'saas-crm': '8082',
  'saas-attendance': '8083',
  'saas-contract': '8084',
  'saas-chat': '8085',
  'saas-rag': '8086',
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const backend = path.join(root, 'backend')

const goCandidates = [
  process.env.GO,
  process.platform === 'win32'
    ? path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Go', 'bin', 'go.exe')
    : '/usr/local/go/bin/go',
  'go',
].filter((c): c is string => Boolean(c))

const go = goCandidates.find((c) => c === 'go' || existsSync(c)) ?? 'go'

const child: ChildProcess = spawn(go, ['run', `./cmd/${service}`], {
  cwd: backend,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT ?? defaultPorts[service] ?? '8080',
  },
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
