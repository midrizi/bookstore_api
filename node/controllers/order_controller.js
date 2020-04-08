const express = require('express');
const router = express.Router();
const orderService = require('../services/order_service');

// routes
router.get('/', getAllProductsFromOrders);

module.exports = router;

function getAllProductsFromOrders(req, res, next) {
    orderService.getProductsFromSingleOrder(req.user.sub, req.body, 'complete')
        .then(user => res.json(user))
        .catch(err => next(err));
}

