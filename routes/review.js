const express = require("express");
const router = express.Router({mergeParams:true});

const wrapAsync = require('../utils/wrapasync');
const {  reviewSchema } = require('../schema.js');
const expresserror = require('../utils/expresserror');
const Listing = require('../models/listing');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");


//Reviews
router.post("/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview));

//Delete review route (optional, not implemented in the frontend yet)
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;
