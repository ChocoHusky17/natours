/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review / rating / createdAt / ref to tour / ref to user

// SCHEMA
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      required: [true, 'A tour must have a rating'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Using tour and user index together to prevent same user post review on same tour, duplicate review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Populate tour & user data
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// Static function to calculate tour review stat
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // Calculate stat using aggregate
  // 'this' point to current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  // Check if there is stat
  if (stats.length > 0) {
    // Save calculated stat into db
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // In case there is no review to calculate = no stat, Save default value
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Middleware call calculate stat when create new review.
// using post to calculate after new review is saved to db
reviewSchema.post('save', function () {
  // this.constructor -> model , this -> point to current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// Middleware to set tour value to new property for post middleware when update and delete reviews
// NEW : No need to set tour value for passing value to post middleware
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   // this -> current query, create r property for post middle ware (for accessing tourId)
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });

// Middleware call calculate stat after update and delete reviews.
// using tour value from pre middleware
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  // await this.findOne(); does NOT work here, query has already executed
  // this.r.constructor.calcAverageRatings(this.r.tour);

  // NEW : post middleware can access to updated document, so no need to use pre middleware to pass tour value
  // REF : https://mongoosejs.com/docs/middleware.html#post
  await doc.constructor.calcAverageRatings(doc.tour);
  // console.log(doc);
  next();
});

// Create model base on schema
const Review = mongoose.model('Review', reviewSchema);

// Export model
module.exports = Review;
