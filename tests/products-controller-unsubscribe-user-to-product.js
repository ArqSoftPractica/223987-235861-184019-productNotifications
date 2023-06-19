const crypto = require('crypto');
const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const constants = require("../src/constants");
const db = require('../src/db/connection/connection');
const ProductsController = require('../src/controllers/products-controller');
const ProductSubscriptionRepository = require('../src/repositories/productSubscription-repository');
const RestError = require('../src/controllers/rest-error');
const ProductRepository = require('../src/repositories/product-repository');

const stubValueUnHashedPassword = 'testPassword1*'
const stubHashedPassword = "c67100c65e3ab96647156d991a6790ed6fd7d47c2585d0f7441ecf5931a66931"

describe('Product Subscription Controller tests', () => {
    let sandbox;
    let next;
    let res, productsController;
    let productSubscriptionRepository;
    let productRepository;
    let upsertProductSubscriptionStub;
    
    beforeEach(function () {
        subscriptionStub = {
            id: crypto.randomUUID(),
            productBought: false,
            productSold: false,
            noStock: false
        };

        req = { 
            body: {
                "productBought":false,
                "productSold":false,
                "noStock":false
            },
            params: {id: crypto.randomUUID()},
            user: {id: crypto.randomUUID()}
        };
        res = { 
            json: sinon.stub(),
            status: sinon.stub() 
        };
        next = sinon.stub();
        productSubscriptionRepository = new ProductSubscriptionRepository();
        productsController = new ProductsController();
        productRepository = new ProductRepository();
        productsController.productSubscriptionRepository = productSubscriptionRepository;
        productsController.productRepository = productRepository;
        sandbox = sinon.createSandbox();
        upsertProductSubscriptionStub = sandbox.stub(productSubscriptionRepository, 'upsertProductSubscription');
    });

    afterEach(function () {
        sandbox.restore();
        sinon.restore();
    });

    it('should return a 400 error if no id is provided in parameter of the request', async () => {
        upsertProductSubscriptionStub.rejects(new Error('Repository error'));
        await productsController.upsertProductSubscription({ ...req, params: {id: null} }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Repository error');
    });

    it('can have more than a simple error', async () => {
        upsertProductSubscriptionStub.rejects({
            errors: [{message: 'Repository Error'}, {message: 'Repository Error'}]}
        );
        await productsController.upsertProductSubscription({ ...req, params: {id: null} }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).equal('Repository Error');
    });
  
    it('should return an error if req.body is null', async () => {
        await productsController.upsertProductSubscription({ ...req, body: null }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
    });
  
    it('should return an error if req.user is null', async () => {
        await productsController.upsertProductSubscription({ ...req, user: null }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
    });
  
    it('should return an error if req.user.id is null', async () => {
        upsertProductSubscriptionStub.rejects(new Error('Repository error'));
        await productsController.upsertProductSubscription({ ...req, user: {id: null} }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Repository error');
    });

    it('should return an json with all subscriptions', async () => {
        upsertProductSubscriptionStub.resolves(subscriptionStub);
        await productsController.upsertProductSubscription(req, res, next);
        expect(res.json.calledOnce).to.be.true;
        expect(res.status.args[0][0]).to.equal(200);
        expect(res.json.args[0][0]).to.have.property('productBought');
        expect(res.json.args[0][0]).to.have.property('productSold');
        expect(res.json.args[0][0]).to.have.property('noStock');
    });  

    it('should return an json with all subscriptions', async () => {
        upsertProductSubscriptionStub.resolves(subscriptionStub);
        await productsController.upsertProductSubscription({ ...req, body: {} }, res, next);
        expect(res.json.calledOnce).to.be.true;
        expect(res.status.args[0][0]).to.equal(200);
        expect(res.json.args[0][0]).to.have.property('productBought');
        expect(res.json.args[0][0]).to.have.property('productSold');
        expect(res.json.args[0][0]).to.have.property('noStock');
    });  

    it('should return an error for duplicate key', async () => {
        upsertProductSubscriptionStub.rejects({ code: 11000, message: 'Database error', errors: [{ message: 'Duplicate key error' }] });
        await productsController.upsertProductSubscription({ ...req, user: {id: null} }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(409);
        expect(next.args[0][0].message).to.equal('Duplicate key error');
    });
});
