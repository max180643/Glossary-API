const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
  res.send({
    post: 'Hello World',
    data: req.body,
  });
});

module.exports = router;
