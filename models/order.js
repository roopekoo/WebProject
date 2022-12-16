const mongoose = require('mongoose');
const Product = require('./product');
const Schema = mongoose.Schema;

const orderedItem = () => new Schema({
    product: {
        set: async () => {
            return await Product.findById(_id).exec();
        },
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
});

const orderSchema = new Schema({
    customerId: {
      type: String,
      required: true,
      trim: true,
    },
     
    items: {
      type: Array,
      required: true,
      minLength: 1,
      items: Array[orderedItem],
    },
});

orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;