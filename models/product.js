const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    price: {
      type: Number,
      required: true,
      min: 0,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },
    
    description: {
      type: String,
      trim: true,
    },
});

productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);
module.exports = Product;