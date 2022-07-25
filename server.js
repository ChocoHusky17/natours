const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

console.log('Starting server..............');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shuting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

console.log('Connecting DB...');
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    // useFinAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection succesllful!');
  });

//-- Server Listening
const port = process.env.PORT || 3000;
const server = app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log(`App running on port ${port}...(${process.env.NODE_ENV})`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shuting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
