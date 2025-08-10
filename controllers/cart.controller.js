const { populate } = require("dotenv");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { model } = require("mongoose");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저정보로 카트 찾기
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다 -> 만들어주기
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가있는 아이템인지 확인(productId, size)
    const existItem = cart.items.find(
      // mongoose.ObjectId의 경우 string이 아니기때문에 equals로 비교해야함
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      throw new Error("이미 장바구니에 담긴 상품입니다.");
    }
    // 카트에 아이템 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();

    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.getCartItems = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;

    const item = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );
    res.status(200).json({ status: "success", data: item });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.updateCartItemQty = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;
    const { qty } = req.body;
    const item = await Cart.findOneAndUpdate(
      {
        userId,
        "items._id": itemId,
      },
      { $set: { "items.$.qty": qty } },
      { new: true }
    );
    res.status(200).json({ status: "success", data: item });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = cartController;
