const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failure'],
    default: 'pending',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Add other relevant fields based on your payment gateway's response
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;