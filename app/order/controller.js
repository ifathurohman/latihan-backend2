const CartItem = require('../cart-item/model');
const DeliveryAddress = require('../deliveryAddress/model');
const Order = require('../order/model');
const {Types} = require('mongoose');
const OrderItem = require('../order-item/model');
const config = require('../../app/config');
const midtransClient = require('midtrans-client');

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

const payment = async (req, res, next) => {
  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: config.serverKey,
      clientKey: config.clientKey,
    });

    const parameter = {
      transaction_details: {
        order_id: req.body.order_id,
        gross_amount: req.body.total,
      },
      customer_details: {
        first_name: req.body.name,
      },
    };

    snap.createTransaction(parameter).then(transaction => {
      const dataPayment = {
        response: JSON.stringify(transaction),
      };
      const token = transaction.token;

      res.status(200).json({message: 'Berhasil', dataPayment, token: token});
    });
  } catch (error) {
     res.status(500).json({message: message});
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
  payment,
  destroyAllDataOrder,
  destroyAllDataOrderItem,
};
