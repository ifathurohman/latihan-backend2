const {Schema, model} = require('mongoose');
const deliveryAddressSchema = Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama alamat harus diisi'],
      maxLength: [255, 'Panjang maksimal nama alamat adalah 255 karakter'],
    },

    kabupaten: {
      type: String,
      required: [true, 'Kabupaten harus diisi'],
      maxLength: [255, 'Panjang maksimal kabupaten adalah 255 karakter'],
    },

    id_kabupaten: {
      type: Number,
    },

    provinsi: {
      type: String,
      required: [true, 'Provinsi harus diisi'],
      maxlength: [255, 'Panjang maksimal provinsi adalah 255 karakter'],
    },

    id_provinsi: {
      type: Number,
    },

    detail: {
      type: String,
      required: [true, 'Alamat harus diisi'],
      maxlength: [1000, 'Panjang maksimal detail alamat adalah 1000 karakter'],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {timestamps: true},
);

module.exports = model('DeliveryAddress', deliveryAddressSchema);
