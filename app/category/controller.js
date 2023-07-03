const Categories = require('./model');

const index = async (req, res, next) => {
  try {
    let {skip = 0, limit = 10} = req.query;
    let category = await Categories.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    return res.json(category);
  } catch (err) {
    next(err);
  }
};

const store = async (req, res, next) => {
  try {
    let payload = req.body;
    let category = new Categories(payload);
    await category.save();
    return res.json({
        status : true,
        message: 'Category successfully added',
        data: category
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
    let category = await Categories.findByIdAndUpdate(req.params.id, payload, {new: true, runValidators:true});
     return res.json({
       status: true,
       message: 'Category successfully updated',
       data: category,
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
    let category = await Categories.findByIdAndDelete(req.params.id);
    return res.json(category);
  } catch (err) {
    next(err);
  }
};

const destroyAllData = async (req, res, next) => {
  try {
    let category = await Categories.deleteMany();
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
