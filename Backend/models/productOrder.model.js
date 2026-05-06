// models/order.model.js
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity:  { type: Number, required: true },
      price:     { type: Number, required: true },
      subtotal:  { type: Number, required: true },
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: String,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'accepted', 'on the way','delivered', 'cancelled'],
    default: 'pending'
  },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)