const Product = require("../models/Product");

const productController = {};
const PAGE_SIZE = 3;
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
    const { page, name } = req.query;
    const condition = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(condition);
    let response = { status: "success" };
    // 동적 response 생성
    if (page) {
      // skip(num) => 스킵하고싶은 데이터 숫자(num)를 넘겨서 데이터 스킵
      // limit(5) => 최대 5개 데이터를 보내겠다
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.find(
        condition
      ).estimatedDocumentCount();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }
    // query.exec() => 쿼리 실행
    const productList = await query.exec();
    response.data = productList;

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = productController;
