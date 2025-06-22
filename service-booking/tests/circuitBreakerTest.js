import { connectDatabase, disconnectDatabase } from "../util.js/database.js";

const testActive = false;
let firstTime = true;

export async function test() {
  if (testActive) {
    // mongoose.connection.readyState
    if (firstTime) {
      firstTime = false;
      setTimeout(() => {
        console.log("Attempting to disconnect to database on purpose..");
        disconnectDatabase();
      }, 5000);
      setTimeout(() => {
        console.log("Attempting to reconnect to database on purpose.");
        connectDatabase();
      }, 20000);
    }
  }
}
