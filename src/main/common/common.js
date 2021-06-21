//    
//    This file is part of Holonus Software.
//    
//    Copyright(c) FRPA. All Rights Reserved.
//    
//    https://frpa.tech/
//    
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License Version 3
//    as published by the Free Software Foundation.
//    
//    This program is also distributed under the Holonus commercial license.
//    See the LICENSE.holonus for more details.
//    
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program in the COPYING file.
//    If not, see <http://www.gnu.org/licenses/>.
//    

'use strict';

const os = require('os');
const boom = require('@hapi/boom');
const { validationResult } = require('express-validator');
const log4js = require('log4js');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const config = require('config');

log4js.configure('config/log4js.config.json');

module.exports.connectToDB = connectToDB;

function connectToDB() {
    require('./db/dbUtil').connect(config.db.url, config.db.option);
}

module.exports.checkInputValue = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw boom.badRequest(`${errors.array()[0].param} is ${errors.array()[0].msg}`);
    }
};

module.exports.checkConnectedDb = (connection) => {
    if (connection.readyState != connection.states.connected) {
        connectToDB();
        throw boom.notAcceptable(`Not connected to database (${connection.states[connection.readyState]})`);
    }
};

module.exports.generateResponseData = (success, message, data) => {
    var ret = {
        success : success,
        date : new Date(),
    };

    if (message) {
        ret.message = message;
    }

    if (data) {
        ret.data = data;
    }

    return ret;
};

module.exports.makeNewAccessToken = function(data) {
    let token = jsonwebtoken.sign(data, config.web.secret, { expiresIn: '24h'});
    return token;
};

exports.getHash = function (text) {
    var sha512 = crypto.createHash('sha512');
    sha512.update(text);
    var hash = sha512.digest('hex').toUpperCase();
    return hash;
};

exports.getLocalHost = function() {
    return os.hostname()
};

exports.getLocalAddress = function() {
    var ifacesObj = {}
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    var interfaces = os.networkInterfaces();

    for (var dev in interfaces) {
        interfaces[dev].forEach(function(details){
            if (!details.internal){
                switch(details.family){
                    case "IPv4":
                        ifacesObj.ipv4.push({name:dev, address:details.address});
                    break;
                    case "IPv6":
                        ifacesObj.ipv6.push({name:dev, address:details.address})
                    break;
                }
            }
        });
    }
    return ifacesObj;
};

exports.getRemoteAddress = function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

module.exports.checkBlockchain = (config, logger) => {
    var web3 = require('./bc/bcUtil').connect2(config);
    logger.info(`Blockchain connect target=[${web3._provider.host}]`);
    if (!web3 || web3._provider.connected == false) {
        logger.warn('Blockchain not available!');
    } else {
        logger.info('Blockchain available.');
    }
};

module.exports.checkIPFS = async (config, logger) => {
    try {
        logger.info(`IPFS connect target=[${config.ipfs.url}]`);
        var ipfsObject = require('../common/utils/ipfsUtil').getIpfsObject();
        var ipfsVersion = await ipfsObject.version();
        logger.info(`IPFS available. Version=[${ipfsVersion.version}]`);
    } catch(e) {
        logger.error(e.message);
        logger.warn('IPFS not available.');
    }
};
