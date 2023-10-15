const Products = require("../models/productModel");
const Orders = require("../models/orderModel");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Create New Product (For Admin)
const createProduct = async (req, res) => {
  req.body.user = req.user.userId;

  let images = [];

  if (req.files.images.length > 1) {
    images = req.files.images;
  } else if (typeof req.files.images == "object") {
    images.push(req.files.images);
  }

  const imagesLink = [];
  for (let i = 0; i < images.length; i++) {
    const productImg = await cloudinary.uploader.upload(
      images[i].tempFilePath,
      {
        use_filename: true,
        folder: "Ecommerce",
      }
    );
    fs.unlinkSync(images[i].tempFilePath);
    imagesLink.push({
      public_id: productImg.public_id,
      url: productImg.secure_url,
    });
  }

  req.body.images = imagesLink;
  const product = await Products.create(req.body);
  res.status(201).json({ product });
};

// Get All Products (For HomePage)
const getAllProducts = async (req, res) => {
  const product = await Products.find();
  res.render("index", {
    product,
    title: "Homepage",
  });
};

// Get All Products (For Product Page)
const getAllProductsPage = async (req, res) => {
  const { name, category, numericFilter } = req.query;

  const queryObject = {};

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (category) {
    queryObject.category = category;
  }
  if (numericFilter) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=)\b/g;
    let filter = numericFilter.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filter = filter.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }
  // console.log(queryObject);
  const product = await Products.find(queryObject);
  res.render("product-page", { product });
};

// Get All Products (For Admin)
const getAllProductsAdmin = async (req, res) => {
  const product = await Products.find();
  res.render("admin-products", {
    name: req.user.name,
    id: req.user.userId,
    email: req.user.email,
    joined: req.user.joined,
    image: req.user.image,
    product,
  });
};

// Get Single Product (For HomePage)
const getSingleProduct = async (req, res) => {
  const product = await Products.findById({ _id: req.params.id });
  res.render("single-product", {
    product,
    images: product.images,
    title: "Product",
  });
};

// Create Product Review
const productReview = async (req, res) => {
  const { rating, comment, productId, orderId, orderItemId } = req.body;

  const reviews = {
    user: req.user.userId,
    name: req.user.name,
    rating: Number(rating),
    comment,
    orderId: orderItemId.valueOf(),
  };

  const product = await Products.findById({ _id: productId });

  product.reviews.push(reviews);
  product.numOfReviews = product.reviews.length;
  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  const updateOrder = await Orders.findOneAndUpdate(
    { _id: orderId },
    { $set: { "orderItems.$[elem].productReviewed": "Yes" } },
    { arrayFilters: [{ "elem.productId": `${productId}` }] }
  );
  res.status(200).json({ product });
};

// Delete Product Review (Admin)
const deleteProductReview = async (req, res) => {
  const { reviewId } = req.body;
  const { id } = req.params;
  const product = await Products.findById({ _id: id });

  let reviewIndex = product.reviews.findIndex((item) => {
    return item._id.valueOf() === reviewId;
  });

  product.reviews.splice(reviewIndex, 1);
  product.numOfReviews = product.reviews.length;
  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.rating = avg / product.reviews.length;
  if (product.reviews.length === 0) {
    product.rating = 0;
  }
  await product.save({ validateBeforeSave: false });
  res.status(200).json({ product });
};

// Get Individual Product Review (Admin)
const getSingleProductReview = async (req, res) => {
  const { id } = req.params;
  const product = await Products.findById({ _id: id });
  res.status(200).json({ product });
};

// Get Single Product For Edit(Admin)
const editProductAdmin = async (req, res) => {
  const { id } = req.params;
  const product = await Products.findById({ _id: id });
  res.status(200).render("admin-edit-product", {
    image: req.user.image,
    name: product.name,
    price: product.price,
    description: product.description,
    category: product.category,
    stock: product.stock,
    productImg: product.images,
    id: product._id,
  });
};

// Edit product (Admin)

const editProduct = async (req, res) => {
  const { id } = req.params;

  const { name, price, description, category, stock } = req.body;

  if (req.files == null) {
    const product = await Products.findByIdAndUpdate(
      { _id: id },
      {
        name: name,
        price: price,
        description: description,
        category: category,
        stock: stock,
      },
      { runValidators: true, new: true }
    );
    res.status(200).json({ product });
  }

  if (req.files !== null) {
    let images = [];

    if (req.files.images.length > 1) {
      images = req.files.images;
    } else if (typeof req.files.images === "object") {
      images.push(req.files.images);
    }

    let imagesLink = [];
    for (let i = 0; i < images.length; i++) {
      const productImg = await cloudinary.uploader.upload(
        images[i].tempFilePath,
        {
          use_filename: true,
          folder: "Ecommerce",
        }
      );
      fs.unlinkSync(images[i].tempFilePath);
      imagesLink.push({
        public_id: productImg.public_id,
        url: productImg.secure_url,
      });
    }

    const product = await Products.findByIdAndUpdate(
      { _id: id },
      {
        name: name,
        price: price,
        description: description,
        category: category,
        stock: stock,
        images: imagesLink,
      },
      { runValidators: true, new: true }
    );
    res.status(200).json({ product });
  }
};

// Delete Product (Admin)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Products.findByIdAndDelete({ _id: id });
  res.status(200).redirect("/admin/all-products");
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllProductsPage,
  getAllProductsAdmin,
  getSingleProduct,
  productReview,
  deleteProductReview,
  getSingleProductReview,
  deleteProduct,
  editProductAdmin,
  editProduct,
};
