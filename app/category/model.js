const mongoose = require('mongoose');
const {model, Schema} = mongoose;

const categorySchema = Schema(
  {
    name: {
      type: String,
      minlenght: [3, 'Panjang nama category minimal 3 karakter'],
      required: [true, 'Nama category harus diisi'],
    },
  },
);

module.exports = model('Category', categorySchema);
