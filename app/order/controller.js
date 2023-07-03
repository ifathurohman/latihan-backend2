const CartItem = require('../cart-item/model');
const DeliveryAddress = require('../deliveryAddress/model');
const Order = require('../order/model');
const {Types} = require('mongoose');
const OrderItem = require('../order-item/model');

const store = async (req, res, next) => {
  try {
    let {deliveryFee, deliveryAddress} = req.body;
    let items = await CartItem.find();
    if (!items || items.length === 0) {
      return res.json({
        error: 1,
        message:
          "You're not able to create an order because you have no items in the cart",
      });
    }

    let address = await DeliveryAddress.findById(deliveryAddress);
    let order = new Order({
      _id: new Types.ObjectId(),
      status: 'waiting_payment',
      deliveryFee: deliveryFee,
      deliveryAddress: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });
    let orderItems = await Orderitem.insertMany(
      items.map(item => ({
        ...item,
        name: item.product.name,
        qty: parseInt(item.qty),
        price: parseInt(item.product.price),
        order: order.id,
        product: item.product._id,
      })),
    );

    orderItems.forEach(item => order.d.push(item));
    order.save();
    await CartItem.deleteMany({user: reg.user._id});
    return res.json(order);
  } catch (err) {
    if (err && err.name === 'validationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const index = async (req, res, next) => {
  try {
    let {skip = 0, limit = 10} = req.query;
    let count = await Order.find({user: req.user._id}).countDocuments();
    let orders = await Order.find({user: req.user._id})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('order_items')
      .sort('-createdAt');

    return res.json({
      data: orders.map(order => order.toObject({virtuals: true})),
      count,
    });
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
};

module.exports = {
  store,
  index,
};
