import User from "../../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (userData) => {
    const existingUser = await User.findOne({
        $or: [
        { emailId: userData.emailId },
        { userName: userData.userName },
        { mobileNo: userData.mobileNo }
        ]
    });

    if (existingUser) {
        throw new Error("User with this email, username, or mobile number already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await User.create({
        fullName: userData.fullName,
        userName: userData.userName,
        emailId: userData.emailId,
        mobileNo: userData.mobileNo,
        password: hashedPassword
    });

    return { id: newUser._id, userName: newUser.userName, emailId: newUser.emailId };
};

export const loginUser = async ({ userName, userPassword }) => {
    const user = await User.findOne({ userName }).select("+password");
    if(!user){
        throw new Error("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(userPassword, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid username or password");
    }

    const accessToken = jwt.sign(
        { id: user._id, userName: user.userName },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "2m" }
    );

    const refreshToken = jwt.sign(
        { id: user._id, userName: user.userName},
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    return {
        accessToken,
        refreshToken,
        user: { id: user._id, userName: user.userName, emailId: user.emailId }
    };
};

export const verifyAndGenerateAccessToken = (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const accessToken = jwt.sign(
    { id: decoded.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  return accessToken;
};