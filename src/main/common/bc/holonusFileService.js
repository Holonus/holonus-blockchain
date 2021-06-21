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

const config = require('config');
const boom = require('@hapi/boom');
const log4js = require('log4js');

const web3 = require('./bcUtil').connect(config.bc.url, config.bc.account);
const messages = require('../utils/messageUtil');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger();
const contractLogger = log4js.getLogger('contract');

const holonusFileServiceJson = require('../../../contracts/build/contracts/HolonusFileService.json');
let IholonusFileService = new web3.eth.Contract(holonusFileServiceJson.abi, holonusFileServiceJson.networks[config.bc.networkId].address);

const DEFAULT_UNLOCK_DURATION = 1000000;

const bcCommon = require('./bcCommon');

module.exports.setFile = async (data) => {
    try {
        var manageAddress = await bcCommon.getManageAccount(config, web3);
        await web3.eth.personal.unlockAccount(manageAddress, config.bc.password, DEFAULT_UNLOCK_DURATION);
        let gas = await IholonusFileService.methods.setFile(data.fileId, data.hash).estimateGas({ from: manageAddress });
        let txInfo = await IholonusFileService.methods.setFile(data.fileId, data.hash).send({ gas: gas, from: manageAddress });
        contractLogger.info('holonusFileService.setFile', 'params=', data.fileId, data.hash, 'txHash=', txInfo.hash);
        return txInfo;
    } catch (err) {
        logger.error(err);
        if (boom.isBoom(err)) {
            throw err;
        } else {
            throw boom.notAcceptable(messages.error.bc.file.setError);
        }
    }
};

module.exports.getFile = async (condition) => {
    try {
        let r = await IholonusFileService.methods.getFile(condition.fileId).call();
        contractLogger.info('iholonusFileService.getFile', 'params=', condition.fileId, 'result=', r);
        // NOTE: Even if there is no data, {'0':'', '1':''} will be returned, so check the contents.
        if (!r[0]) {
            throw boom.notFound(messages.error.bc.file.notfoundError);
        }
        return {
            fileId: r[0],
            hash: r[1],
        };
    } catch (err) {
        logger.error(err);
        if (boom.isBoom(err)) {
            throw err;
        } else {
            throw boom.notAcceptable(messages.error.bc.file.getError);
        }
    }
};

module.exports.setKey = async (data) => {
    try {
        var manageAddress = await bcCommon.getManageAccount(config, web3);
        await web3.eth.personal.unlockAccount(manageAddress, config.bc.password, 1000000);
        let gas = await IholonusFileService.methods.setKey(data.publicKeyId, data.publicKey).estimateGas({ from: manageAddress });
        let txInfo = await IholonusFileService.methods.setKey(data.publicKeyId, data.publicKey).send({ gas : gas, from: manageAddress });
        contractLogger.info('IholonusFileService.setKey', 'params=', data.publicKeyId, data.publicKey, 'tx=', txInfo);
        return txInfo;
    } catch (err) {
        logger.error(err);
        if (boom.isBoom(err)) {
            throw err;
        } else {
            throw boom.notAcceptable(messages.error.bc.key.setError);
        }
    }
};

module.exports.getKey = async (condition) => {
    try {
        let r = await IholonusFileService.methods.getKey(condition.publicKeyId).call();
        contractLogger.info('IholonusFileService.getFile', 'params=', condition.publicKeyId, 'result=', r);
        // NOTE: Even if there is no data, {'0':'', '1':''} will be returned, so check the contents.
        if (!r[0]) {
            throw boom.notFound(messages.error.bc.key.notfoundError);
        }
        return {
            publicKeyId: r[0],
            publicKey: r[1],
        };
    } catch (err) {
        logger.error(err);
        if (boom.isBoom(err)) {
            throw err;
        } else {
            throw boom.notAcceptable(messages.error.bc.key.getError);
        }
    }
};