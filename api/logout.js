module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Clear cookie
  const secure = process.env.NODE_ENV === 'production';
  const cookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookie);

  return res.status(200).json({ message: 'Logged out' });
};
