import mongoose from "mongoose";

export async function connectToDb() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "playbuddy",
    });

    console.log(`Database connected on host ${conn.connection.host}`);
  } catch (error) {
    console.log("error in connectToDb function", error);
  }
}
