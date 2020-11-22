const router = require('express').Router();
const firebase = require('firebase');
const { nanoid } = require('nanoid');
const Fuse = require('fuse.js');
const verify = require('./verifyToken');

require('firebase/firestore');
require('../lib/firebase');
require('dotenv').config();

const maxLimit = 4;
let countLimit = 0;

const genID = async () => {
  if (countLimit > maxLimit) return 'timeout';
  countLimit += 1;
  const id = nanoid(5);
  const isExist = await firebase.firestore().collection('Glossary').doc(id).get()
    .then((doc) => (!doc.exists ? id : genID()));
  return isExist;
};

router.get('/', verify, (req, res) => {
  res.send({
    post: 'Hello World',
    response: req.body,
  });
});

// get all glossary
router.get('/public', async (req, res) => {
  try {
    const data = await firebase.firestore().collection('Glossary').get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    res.send({
      status: 'success',
      response: data,
    }, 200);
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

// get top glossary
router.get('/top', async (req, res) => {
  try {
    const data = await firebase.firestore().collection('Glossary').orderBy('like', 'desc').get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    res.send({
      status: 'success',
      response: data,
    }, 200);
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

// get official glossary
router.get('/official', async (req, res) => {
  try {
    const data = await firebase.firestore().collection('Glossary').where('type', '==', 'official').get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    res.send({
      status: 'success',
      response: data,
    }, 200);
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

// get latest glossary
router.get('/latest', async (req, res) => {
  try {
    const data = await firebase.firestore().collection('Glossary').orderBy('created', 'desc').get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    res.send({
      status: 'success',
      response: data,
    }, 200);
  } catch (error) {
    res.send({
      status: 'failure',
      response: 'Something went wrong. Please try again later.',
      error,
    }, 500);
  }
});

// create new glossary
router.post('/create', async (req, res) => {
  try {
    const {
      name, description, like, type, owner,
    } = req.body;

    countLimit = 0;
    const id = await genID();

    const data = (id === 'timeout') ? { status: 'failure', response: 'Timeout! can\'t generate ID. Please try again later.', code: 500 } : await firebase.firestore()
      .collection('Glossary')
      .doc(id)
      .set({
        name,
        description,
        like,
        type,
        owner,
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

// get search query glossary
router.get('/search', async (req, res) => {
  try {
    const { query, type } = req.query;

    const fuseOptions = {
      keys: [
        'id',
        'name',
      ],
    };

    const data = type === 'official' ? await firebase.firestore().collection('Glossary').where('type', '==', 'official').get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))) : await firebase.firestore().collection('Glossary').get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    const fuse = new Fuse(data, fuseOptions);

    res.send({
      status: 'success',
      response: await fuse.search(query).map((item) => item.item),
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

// todo
// - type validation (create)
// - private / public filter (get data)
