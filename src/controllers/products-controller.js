const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const ProductRepository = require('../repositories/product-repository');
const ProductSubscriptionRepository = require('../repositories/productSubscription-repository');

module.exports = class productController {
    constructor() {
        this.productRepository = new ProductRepository();
        this.productSubscriptionRepository = new ProductSubscriptionRepository();
    }

    async createProduct(req, res, next) {
        try {
            req.body.companyId = req.user.companyId;
            let productCreated = await this.productRepository.createProduct(req.body);
        
            res.json(productCreated);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getProduct(req, res, next) {
        const id = req.params.id;
        if (!id) {
            return next(new RestError('id required', 400));    
        }

        try {
            let product = await this.productRepository.getProduct(id, req.user?.companyId);
            if (product) {
                res.json(product);
            } else {
                next(new RestError(`product not found`, 404));    
            }
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getProducts(req, res, next) {
        try {
            let queryParams = {};
            if (req.query.isActive) {
                queryParams['isActive'] = req.query.isActive == 'true'
            }

            let products = await this.productRepository.getProducts(queryParams, req?.user?.companyId);
            
            res.json(products);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async editProduct(req, res, next) {
        try {
            const id = req.params.id;
            req.body.companyId = req.user.companyId;
            let product = await this.productRepository.editProduct(id, req.body);
            
            res.json(product);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async deactivateProduct(req, res, next) {
        try {
            const id = req.params.id;
            const body = {isActive: false, companyId: req.user?.companyId}
            let product = await this.productRepository.editProduct(id, body);
            
            res.json(product);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async upsertProductSubscription(req, res, next) {
        try {
            const productId = req.params.id;
            const userId = req.user.id;
            const prodSubscription = await this.productSubscriptionRepository.upsertProductSubscription(
                productId, 
                userId, 
                req.body.productBought ?? false,
                req.body.productSold ?? false,
                req.body.noStock ?? false,
            );
            
            res.status(200);
            res.json(prodSubscription);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getProductSubscription(req, res, next) {
        try {
            const productId = req.params.id;
            const userId = req.user.id;
            const productSubscription = await this.productSubscriptionRepository.getProductSubscription(productId, userId);
            res.status(productSubscription);
            return res.json();
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async unSubscribeUserToProduct(req, res, next) {
        try {
            const productId = req.params.id;
            const userId = req.user.id;
            await this.productSubscriptionRepository.deleteProductSubscription(productId, userId);
            
            res.status(204);
            res.json();
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async handleRepoError(err, next) {
        //error de base de datos.
        let http_code = (err.code == 11000)?409:400;
        let errorDesription = err.message
        if (err.errors && err.errors.length > 0 && err.errors[0].message) {
            errorDesription = err.errors[0].message
        }
        return next(new RestError(errorDesription, http_code));
    }
}
