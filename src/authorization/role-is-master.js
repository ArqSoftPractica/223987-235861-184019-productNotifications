const express   = require('express');
const app       = express();
const rolePermissions = require("../constants");
const logger = require('../logger/systemLogger');

function verifyRoleIsMaster() {
    return async (req, res, next) => {
        let role = req.user.role
        
        if (role) {
            if (role == rolePermissions.roles.master) {
                return next();
            } else {
                let errorMessage = "Unauthorized. You do not have the correct permissions for this action.";
                logger.logError(errorMessage);
                return res.status(403).json({error: errorMessage});
            }
        } else {
            let errorMessage = "Unauthorized.";
            logger.logError(errorMessage);
            return res.status(403).json({error: errorMessage});
        }
    }
}
  
module.exports = verifyRoleIsMaster;
