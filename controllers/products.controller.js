const Products = require('../models').products;

/**
 * Function for creating a product
 * @param {*} req
 * @param {*} res
 */
exports.createProduct = async (req, res) => {
  const { name, description, product_code } = req.body;
  try {
    let result = await Products.findOne({ where: { name, product_code } });

    if (result !== null) {
      res.status(200).json({
        error: 1,
        msg: 'Product exists!',
      });
    } else {
      const response = await Products.create({
        name,
        description,
        product_code,
      });
      res.status(200).json({
        error: 0,
        msg: 'Product created successfully!',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to get all products
 * @param {*} req
 * @param {*} res
 */
exports.getAllProducts = async (req, res) => {
  try {
    const results = await Products.findAll();
    res.json({
      error: 0,
      results,
    });
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to get a product by ID
 * @param {*} req
 * @param {*} res
 */
exports.getProductByID = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await Products.findOne({ where: { id } });
    result = result === null ? {} : result;
    res.json({
      error: 0,
      result,
    });
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to update a product by ID
 * @param {*} req
 * @param {*} res
 */
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Products.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Product does not exist!',
      });
    } else {
      const response = await Products.update(req.body, {
        where: { id },
      });
      res.status(200).json({
        error: 0,
        msg: 'Product updated successfully!',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to delete a product by ID
 * @param {*} req
 * @param {*} res
 */
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Products.findOne({ where: { id } });
    if (result === null) {
      res.status(400).json({
        error: 1,
        msg: 'Product does not exist!',
      });
    } else {
      const response = await Products.destroy({ where: { id } });
      res.status(200).json({
        error: 1,
        msg: 'Product deleted successfully!',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};
