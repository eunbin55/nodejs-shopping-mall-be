const Product = require("../models/Product");

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    if (!image) throw new Error("이미지를 추가해주세요.");
    const findProduct = await Product.findOne({ sku });
    if (findProduct) throw new Error("이미 등록된 Sku입니다.");
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = productController;
