const Product = require('../product/model');
const CartItem = require('../cart-item/model');

const update = async (req, res, next) => {
  try {
    const items = req.body.cart.map(item => ({
      product: item._id,
      name: item.name,
      qty: item.qty,
      price: item.price,
      image_url: item.image_url,
    }));

    console.log(items);

    const productIds = items.map(item => item?.product);
    const products = await Product.find({
      _id: {$in: productIds.map(product => product)},
    });

    let cartItems = items.map(item => {
      let relatedProduct = products.find(
        product => product._id.toString() === item?.product,
      );
      return {
        product: relatedProduct?._id,
        price: relatedProduct?.price,
        image_url: relatedProduct?.image_url,
        name: relatedProduct?.name,
        qty: item?.qty,
        user: req.user._id,
      };
    });

    await CartItem.deleteMany({user: req.user._id});

    await CartItem.bulkWrite(
      cartItems.map(item => {
        return {
          updateOne: {
            filter: {
              user: req.user._id,
              product: item.product,
            },
            update: item,
            upsert: true,
          },
        };
      }),
    );

    return res.json(cartItems);
  } catch (err) {
    if (err && err.name == 'ValidationError') {
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
    let items = await CartItem.find({user: req.user._id}).populate('product');

    return res;
  } catch (err) {
    if (err && err.name == 'ValidationError') {
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
  update,
  index,
};
