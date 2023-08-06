const {subject} = require('@casl/ability');
const Invoice = require('../invoice/model');
const OrderItem = require('../order-item/model');
const {policyFor} = require('../../utils');

// const show = async (req, res, next) => {
//   try {
//     let policy = policyFor(req.user);
//     let subjectInvoice = subject('Invoice', {
//       ...invoice,
//       user_id: invoice.user._id,
//     });

//     if (!policy.can('read', subjectInvoice)) {
//       return res.json({
//         error: 1,
//         message: 'Anda tidak memiliki akses untuk melihat invoice ini.',
//       });
//     }

//     let {order_id} = req.params;

//     let invoice = await Invoice.findOne({order: order_id})
//       .populate('order')
//       .populate('user');

//       console.log(req.params);

//     return res.json(invoice);
//   } catch (err) {
//     return res.json({
//       error: 1,
//       message: 'Error when getting invoice.',
//     });
//   }
// };

const show = async (req, res, next) => {
  try {
    let {order_id} = req.params;
    console.log(order_id);
    let invoice = await Invoice.findOne({order: order_id})
      .populate('order')
      .populate('user');

    let policy = policyFor(req.user);
    let subjectInvoice = subject('Invoice', {
      ...invoice,
      user_id: invoice.user._id,
    });
    if (!policy.can('read', subjectInvoice)) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk melihat invoice ini.`,
      });
    }
    return res.json(invoice);
  } catch (err) {
    return res.json({
      error: 1,
      message: err.message,
    });
  }
};

const destroyAllData = async (req, res, next) => {
  try {
    let invoice = await Invoice.deleteMany();
    return res.json(invoice);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  show,
  destroyAllData,
};
