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
    const condition = {
      isDeleted: false,
      ...(name && { name: { $regex: name, $options: "i" } }),
    };

    let query = Product.find(condition);
    let response = { status: "success" };
    // 동적 response 생성
    if (page) {
      // skip(num) => 스킵하고싶은 데이터 숫자(num)를 넘겨서 데이터 스킵
      // limit(5) => 최대 5개 데이터를 보내겠다
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.find(condition).countDocuments();
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

productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById({ _id: productId });
    if (!product) throw new Error("상품이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true }
    );
    if (!product) throw new Error("상품이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true }
    );
    if (!product) throw new Error("상품이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 아이템 재고 확인
productController.checkStock = async (item) => {
  const product = await Product.findById(item.productId);
  // 재고 부족
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 '${item.size}'사이즈 재고가 부족합니다.`,
    };
  }
  // 재고 충분
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  return { isVerify: true };
};

// 아이템리스트 전체 재고확인
productController.checkItemListSock = async (itemList) => {
  // 재고가 불충분한 아이템 저장
  const insufficientStockItems = [];
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

module.exports = productController;
