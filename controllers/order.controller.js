const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { totalPrice, shipTo, contact, orderList } = req.body;
    const insufficientStockItems = await productController.checkItemListSock(
      orderList
    );
    // 재고가 충분하지 않은 아이템이 있다 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage, { cause: { status: "out of stock" } });
    }
    // 모든 아이템이 재고가 충분하다 => new order
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();

    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({
      status: error.cause?.status || "fail",
      message: error.message,
    });
  }
};

module.exports = orderController;
