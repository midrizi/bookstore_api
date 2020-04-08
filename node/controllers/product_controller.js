const express = require('express');
const router = express.Router();
const blacklist = require('express-jwt-blacklist');
const productService = require('../services/product_service');

const guard = require('express-jwt-permissions')();

// routes
router.get('/', getAllProducts);
router.post('/', guard.check('admin'), createProduct);
router.get('/:id', getProductById);
router.put('/:id', guard.check('admin'), updateProduct);
router.delete('/:id', guard.check('admin'), deleteProduct);
router.get('/category/:category', getAllByCategory);
router.get('/search/:query', getAllByQuery);

module.exports = router;

function getAllProducts(req, res, next) {
    productService.getAllProducts(req.body)
        .then(products => res.json(products))
        .catch(err => next(err));
}

function getAllByQuery(req, res, next) {
    productService.findByQuery(req.params.query, req.body)
        .then(products => res.json(products))
        .catch(err => next(err));
}

function getAllByCategory(req, res, next) {
    productService.findByCategory(req.params.category, req.body)
        .then(products => res.json(products))
        .catch(err => next(err));
}

function createProduct(req, res, next) {
    productService.createProduct(req.body)
        .then(() => res.json({}))
        .catch(err => next(err))
}

function getProductById(req, res, next) {
    productService.getProductById(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(err => next(err));
}

function updateProduct(req, res, next) {
    productService.updateProduct(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteProduct(req, res, next) {
    productService.deleteProduct(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

