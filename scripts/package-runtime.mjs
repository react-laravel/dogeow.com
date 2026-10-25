import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const output = resolve(root, '.deploy-runtime')
if (!existsSync(resolve(root, 'dist/index.html'))) throw new Error('Build dist before packaging.')
rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })
cpSync(resolve(root, 'dist'), resolve(output, 'dist'), { recursive: true, dereference: true })
writeFileSync(
  resolve(output, 'DEPLOYMENT.json'),
  JSON.stringify(
    {
      revision: process.env.GITHUB_SHA || null,
      application: 'homepage',
      entry: 'dist/index.html',
      node: process.version,
    },
    null,
    2
  ) + '\n'
)
console.log('Packaged only the static dist output; no build dependencies are published.')
