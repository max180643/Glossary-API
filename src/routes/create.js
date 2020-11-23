const router = require('express').Router();
const firebase = require('firebase');
const { nanoid } = require('nanoid');
// const verify = require('./verifyToken');

require('firebase/firestore');
require('../lib/firebase');
require('dotenv').config();

const maxLimit = 4;
let countLimit = 0;

// router.get('/', verify, (req, res) => {
//   res.send({
//     post: 'Hello World',
//     response: req.body,
//   });
// });

const genPublicID = async () => {
  if (countLimit > maxLimit) return 'timeout';
  countLimit += 1;
  const id = nanoid(5);
  const isExist = await firebase.firestore().collection('Glossary').doc(id).get()
    .then((doc) => (!doc.exists ? id : genPublicID()));
  return isExist;
};

const genPrivateID = async () => {
  if (countLimit > maxLimit) return 'timeout';
  countLimit += 1;
  const id = nanoid(6);
  const isExist = await firebase.firestore().collection('GlossaryPrivate').doc(id).get()
    .then((doc) => (!doc.exists ? id : genPrivateID()));
  return isExist;
};

// create new glossary
router.post('/glossary', async (req, res) => {
  try {
    const {
      name, description, type, owner, owner_id, glossary,
    } = req.body;

    countLimit = 0;

    let id;

    if (type === 'private') {
      id = await genPrivateID();
    } else {
      id = await genPublicID();
    }

    const data = (id === 'timeout') ? { status: 'failure', response: 'Timeout! can\'t generate ID. Please try again later.', code: 500 } : await firebase.firestore()
      .collection(type === 'private' ? 'GlossaryPrivate' : 'Glossary')
      .doc(id)
      .set({
        name,
        description,
        like: 0,
        type,
        owner,
        owner_id,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(async () => {
        await firebase.firestore()
          .collection('GlossaryData').doc(id).set({
            data: glossary,
          });
      })
      .then(() => ({
        status: 'success',
        response: {
          id,
          name,
          description,
          type,
          owner,
          owner_id,
          glossary,
        },
      }));

    if (data.status === 'failure') {
      res.send({
        status: data.status,
        response: data.response,
      }, data.code);
    } else {
      res.send({
        status: data.status,
        response: data.response,
      }, 201);
    }
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

// create new public glossary
router.post('/public', async (req, res) => {
  try {
    const {
      name, description, like, type, owner, owner_id,
    } = req.body;

    countLimit = 0;
    const id = await genPublicID();

    const data = (id === 'timeout') ? { status: 'failure', response: 'Timeout! can\'t generate ID. Please try again later.', code: 500 } : await firebase.firestore()
      .collection('Glossary')
      .doc(id)
      .set({
        name,
        description,
        like,
        type,
        owner,
        owner_id,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => ({
        status: 'success',
        response: {
          id,
          name,
          description,
          like,
          type,
          owner,
          owner_id,
        },
      }));

    if (data.status === 'failure') {
      res.send({
        status: data.status,
        response: data.response,
      }, data.code);
    } else {
      res.send({
        status: data.status,
        response: data.response,
      }, 201);
    }
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

// create new private glossary
router.post('/private', async (req, res) => {
  try {
    const {
      name, description, like, type, owner, owner_id,
    } = req.body;

    countLimit = 0;
    const id = await genPrivateID();

    const data = (id === 'timeout') ? { status: 'failure', response: 'Timeout! can\'t generate ID. Please try again later.', code: 500 } : await firebase.firestore()
      .collection('GlossaryPrivate')
      .doc(id)
      .set({
        name,
        description,
        like,
        type,
        owner,
        owner_id,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => ({
        status: 'success',
        response: {
          id,
          name,
          description,
          like,
          type,
          owner,
          owner_id,
        },
      }));

    if (data.status === 'failure') {
      res.send({
        status: data.status,
        response: data.response,
      }, data.code);
    } else {
      res.send({
        status: data.status,
        response: data.response,
      }, 201);
    }
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

module.exports = router;

// todo
// - type validation (create)
