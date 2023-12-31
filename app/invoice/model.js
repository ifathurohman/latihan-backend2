const mongoose = require('mongoose');
const {model, Schema} = mongoose;

const invoiceSchema = Schema(
  {
    sub_total: {
      type: Number,
      required: [true, 'sub_total harus diisi'],
    },

    delivery_fee: {
      type: Number,
      required: [true, 'delivery fee harus diisi'],
    },

    delivery_address: {
      id_provinsi: {type: String},
      provinsi: {type: String},
      kabupaten: {type: String},
      id_kabupaten: {type: String},
      detail: {type: String},
    },

    total: {
      type: Number,
      required: [true, 'total harus diisi'],
    },

    payment_status: {
      type: String,
      enum: ['waiting_payment', 'paid'],
      default: 'waiting_payment',
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },

    order_items: [{type: Schema.Types.ObjectId, ref: 'OrderItem'}],
  },
  {timestamps: true},
);

module.exports = model('Invoice', invoiceSchema);