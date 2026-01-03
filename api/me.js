const jwt = require('jsonwebtoken');
const { connect } = require('../lib/mongo');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connect();

    const raw = req.headers.cookie || '';
    const cookies = raw.split(';').reduce((acc, c) => {
      const [k, v] = c.split('=');
      if (!k) return acc;
      acc[k.trim()] = (v || '').trim();
      return acc;
    }, {});

    const token = cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET || 'default_dev_secret');
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
