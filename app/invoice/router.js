const router = require('express').Router();
const invoiceController = require('./controller');

router.get('/invoices/:order_id', invoiceController.show);
router.delete('/invoices', invoiceController.destroyAllData);

module.exports = router;
