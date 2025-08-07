const express = require("express");
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

// cart에 item 추가하기
router.post("/", authController.authenticate, cartController.addItemToCart);

module.exports = router;
