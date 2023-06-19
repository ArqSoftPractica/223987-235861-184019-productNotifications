const crypto = require('crypto');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const constants = require('../src/constants')
require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const server = require('../index')

describe('Product subscription Routes Test', function() {
    let sandbox;
    let req, res, next;
    let companyValue;
    let userStub;
    let employeeToken = 'eyJhbGciOiJSUzI1NiJ9.eyJpZCI6IjE0NzY1ODQyLWM4MzYtNDE2Yi04M2E0LTZmNjJiMjNiNjk5NyIsInVzZXJOYW1lIjoiVGVzdFVzZXIiLCJlbWFpbCI6IlRlc3RVc2VyQFRlc3RVc2VyLmNvbSIsImNvbXBhbnlJZCI6Ijc4ZDYzZTI1LWU5OTctNDg4Yy1hMDM1LTM1MGRmYzJjNjgwNCIsInJvbGUiOiJFTVBMT1lFRSIsImNyZWF0ZWRBdCI6IjIwMjMtMDYtMTlUMTc6NDY6MDUuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjMtMDYtMTlUMTc6NDY6MDUuMDAwWiJ9.WgRfODRUBRs2pn5dC1oPNDy6ZGtor8dT98jOvh2VjIMwPD8jaBkII9rvZqcSGX-XjsdCtq7QCv-QX_PJYYWdbRZ2qtknugqMEBXufglAIfXtscRds5O3ApFIIFjwCtooD_kTd_pJu2svQa0JWNw_dkb9ewdM_zgjrbR-893GBoCziyIGfSuVQ96he09GDDWVyjcz1yumtmhD7btqqkGOzt6-rl6FBzQIA90tUhSxv0vpF51hwdOz-Tsg_fzpSY2kf9cuRpKKCADF37lYp-zk54ev4Wf7ZoybEweg_cdG9lIsNSR51WfWz5U2pBw2nvyuRTvPGQTSRFlmWsyDh6ytYQ'
    let adminToken = 'eyJhbGciOiJSUzI1NiJ9.eyJpZCI6IjZhY2Q2MzI3LTUzMzAtNGU2Ni05OWE3LWEwYTNlYjA2ZWNkOCIsInVzZXJOYW1lIjoiVGVzdGluZ0lUTyIsImVtYWlsIjoiVGVzdGluZ0lUT0BUZXN0aW5nSVRPLmNvbSIsImNvbXBhbnlJZCI6ImFlNWVhOGZiLTlhOTItNGNiZi05YmU2LTY3YTdjZDliOTg5YyIsInJvbGUiOiJBRE1JTiIsImNyZWF0ZWRBdCI6IjIwMjMtMDYtMThUMjE6MTE6NTkuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjMtMDYtMThUMjE6MTE6NTkuMDAwWiJ9.c_dmP6gwHY8_UNIStH1rZpTh4Mfdn1_HLa3tj9YKdFHMhk_noTI6FzuVx_qgMThSOClm9fpOw8aIqxVLF9CD4YH6pVibYAFj5GR0bobIM_rQ7pHe6oKuYOCW8FKGVVpWx2FtbJMuPlOVcS7ERfTwZttPSEbgv0gwiLrKhHcY0dFQu5RdoVCX8EqSim_zLU8SFp_53J7Un_IfRXva0tWToANFe6__yjnpyKL2aICsFEsfvPdSzgg7po-Mr3ceVQkE9lxyxIEzf1lFhGhlOUsYhspNRb8wcgZYhv7MqIPlGOoILzXmL_SKgYKGC6K9w3v36n_aKqQx2zihb47Jj04SOQ'
    
    before(() => {
        req = { body: userStub };
        res = { json: sinon.stub() };
        next = sinon.stub();
        sandbox = sinon.createSandbox();
    })

    after(() => {
        // app.get.restore()
        // app.post.restore()
    })

    beforeEach(function () {
        companyValue = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            apiKey: crypto.randomUUID(),
        };
        
        userStub = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            username: crypto.randomBytes(4).toString('hex'),
            userName: crypto.randomBytes(4).toString('hex'),
            email: `${crypto.randomBytes(4).toString('hex')}@${crypto.randomBytes(4).toString('hex')}.com`,
            password: crypto.randomUUID(),
            companyId: companyValue.id,
            companyName: companyValue.name,
            role: constants.roles.admin,
            createdAt:new Date(),
            updatedAt:new Date(),
        };

        subscriptionStub = {
            id: crypto.randomUUID(),
            productBought: false,
            productSold: false,
            noStock: false
        };
    });

    afterEach(function () {
        sinon.restore()
        sandbox.restore();
    });

    describe('No token POST /products/subscribe/:id', function() {
        it('should call the subscribe method and return a 401 unauthorized, because no Auth token was sent', function() {
            return new Promise(function(resolve) {
                chai.request(server)
                .post('/products/subscribe/:id')
                .send(subscriptionStub)
                .end((err, res) => {
                    expect(res.status).equals(401);
                    //Chequear que el usuario sea el correcto generado por el stub
                    resolve();
                });
            });
        });
    });

    describe('Token without space from bearer to token POST /products/subscribe/:id', function() {
        it('should call the subscribe method and return a 401 unauthorized', function() {
            return new Promise(function(resolve) {
                chai.request(server)
                .post('/products/subscribe/:id')
                .set({ Authorization: `Bearerdsdsa` })
                .send(subscriptionStub)
                .end((err, res) => {
                    expect(res.status).equals(401);
                    //Chequear que el usuario sea el correcto generado por el stub
                    resolve();
                });
            });
        });
    });

    describe('Token with space but non usable one POST /products/subscribe/:id', function() {
        it('should call the subscribe method and return a 401 unauthorized', function() {
            return new Promise(function(resolve) {
                chai.request(server)
                .post('/products/subscribe/:id')
                .set({ Authorization: `Bearer dsdsa` })
                .send(subscriptionStub)
                .end((err, res) => {
                    expect(res.status).equals(401);
                    //Chequear que el usuario sea el correcto generado por el stub
                    resolve();
                });
            });
        });
    });

    describe('Token is correct, but user no priviledges (role is wrong) to subscribe POST /products/subscribe/:id', function() {
        it('should call the subscribe method and return a 403 unauthorized', function() {
            return new Promise(function(resolve) {
                chai.request(server)
                .post('/products/subscribe/:id')
                .set({ Authorization: `Bearer ${employeeToken}` })
                .send(subscriptionStub)
                .end((err, res) => {
                    expect(res.status).equals(403);
                    //Chequear que el usuario sea el correcto generado por el stub
                    resolve();
                });
            });
        });
    });

    describe('Token is correct and has correct role, but there is no product with that id POST /products/subscribe/:id', function() {
        it('should call the subscribe method and return a 401 unauthorized, because no Auth with no bearer was sent', function() {
            return new Promise(function(resolve) {
                chai.request(server)
                .post('/products/subscribe/:id')
                .set({ Authorization: `Bearer ${adminToken}` })
                .send(subscriptionStub)
                .end((err, res) => {
                    expect(res.status).equals(400);
                    resolve();
                });
            });
        });
    });
});
