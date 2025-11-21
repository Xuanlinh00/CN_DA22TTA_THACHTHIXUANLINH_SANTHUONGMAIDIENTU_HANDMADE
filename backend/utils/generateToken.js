const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAMESITE || 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    domain: process.env.COOKIE_DOMAIN || undefined,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('JWT generated for user:', userId);
  }
};

module.exports = generateToken;
