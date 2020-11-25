const router = require('express').Router();
const firebase = require('firebase');

require('firebase/firestore');
require('../lib/firebase');
require('dotenv').config();

router.post('/glossary_data', async (req, res) => {
  try {
    const {
      id, data,
    } = req.body;

    await firebase.firestore().collection('GlossaryData').doc(id).update({
      data,
    });

    res.send({
      status: 'success',
      response: `#${id} successfully updated!`,
    }, 200);
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

module.exports = router;
