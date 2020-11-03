const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Auth-Token');
  if (!token) {
    return res.send({
      error: 'Access Denied',
    }, 401);
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.body = verified;
    next();
  } catch (error) {
    res.send({
      error: 'Invalid Token',
    }, 400);
  }
};

module.exports = verifyToken;
