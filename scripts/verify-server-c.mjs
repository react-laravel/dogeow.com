import https from 'node:https'
import { checkServerIdentity } from 'node:tls'

const hosts = process.argv.slice(2)
if (!hosts.length || hosts.some(host => !['dogeow.com', 'www.dogeow.com'].includes(host))) {
  throw new Error('Expected the configured homepage domains.')
}
function request(host, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: '120.26.21.64',
        port: 443,
        servername: host,
        path,
        method,
        rejectUnauthorized: true,
        checkServerIdentity: (_hostname, certificate) => checkServerIdentity(host, certificate),
        headers: { Host: host, 'User-Agent': 'main-sites-deploy-health' },
        timeout: 20000,
      },
      res => {
        const chunks = []
        res.on('data', data => chunks.push(data))
        res.on('error', reject)
        res.on('end', () =>
          resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') })
        )
      }
    )
    req.on('timeout', () => req.destroy(new Error(`Timeout checking ${host}${path}`)))
    req.on('error', reject)
    req.end()
  })
}
for (const host of hosts) {
  for (const route of ['/']) {
    const page = await request(host, route)
    if (page.status !== 200) throw new Error(`${host}${route}: HTTP ${page.status}`)
    const assets = [
      ...new Set(
        [...page.body.matchAll(/(?:src|href)="([^"]+)"/g)]
          .map(match => new URL(match[1], `https://${host}/`))
          .filter(
            url =>
              url.hostname === host && /\.(?:js|css|svg|png|ico|woff2?)(?:$|\?)/.test(url.pathname)
          )
          .map(url => url.pathname + url.search)
      ),
    ]
    if (!assets.length) throw new Error(`${host}${route}: no local homepage assets found`)
    for (const asset of assets) {
      const response = await request(host, asset, 'HEAD')
      if (response.status !== 200) throw new Error(`${host}${asset}: HTTP ${response.status}`)
    }
    console.log(`${host}${route}: HTTP 200 and ${assets.length} assets verified directly on C`)
  }
}
