const express = require('express');
const Router    = express.Router();
const HealthController = require('../controllers/health-controller')
const healthController = new HealthController();

Router.use(express.json());
Router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-api-key');
    res.setHeader('Content-Type', 'application/json');
    next(); 
});
Router.get('/health', (req, res, next) => healthController.getSystemHealth(req, res, next));

module.exports = Router
