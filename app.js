/* eslint-disable prefer-object-spread */
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start Express App
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//-- Serving Static Files (Allow access to files in specific folder via url)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/img')));

//-- Check DB connection
const CheckDB = (req, res, next) => {
  // Connection Statusnp
  // 0: disconnected
  // 1: connected
  // 2: connecting
  // 3: disconnecting
  const DBstatus = mongoose.connection.readyState;
  const status = [
    'disconnected 😵',
    'connected',
    'connecting ☕️',
    'disconnecting 👋',
  ];

  if (mongoose.connection.readyState !== 1) {
    console.log(`DB status : ${status[DBstatus]}`);

    return res.status(400).json({
      status: 'fail',
      message: `DB connection error : ${status[DBstatus]}`,
    });
  }
  next();
};

//-- GLOBLE Middleware
// Security HTTP headers
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  helmet.contentSecurityPolicy({
    // useDefaults: true,
    directives: {
      defaultSrc: [
        "'self'",
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'ws://localhost:*',
      ],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      // scriptSrc: ["'self'", 'https://*.cloudflare.com'],
      scriptSrc: [
        'self',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://*.stripe.com',
        'https://*.cloudflare.com',
        // 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js',
      ],
      frameSrc: ['self', 'https://*.stripe.com'],
      objectSrc: ['self'],
      // styleSrc: ["'self'", 'https:', 'unsafe-inline'],
      imgSrc: [
        'self',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://*.google.com',
        'data:',
      ],
      // dataSrc: ['self'],
      upgradeInsecureRequests: [],
    },
  })
);

// Limit request from same IP
const limiter = rateLimit({
  // limit 100 request in 1 hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // limit rate only /api route

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// {"email":{"$gt":""}} <- this will always return true
app.use(mongoSanitize()); // remove $ from input body, params

// Data sanitization against XSS (cross site script attack)
app.use(xss()); // convert all html code

// Prevent parameter polution
// eg: duplicate fields ?sort=duration&sort=name
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  // console.log(req.params);
  // console.log('Hello from the middleware!');
  // console.log(req.cookies);
  next();
});

app.use((req, res, next) => {
  // console.log(req.headers);
  req.requestTime = new Date().toISOString();
  next();
});

app.use(CheckDB);

//-- Router
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handle undefined route
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // next();

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // passing argument to next(), express assume it's an error
  // next('this is an error')
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error Handling Midleware
app.use(globalErrorHandler);

// //-- Routing : GET
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);

// //-- Routing : POST
// app.post('/api/v1/tours', createTour);

// //-- Routing : PATCH
// app.patch('/api/v1/tours/:id', updateTour);

// //-- Routing : DELETE
// app.delete('/api/v1/tours/:id', deleteTour);

module.exports = app;
