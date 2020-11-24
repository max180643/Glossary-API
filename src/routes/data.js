const router = require('express').Router();
const firebase = require('firebase');

const Fuse = require('fuse.js');

require('firebase/firestore');
require('../lib/firebase');
require('dotenv').config();

// get all public glossary
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

// get all private glossary
router.get('/private', async (req, res) => {
  try {
    const data = await firebase.firestore().collection('GlossaryPrivate').get()
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

const SortOrder = (prop1, prop2) => function (a, b) {
  if (a[prop1][prop2] > b[prop1][prop2]) {
    return 1;
  } if (a[prop1][prop2] < b[prop1][prop2]) {
    return -1;
  }
  return 0;
};

// get public & private glossary by id
router.get('/glossary', async (req, res) => {
  try {
    const { id } = req.query;

    const publicData = await firebase.firestore().collection('Glossary').where('owner_id', '==', id).get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    const privateData = await firebase.firestore().collection('GlossaryPrivate').where('owner_id', '==', id).get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    const data = [...publicData, ...privateData].sort(SortOrder('created', 'seconds'));

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

// get public & private glossary data by id
router.get('/glossary_data', async (req, res) => {
  try {
    const { id } = req.query;

    const data = await firebase.firestore().collection('GlossaryData').doc(id).get()
      .then((doc) => doc.data());
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

// delete public or private glossary by id
router.get('/delete', async (req, res) => {
  try {
    const { id, type } = req.query;

    // todo - check element exists

    if (type === 'private') {
      await firebase.firestore().collection('GlossaryPrivate').doc(id).delete();
    } else {
      await firebase.firestore().collection('Glossary').doc(id).delete();
    }

    await firebase.firestore().collection('GlossaryData').doc(id).delete();

    res.send({
      status: 'success',
      response: `#${id} successfully deleted!`,
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
