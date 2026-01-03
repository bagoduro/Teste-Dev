const fs = require('fs');

// Load .env into process.env
const envText = fs.readFileSync('.env', 'utf8');
envText.split(/\r?\n/).forEach(line => {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
});

const registerFn = require('../api/register');
const loginFn = require('../api/login');
const meFn = require('../api/me');

function makeRes() {
  const headers = {};
  return {
    _status: 200,
    _body: null,
    _headers: headers,
    setHeader(k, v) { headers[k] = v; },
    status(code) { this._status = code; return this; },
    json(obj) { this._body = obj; return this; }
  };
}

async function callApi(fn, req) {
  const res = makeRes();
  await fn(req, res);
  return { status: res._status, body: res._body, headers: res._headers };
}

(async () => {
  try {
    const email = `test+auto@example.com`;
    const name = 'Auto Tester';
    const password = 'senha123';

    console.log('Registering user...');
    let r = await callApi(registerFn, { method: 'POST', body: { name, email, password } });
    console.log('Register result:', r.status, r.body);
    if (r.status === 409) console.log('User already exists, proceeding to login');

    console.log('Logging in user...');
    r = await callApi(loginFn, { method: 'POST', body: { email, password } });
    console.log('Login result:', r.status, r.body);
    console.log('Response headers:', r.headers);

    const setCookie = r.headers['Set-Cookie'] || r.headers['set-cookie'];
    if (!setCookie) {
      console.error('No Set-Cookie header received from login.');
      process.exit(1);
    }

    const cookieMatch = setCookie.match(/token=([^;]+)/);
    if (!cookieMatch) {
      console.error('Cookie token not found in Set-Cookie header.');
      process.exit(1);
    }
    const tokenValue = cookieMatch[1];
    console.log('Extracted token from Set-Cookie (truncated):', tokenValue.substring(0, 10) + '...');

    console.log('Calling /api/me with cookie...');
    r = await callApi(meFn, { method: 'GET', headers: { cookie: `token=${tokenValue}` } });
    console.log('/api/me result:', r.status, r.body);

    console.log('Test complete.');
  } catch (e) {
    console.error('Test error:', e);
    process.exit(1);
  }
})();
