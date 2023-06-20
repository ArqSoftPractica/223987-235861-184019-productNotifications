const crypto = require('crypto');
const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const User = require("../src/db/models/users");
const productSubscriptionRepository = require("../src/repositories/user-repository");
const constants = require("../src/constants");
const db = require('../src/db/connection/connection');
const ProductSubscriptionRepository = require('../src/repositories/productSubscription-repository');

const stubValueUnHashedPassword = 'testPassword1*'
const stubHashedPassword = "c67100c65e3ab96647156d991a6790ed6fd7d47c2585d0f7441ecf5931a66931"

describe("productSubscriptionRepository", function() {
    let sequelizeStubUpsert;
    let sequelizeStubGetAll;
    let sequelizeStubFindOne;
    let sandbox;
    let subscriptionStubValue;
    let productSubscriptionRepository;
    
    beforeEach(function () {
        subscriptionStubValue = {
            id: crypto.randomUUID(),
            productBought: true,
            productSold: true,
            noStock: true
        };

        userStubValue = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            username: crypto.randomBytes(4).toString('hex'),
            userName: crypto.randomBytes(4).toString('hex'),
            email: `${crypto.randomBytes(4).toString('hex')}@${crypto.randomBytes(4).toString('hex')}.com`,
            password: stubHashedPassword,
            companyId: crypto.randomUUID(),
            companyName: crypto.randomUUID().toString(),
            role: constants.roles.admin,
            createdAt:new Date(),
            updatedAt:new Date(),
        };


        sandbox = sinon.createSandbox();
        sequelizeStubUpsert = sandbox.stub(db.productSubscription, 'upsert').resolves([{dataValues: subscriptionStubValue}]);
        sequelizeStubGetAll = sandbox.stub(db.productSubscription, 'findAll').resolves([subscriptionStubValue]);
        sequelizeStubFindOne = sandbox.stub(db.productSubscription, 'findOne').resolves(subscriptionStubValue);
        sequelizeStubFindAllUsers = sandbox.stub(db.user, 'findAll').resolves([userStubValue]);
        productSubscriptionRepository = new ProductSubscriptionRepository();
    });

    afterEach(function () {
        sandbox.restore();
        sinon.restore();
    });

    it("should add a new productSubscription to the db", async function() {
        const subscription = await productSubscriptionRepository.upsertProductSubscription(
            'prodId',
            'userId',
            true,
            true,
            true
        );
        expect(sequelizeStubUpsert.calledOnce).to.be.true;
        expect(subscription.id).to.equal(subscriptionStubValue.id);
        expect(subscription.productBought).to.equal(subscriptionStubValue.productBought);
        expect(subscription.productSold).to.equal(subscriptionStubValue.productSold);
        expect(subscription.noStock).to.equal(subscriptionStubValue.noStock);
    });

    it("Error if no dataValues returned when upserting", async function() {
        sequelizeStubUpsert.resolves([])
        try {
            const subscription = await productSubscriptionRepository.upsertProductSubscription(
                'prodId',
                'userId',
                true,
                true,
                true
            );
            //should be unreachable.
            expect(true).to.equal(false);
        } catch(err) {
            expect(err.message).to.equal('Could not upsert Product subscription in database');
        }
    });

    it("get product subscription", async function() {
        const subscription = await productSubscriptionRepository.getProductSubscription('prodId','userId');
        expect(sequelizeStubFindOne.calledOnce).to.be.true;
        expect(subscription.id).to.equal(subscriptionStubValue.id);
        expect(subscription.productBought).to.equal(subscriptionStubValue.productBought);
        expect(subscription.productSold).to.equal(subscriptionStubValue.productSold);
        expect(subscription.noStock).to.equal(subscriptionStubValue.noStock);
    });

    it("get product getAllUsersSubscribedTo where subscribers present", async function() {
        const subscribers = await productSubscriptionRepository.getAllUsersSubscribedTo('prodId','notifType');
        const user = subscribers[0];
        expect(sequelizeStubGetAll.calledOnce).to.be.true;
        expect(sequelizeStubFindAllUsers.calledOnce).to.be.true;
        expect(user.id).to.equal(userStubValue.id);
        expect(user.name).to.equal(userStubValue.name);
        expect(user.role).to.equal(userStubValue.role);
        expect(user.email).to.equal(userStubValue.email);
        expect(user.companyId).to.equal(userStubValue.companyId);
        expect(user.createdAt).to.equal(userStubValue.createdAt);
        expect(user.updatedAt).to.equal(userStubValue.updatedAt);
    });

    it("get product getAllUsersSubscribedTo where no subscribers", async function() {
        sequelizeStubGetAll.resolves([]);
        const subscriptions = await productSubscriptionRepository.getAllUsersSubscribedTo('prodId','notifType');
        expect(sequelizeStubGetAll.calledOnce).to.be.true;
        expect(subscriptions).to.be.empty;
    });
});