const router = require('express').Router();

const deliveryController = require('./controller');
const {police_check} = require('../../middlewares');

router.get(
  '/delivery-address',
  police_check('view', 'DeliveryAddress'),
  deliveryController.index,
);
router.post(
  '/delivery-address',
  police_check('create', 'DeliveryAddress'),
  deliveryController.store,
);
router.put(
  '/delivery-address/:id',
  police_check('update', 'DeliveryAddress'),
  deliveryController.update,
);
router.delete(
  '/delivery-address/:id',
  police_check('delete', 'DeliveryAddress'),
  deliveryController.destroy,
);
router.delete(
  '/delivery-address',
  police_check('delete_all', 'DeliveryAddress'),
  deliveryController.destroyAllData,
);

module.exports = router;
