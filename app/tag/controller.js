const Tags = require('./model');

const index = async (req, res, next) => {
  try {
    let {skip = 0, limit = 10} = req.query;
    let tag = await Tags.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    return res.json(tag);
  } catch (err) {
    next(err);
  }
};

const store = async (req, res, next) => {
  try {
    let payload = req.body;
    let tag = new Tags(payload);
    await tag.save();
    return res.json({
        status : true,
        message: 'tag successfully added',
        data: tag
    })
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

const update = async (req, res, next) => {
  try {
    let payload = req.body;
    let tag = await Tags.findByIdAndUpdate(req.params.id, payload, {new: true, runValidators:true});
     return res.json({
       status: true,
       message: 'tag successfully updated',
       data: tag,
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

const destroy = async (req, res, next) => {
  try {
    let tag = await Tags.findByIdAndDelete(req.params.id);
    return res.json(tag);
  } catch (err) {
    next(err);
  }
};

const destroyAllData = async (req, res, next) => {
  try {
    let tag = await Tags.deleteMany();
    return res.json(tag);
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
