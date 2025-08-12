const express = require("express");
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

// cart에 item 추가하기
router.post("/", authController.authenticate, cartController.addItemToCart);

// cart items 가져오기
router.get("/", authController.authenticate, cartController.getCartItems);

// cart item 삭제하기
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);

// cart item 별 수량 업데이트
router.put(
  "/:id",
  authController.authenticate,
  cartController.updateCartItemQty
);

// cart items qty 가져오기
router.get("/qty", authController.authenticate, cartController.getCartItemsQty);

module.exports = router;
