const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const authController = {};

// 이메일 로그인
authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const isConfirmPassword = bcrypt.compareSync(password, user.password);
      if (isConfirmPassword) {
        const token = user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 구글 로그인
authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = "" + Math.floor(Math.random() * 1000000);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);

      user = await new User({ email, password: newPassword, name });
      await user.save();
    }
    // 토큰발행
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: "success", user, token: sessionToken });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 토큰으로 유저 아이디 가져오기
authController.authenticate = async (req, res, next) => {
  try {
    // 프론트에서 header에 세팅했으니까 header에서 가져옴
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("Invalid token");
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 관리자 권한 확인
authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== "admin") throw new Error("no permission");
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = authController;
