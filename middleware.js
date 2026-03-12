const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingschema,reviewSchema } = require('./schema.js');
const expresserror = require('./utils/expresserror');

module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl  =req.originalUrl;
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login"); 
    }
    
next();
};


module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    if (!listing.owner) {
        req.flash("error", "This listing has no owner assigned. Please recreate it.");
        return res.redirect(`/listings/${id}`);
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that.");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    let errorMessage = error.details.map(el => el.message).join(',');
    throw new expresserror(errorMessage, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req,res,next) =>{
    let{id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review does not exist!");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author.equals(req.user._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
}
