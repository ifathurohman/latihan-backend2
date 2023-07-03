const deliveryAddress = require('./model');

const index = async (req, res, next) => {
  try {
    let {skip = 8, limit = 10} = req.query;
    let count = await deliveryAddress.find({
      user: req.user._id,
    }).countDocuments();
    let address = await deliveryAddress.find({user: req.user._id})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort('-createdAt');

    return res.json({data: address, count});
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

const store = async (req, res, next) => {
  try {
    let payload = req.body;
    let user = req.user;
    let address = new deliveryAddress({...payload, user: user.id});
    await address.save();
    return res.json(address);
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
      next(err);
    }
  }
};

const update = async (req, res, next) => {
  try {
    let {_id, ...payload} = req.body;
    let {id} = req.params;
    let address = await deliveryAddress.findById(id);
    let subject = address.user;

    let policy = policyFor(req.user);
    if (!policy.can('update', subject)) {
      return res.json({
        error: 1,
        message: "You're not allowed to modify this resource.",
      });
    }

    address = await deliveryAddress.findByIdAndUpdate(id, payload, {new: true});
    res.json(address);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    let {id} = req.params;
    let address = await deliveryAddress.findById(id);
    let subjectAddress = subject('deliveryAddress', {
      ...address,
      user_id: address.user,
    });
    let policy = policyFor(req.user);
    if (!policy.can('delete', subjectAddress)) {
      return res.json({
        error: 1,
        message: "You're not allowed to delete this resource",
      });
    }

    address = await deliveryAddress.findByIdAndDelete(id);
    res.json(address);
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

const destroyAllData = async (req, res, next) => {
  try {
    let category = await deliveryAddress.deleteMany();
    return res.json(category);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  index,
  store,
  update,
  destroy,
  destroyAllData,
};
