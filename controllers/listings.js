const Listing = require("../models/listing");

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports.index = async (req, res) => {
  const { category, search } = req.query;
  const categories = Listing.schema.path("category")?.enumValues || [];
  const filter = {};
  let activeCategory = null;
  const searchTerm = typeof search === "string" ? search.trim() : "";

  if (category && categories.includes(category)) {
    filter.category = category;
    activeCategory = category;
  }

  if (searchTerm) {
    const searchRegex = new RegExp(escapeRegex(searchTerm), "i");
    filter.$or = [{ location: searchRegex }, { country: searchRegex }];
  }

  const allListing = await Listing.find(filter);
  res.render("listings/index", { allListing, categories, activeCategory, searchTerm });

}


module.exports.renderNewForm = (req,res) =>{
  const categories = Listing.schema.path("category")?.enumValues || [];
  res.render("listings/new.ejs", { categories });
};


module.exports.showListing = (async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path:'reviews',populate:{path:"author"},}).populate("owner");
  if (!listing) {
     req.flash("error", "Listing does not exist!")
     return res.redirect("/listings")
  }
  
  res.render("listings/show.ejs", { listing });

});


module.exports.creatListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  if (req.file) {
    newListing.image = { url: req.file.path, filename: req.file.filename };
  }
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  const categories = Listing.schema.path("category")?.enumValues || [];
  let originalImageUrl= listing.image.url;
  originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250")
  res.render("listings/edit.ejs", { listing,originalImageUrl, categories });
};


module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }
  req.flash("success","Listing updated!");
  return res.redirect(`/listings/${id}`);
};



module.exports.destroyListing =async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    req.flash("error", "Listing not found, nothing was deleted.");
    return res.redirect("/listings");
  }
  req.flash("success","Listing deleted!")
  res.redirect("/listings");
};
