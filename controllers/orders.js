const Order = require('../models/order');
const responseUtils = require('../utils/responseUtils');
const http = require('http');

/**
 * Checks possible errors in the order
 * 
 * @param {*} order the order to be validated
 * @returns {Array<string>} Array of error messages of empty array if order is valid.
 */
const validateOrder = order => {
	const errors = [];
	if (order.items.length === 0) errors.push('Missing list of products');
	order.items.map(products => {
		if (!{}.hasOwnProperty.call(products, "quantity")) errors.push("Missing product quantity");
		if (!{}.hasOwnProperty.call(products, "product")) errors.push("Missing product");
		else {
			if (!{}.hasOwnProperty.call(products.product, "_id")) errors.push("Missing product id");
			if (!{}.hasOwnProperty.call(products.product, "name")) errors.push("Missing product name");
			if (!{}.hasOwnProperty.call(products.product, "price")) errors.push("Missing product price");
		}
	});
	return errors;
};

/**
 * Sends all orders as JSON
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} currentUser current user in the web page
 */
const getAllOrders = async (response, currentUser) => {
	let orders;
	if (currentUser.role !== 'admin') {
		orders = await Order.find({ customerId: currentUser._id });
	}
	else {
		orders = await Order.find({});
	}
	responseUtils.sendJson(response, orders, 200);
};

/**
 * Sends the order as JSON
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} currentUser current user in the web page
 * @param {string} orderId id of the order
 */
const viewOrder = async (response, currentUser, orderId) => {
	const getOrder = await Order.findById(orderId).exec();

	if (getOrder === null) {
		responseUtils.notFound(response);
	}
	else {
		if (currentUser._id.toString() !== getOrder.customerId && currentUser.role === 'customer') {
			responseUtils.notFound(response);
		}
		else {
			responseUtils.sendJson(response, getOrder);
		}
	}
};

/**
 * Adds a new order to the page
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} currentUser current user in the web page
 * @param {*} orderData data about the order
 */
const addOrder = async (response, currentUser, orderData) => {
	if (currentUser.role === 'admin') responseUtils.forbidden(response);
	else {
		const errorMsg = validateOrder(orderData);
		if (errorMsg.length < 1) {
			try {
				const items = orderData.items.map(product => {
					return {
						product: product.product,
						quantity: product.quantity
					};
				});
				const newOrder = new Order({
					customerId: currentUser._id,
					items: items
				});
				const savedOrder = await newOrder.save();
				responseUtils.createdResource(response, savedOrder);
			} catch (error) {
				console.error(error);
				responseUtils.badRequest(response, error);
			}
		}
		else responseUtils.badRequest(response, errorMsg);
	}
};

module.exports = {
	getAllOrders,
	viewOrder,
	addOrder,
};