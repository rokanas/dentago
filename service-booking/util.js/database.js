import mongoose from "mongoose";
import "dotenv/config";

const mongoURI = process.env.MONGODB_URI;

export async function connectDatabase() {
  console.log("Attempting to connect to database...");
  await mongoose
    .connect(mongoURI, {})
    .catch((err) => {
      console.error(err);
      console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
      console.error(err.stack);
    })
    .then(console.log("Connected to MongoDB!"));
}

export async function disconnectDatabase() {
  await mongoose
    .disconnect()
    .catch((err) => {
      console.error(err);
      console.error(`Failed to disconnect to MongoDB with URI: ${mongoURI}`);
      console.error(err.stack);
    })
    .then(console.log("Database service was disconnected."));
}
