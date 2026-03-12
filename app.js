if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const path = require('path');
const override = require('method-override');
const ejsMate = require('ejs-mate');
const expresserror = require('./utils/expresserror');
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const dns = require("dns")

const { log } = require('console');

// Change DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRoueter = require("./routes/user.js")

const dbUrl  =process.env.ATLASDB_URL;

app.use(override('_method'));
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

main()
  .then(() => { console.log('Connected to MongoDB') })
  .catch(err => console.log('Error connecting to MongoDB:', err));


const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter : 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.searchTerm =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  next();
});

// app.get("/demouser",async  (req, res) => {
//   let FakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });
//   let registeredUser = await User.register(FakeUser, "helloworld");
//   res.send(registeredUser);

// });
app.use("/listings", listingsRouter);

app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",userRoueter)

async function main() {
  await mongoose.connect(dbUrl);
}





app.all(/.*/, (req, res, next) => {
  next(new expresserror("Page Not Found", 404));
});


app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something Went Wrong";
  res.status(statusCode).render("listings/error", { err: { statusCode, message } });
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

