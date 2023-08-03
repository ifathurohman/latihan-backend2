const CartItem = require('../cart-item/model');
const DeliveryAddress = require('../deliveryAddress/model');
const Order = require('../order/model');
const {Types} = require('mongoose');
const OrderItem = require('../order-item/model');

const store = async (req, res, next) => {
  try {
    let {delivery_fee, delivery_address, shipping_service} = req.body;
    let cart = await CartItem.find();
    if (!cart || cart.length === 0) {
      return res.json({
        error: 1,
        message:
          "You're not able to create an order because you have no items in the cart",
      });
    }
    let service = shipping_service;
    let address = await DeliveryAddress.findById(delivery_address);
    let order = new Order({
      _id: new Types.ObjectId(),
      status: 'waiting_payment',
      delivery_fee: delivery_fee,
      delivery_address: {
        id_provinsi: address.id_provinsi,
        provinsi: address.provinsi,
        id_kabupaten: address.id_kabupaten,
        kabupaten: address.kabupaten,
        nama: address.nama,
        detail: address.detail,
      },
      shipping_service: {
        cost: service.costTag,
        description: service.descriptionTag,
        etd: service.etdTag,
        key: service.key,
        service: service.serviceTag,
      },
      user: req.user._id,
    });

    console.log(order);

    const orderItems = await OrderItem.insertMany(
      cart.map(item => ({
        ...item,
        name: item.name,
        qty: item.qty,
        price: item.price,
        order: order.id,
        product: item.product,
        image_url: item.image_url,
      })),
    );

    orderItems.forEach(item => order.order_items.push(item));
    order.save();
    await CartItem.deleteMany({user: req.user._id});
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
    let {skip = 0, limit = 10, order = []} = req.query;
    let count = await Order.find({user: req.user._id}).countDocuments();
    let orderDetail = await Order.findOne({_id: order})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('order_items')
      .sort('-createdAt');
    let orders = await Order.find({user: req.user._id})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('order_items')
      .sort('-createdAt');

    return res.json({
      data: orders.map(order => order.toObject({virtuals: true})),
      orderDetail,
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

const destroyAllDataOrder = async (req, res, next) => {
  try {
    let order = await Order.deleteMany();
    return res.json(order);
  } catch (err) {
    next(err);
  }
};

const destroyAllDataOrderItem = async (req, res, next) => {
  try {
    let orderItems = await OrderItem.deleteMany();
    return res.json(orderItems);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  store,
  index,
  destroyAllDataOrder,
  destroyAllDataOrderItem,
};
