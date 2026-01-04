const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connect } = require('../lib/mongo');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not defined. Set it in .env or Vercel settings.');
}

function setTokenCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production';
  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secure ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookie);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    await connect();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Registrar o lastLogin no usuário
    user.lastLogin = new Date();
    await user.save();

    const payload = { sub: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET || 'default_dev_secret', { expiresIn: '7d' });

    // Set cookie instead of returning the token in the response body
    setTokenCookie(res, token);

    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
