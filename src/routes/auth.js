const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  // Create and assign a token
  const token = jwt.sign({ id: req.body.id }, process.env.TOKEN_SECRET);
  res.header('Auth-Token', token).send({
    token,
  });
});

module.exports = router;
