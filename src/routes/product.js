const express = require('express');
const Router    = express.Router()
const ProductController = require('../controllers/products-controller')
const verifyToken = require("../authorization/verify-token");
const verifyPermission = require("../authorization/role-check");
const productController = new ProductController();

Router.use(express.json());
Router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-api-key');
    res.setHeader('Content-Type', 'application/json');
    next(); 
});
Router.post('/products/subscribe/:id', verifyToken, verifyPermission(), (req, res, next) => productController.upsertProductSubscription(req, res, next));
Router.get('/products/subscribe/:id', verifyToken, verifyPermission(), (req, res, next) => productController.getProductSubscription(req, res, next));

module.exports = Router
