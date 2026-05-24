const { ensureBackendReady } = require('./backend_launcher');

(async () => {
  console.log('Starting backend via backend_launcher.ensureBackendReady()');
  const proc = await ensureBackendReady();
  if (!proc) {
    console.log('No backend process started (null returned).');
    process.exit(0);
  }

  console.log('Backend process started. Waiting 2s for health...');
  await new Promise((r) => setTimeout(r, 2000));
  const http = require('http');
  const check = (port) => new Promise((resolve) => {
    const req = http.get({ hostname: '127.0.0.1', port, path: '/health', timeout: 2000 }, (res) => {
      let d = '';
      res.on('data', (c) => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });

  const p0 = await check(5000);
  const p1 = await check(5001);
  console.log('health@5000 ->', p0);
  console.log('health@5001 ->', p1);

  if (proc && proc.pid) console.log('spawned pid:', proc.pid);
  process.exit(0);
})();