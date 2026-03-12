const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapasync');
const { listingschema } = require('../schema.js');
const expresserror = require('../utils/expresserror');
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js")

const upload = multer({ storage });

const ListingController = require("../controllers/listings.js");

const validateListing = (req, res, next) => {
  const { error } = listingschema.validate(req.body);

  if (error) {
    let errorMessage = error.details.map(el => el.message).join(',');
    throw new expresserror(errorMessage, 400);
  } else {
    next();
  }
};

//New router
router.get("/new", isLoggedIn, ListingController.renderNewForm);

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(isLoggedIn,  upload.single('listing[image]'),validateListing, wrapAsync(ListingController.creatListing));
  


router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(ListingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

module.exports = router;
