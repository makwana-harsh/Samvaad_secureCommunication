import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.model.js";

dotenv.config();

const createTestUsers = async () => {
  try {
    // Connect to MongoDB Atlas
    // await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const users = [];

    for (let i = 15; i <= 23; i++) {
      const userName = `test${i}`;

      const hashedPassword = await bcrypt.hash(
        `${userName}1234`,
        10
      );

      users.push({
        userName: userName,
        fullName: userName,
        emailId: `${userName}@gmail.com`,
        mobileNo: `987654${String(i).padStart(4, "0")}`,
        password: hashedPassword,
        bio: `This is the bio of ${userName}.`,
        location: "Patan",
        dob: new Date(`2007-01-${String(i).padStart(2, "0")}`),
      });
    }

    const createdUsers = await User.insertMany(users);

    console.log(`${createdUsers.length} test users created successfully.`);

    createdUsers.forEach((user) => {
      console.log(`Created: ${user.userName}`);
    });

  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// createTestUsers();