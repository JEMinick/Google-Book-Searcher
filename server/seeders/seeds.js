const db = require('../config/connection');
const { User, Book } = require('../models');

const userData = require('./userData.json');
// const bookData = require('./bookData.json');

db.once('open', async () => {
  // clean database
  await User.deleteMany({});
  // await bookSchema.deleteMany({});

  // bulk create each model
  const users = await User.insertMany(userData);
  // const books = await bookData.insertMany(bookData);

  console.log('all done!');
  process.exit(0);
});
