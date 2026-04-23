require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");

async function reset() {
  try {
    await connectDB();
    try {
      await mongoose.connection.dropDatabase();
      console.log("Database dropped successfully");
      return;
    } catch (error) {
      // Atlas users often cannot drop a database; clear all collections as fallback.
      if (error?.codeName !== "AtlasError") {
        throw error;
      }

      const collections = await mongoose.connection.db.listCollections().toArray();
      for (const { name } of collections) {
        if (name.startsWith("system.")) continue;
        await mongoose.connection.db.collection(name).deleteMany({});
      }
      console.log("All collections cleared successfully");
    }
  } catch (error) {
    console.error("Database reset failed", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

reset();
