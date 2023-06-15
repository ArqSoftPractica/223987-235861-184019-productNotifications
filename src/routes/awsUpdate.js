const express = require('express');
const Router    = express.Router();
const verifyToken = require("../authorization/verify-token");
const verifyRoleIsMaster = require("../authorization/role-is-master");
const sqsService = require('../service/sqsService');

Router.use(express.json());

Router.post('/awsUpdate', verifyToken, verifyRoleIsMaster(), (req, res, next) => {
    if (!req.body) {
        return next(new RestError('Please send data keys in the body', 400));  
    }

    if (!req.body.accessKeyId) {
        return next(new RestError('accessKeyId Required', 400));  
    }

    if (!req.body.secretAccessKey) {
        return next(new RestError('secretAccessKey Required', 400));  
    }

    if (!req.body.sessionToken) {
        return next(new RestError('sessionToken Required', 400));  
    }

    sqsService.config.update(
        {
            apiVersion: '2012-11-05',
            accessKeyId: req.body.accessKeyId,
            secretAccessKey: req.body.secretAccessKey,
            region: 'us-east-1',
            sessionToken: req.body.sessionToken
        }
    )

    return res.status(204).json();
});

module.exports = Router
