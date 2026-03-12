const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    const data = initData.data.map((obj) => ({
      ...obj,
      image:
        typeof obj.image === "string"
          ? { url: obj.image, filename: "listingimage" }
          : {
              url: obj.image?.url || "",
              filename: obj.image?.filename || "listingimage",
            },
      owner: "69aac33d78d7b7c792c4c040",
    }));
    await Listing.insertMany(data);
    console.log("data was initialized");
  } finally {
    await mongoose.connection.close();
  }
};

initDB();
