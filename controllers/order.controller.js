const { populate } = require("dotenv");
const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const { model } = require("mongoose");

const orderController = {};
const PAGE_SIZE = 3;

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

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (orderList.length === 0) throw new Error("주문 내역이 없습니다.");
    res.status(200).json({ status: "success", data: orderList });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

orderController.getOrderAll = async (req, res) => {
  try {
    const { page, orderNum } = req.query;
    const condition = {
      ...(orderNum && { orderNum: { $regex: orderNum, $options: "i" } }),
    };
    const populateOption = [
      { path: "userId", model: "User" },
      { path: "items.productId", model: "Product" },
    ];
    let query = Order.find(condition).populate(populateOption);
    let response = { state: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalOrderNum = await Order.find(condition).countDocuments();
      const totalPageNum = Math.ceil(totalOrderNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }
    const orderList = await query.exec();

    response.data = orderList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

orderController.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
      },
      { new: true }
    );
    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

orderController.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = orderController;
