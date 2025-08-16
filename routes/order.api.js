const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

router.post("/", authController.authenticate, orderController.createOrder);

// 내 주문 get order
router.get("/", authController.authenticate, orderController.getOrder);

// 관리자페이지 get order all
router.get(
  "/all",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.getOrderAll
);

// 주문 상태 수정
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrderStatus
);

// 주문 삭제
router.delete("/:id", authController.authenticate, orderController.deleteOrder);

module.exports = router;
