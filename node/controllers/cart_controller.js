const express = require('express');
const router = express.Router();
const orderService = require('../services/order_service');

// routes
router.get('/', getShoppingCart);
router.post('/checkout', checkout);
router.post('/pay', pay);
router.post('/:productId', insertIntoShoppingCart);
router.put('/:productId', updateQuantity);
router.delete('/:productId', deleteItemFromCart);

module.exports = router;

function getShoppingCart(req, res, next) {
    orderService.getProductsFromSingleOrder(req.user.sub, req.body, 'pending')
        .then(products => res.json(products))
        .catch(err => next(err));
}

function insertIntoShoppingCart(req, res, next) {
    orderService.insertItemInShoppingCart(req.user.sub, req.params.productId, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updateQuantity(req, res, next) {
    orderService.updateQuantityInShoppingCart(req.user.sub, req.params.productId, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteItemFromCart(req, res, next) {
    orderService.deleteItemFromShoppingCart(req.user.sub, req.params.productId)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function checkout(req, res, next) {
    orderService.checkout(req.user.sub)
        .then((_) => res.json(_))
        .catch(err => next(err));
}

function pay(req, res, next) {
    orderService.pay(req.user.sub, req.body)
        .then(_ => res.json(_))
        .catch(err => next(err))
}

