const mongoose = require('mongoose');
const {model, Schema} = mongoose;

const tagsSchema = Schema(
  {
    name: {
      type: String,
      minlenght: [3, 'Panjang nama tags minimal 3 karakter'],
      required: [true, 'Nama tags harus diisi'],
    },
  },
);

module.exports = model('Tags', tagsSchema);
