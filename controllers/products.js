const Product = require('../models/product');
const responseUtils = require ('../utils/responseUtils');
const http = require('http');

/**
 * Checks if product has no name or price
 * 
 * @param {object} product product to be validated
 * @returns {Array<string>} Array of error messages or empty array if user is valid
 */
const validateProduct = product => {
  const errors = [];

  if (!product.name || product.name === '') errors.push('Missing name');
  if (!product.price || product.price <= 0) errors.push('Missing price');

  return errors;
};

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response http response
 */
const getAllProducts = async response => {
  const products = await Product.find({});
  responseUtils.sendJson(response, products, 200);
};

/**
 * Update product and send updated product as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} productId id of the product to be updated
 * @param {object} productData (mongoose document object)
 */
 const updateProduct = async(response, productId, productData) => {
  const getProduct = await Product.findById(productId).exec();

  if (!getProduct || getProduct === null) responseUtils.notFound(response);

  else {
    const errors = validateProduct(productData);
    if (errors.length < 1) {
      try {
        await Product.findOneAndUpdate(productId, { $set: productData }, {new: true}, function(err, prod) {
          if (err) responseUtils.badRequest(response, err);
          responseUtils.sendJson(response, prod);
        });
        
      } catch (error) {
        responseUtils.badRequest(response, error);
      }
    }
    else {
      responseUtils.badRequest(response, errors);
    }
  }
};

/**
 * Send product data as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} productId id of the product to be viewed
 */
const viewProduct = async(response, productId) => {
  const getProduct = await Product.findById(productId).exec();

  if (getProduct === null) {
    responseUtils.notFound(response);
  }
  else { 
    responseUtils.sendJson(response, getProduct);
  }
};

/**
 * Adds a new product as JSON
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} productData the data of the product
 */
const addProduct = async(response, productData) => {
  const errorMsg = validateProduct(productData);
  const getProduct = await Product.findOne({ name: productData.name }).exec();

  if (getProduct === null && errorMsg.length < 1) {
    try {
      const newProduct = new Product({
        name: productData.name,
        description: productData.description,
        image: productData.image,
        price: productData.price,
      });
    
      const savedProduct = await newProduct.save();
      responseUtils.createdResource(response, savedProduct);
    } catch (error) {
      responseUtils.badRequest(response, error);
    }
  }

  else if (errorMsg.length > 0) responseUtils.badRequest(response, errorMsg);
      
  else responseUtils.badRequest(response, 'Product is already in database');
};

/**
 * Deletes the given product
 * 
 * @param {http.ServerResponse} response http response
 * @param {string} productId id of the product to be deleted
 * @returns {*} JSON response
 */
const deleteProduct = async(response, productId) => {
  const getProduct = await Product.findById(productId).exec();

  if (getProduct === null) {
    responseUtils.notFound(response);
  }
  else {
    await Product.deleteOne({ _id: productId });
    return responseUtils.sendJson(response, getProduct);
  }
};

module.exports = { 
  getAllProducts,
  updateProduct,
  viewProduct,
  addProduct,
  deleteProduct,
 };