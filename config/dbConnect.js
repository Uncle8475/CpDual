import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      "Connected to Database ",
      connect.connection.name,
      connect.connection.host
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
export default connectDb;
