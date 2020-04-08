const express = require('express');
const router = express.Router();
const blacklist = require('express-jwt-blacklist');
const userService = require('../services/user_service');

const guard = require('express-jwt-permissions')();

// including authentication
const auth = require('../middleware/auth');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', guard.check('admin'), getAllUsers);
router.put('/', guard.check('admin'), updateUser);
router.get('/current', getCurrentUser);
router.get('/:id', guard.check('admin'), getUserById);
router.delete('/:id', deleteCurrentUser);

module.exports = router;

function authenticate(req, res, next) {
    auth(req.body)
        .then(user => user
            ? res.json(user)
            : res.status(400).json({ message: 'Email or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.createUser(req.body)
        .then(() => res.json({ message: 'User created successfully' }))
        .catch(err => next(err));
}

function getAllUsers(req, res, next) {
    userService.getAllUsers()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrentUser(req, res, next) {
    userService.getUserById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getUserById(req, res, next) {
    userService.getUserById(req.params.id)
        .then(user => res.json(user))
        .catch(err => next(err));
}

function updateUser(req, res, next) {
    userService.updateUser(req.user.sub, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteCurrentUser(req, res, next) {
    userService.deleteUser(req.user.sub)
        .then(() => res.json({}))
        .catch(err => next(err));
}

