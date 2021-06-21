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
const log4js = require('log4js');
const boom = require('@hapi/boom');

const holonusFileService = require('../../../../common/bc/holonusFileService');
const dbUtil = require('../../../../common/db/dbUtil');
const keysModel = require('../../../../common/db/keys');
const usersModel = require('../../../../common/db/users');
const transactionLogsModel = require('../../../../common/db/transactionLogs');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger('service');

module.exports.postKey = async (data) => {
    if (config.stub) return postKeyStub();

    let exec = async (session) => {
        //
        let dbCondition = {
            userId: data.userId,
            forRecovery: { $ne: true }
        };
        logger.debug('[postKey]', 'DB', 'keysModel.checkConflict', 'dbCondition = ', dbCondition);
        await keysModel.checkConflict(dbCondition);

        let dbData = {
            userId: data.userId,
        };
        logger.debug('[postKey]', 'DB', 'keysModel.create', 'dbData = ', dbData);
        let dbKey = (await keysModel.create([dbData], { session }))[0];
        logger.debug('[postKey]', 'DB', 'keysModel.create', 'dbKey = ', dbKey);

        //
        let filter = { userId : data.userId };
        let updateData = { _keysId : dbKey.publicKeyId.toString() };
        let ret = await usersModel.updateOne(filter, updateData, { session : session });
        if (!ret || ret.ok != 1) {
            throw boom.internal('updating user information failed');
        }

        //
        let bcData = {
            publicKeyId: dbKey.publicKeyId.toString(),
            publicKey: data.publicKey.toString(),
        };
        logger.debug('[postKey]', 'BC', 'holonusFileService.setKey', 'bcData = ', bcData);
        let txInfo = await holonusFileService.setKey(bcData);
        if (txInfo) {
            await transactionLogsModel.create([txInfo]);
        }

        //
        return dbKey.publicKeyId;
    };

    return await dbUtil.transaction(exec);
};

function postKeyStub() {
    let publicKeyId = 'publicKeyId1';
    return publicKeyId;
}

module.exports.getKey = async (condition = {}) => {
    if (config.stub) return getKeyStub();

    try {
        //
        logger.debug('[getKey]', 'DB', 'keysModel.findOne', 'dbCondition = ', { userId: condition.userId });

        let dbCondition = {
            _id: condition.publicKeyId,
            userId: condition.userId,
            forRecovery: { $ne: true }
        };

        logger.debug('[getKey]', 'DB', 'keysModel.checkNotFound', 'dbCondition = ', dbCondition);

        await keysModel.checkNotFound(dbCondition);
        await keysModel.checkLocked(dbCondition._id);

        let dbKey = await keysModel.findOne(dbCondition);

        logger.debug('[getKey]', 'DB', 'keysModel.findOne', 'dbKey = ', dbKey);

        //
        let bcCondition = {
            publicKeyId: dbKey.publicKeyId.toString(),
        };

        logger.debug('[getKey]', 'BC', 'holonusFileService.getKey', 'bcCondition = ', bcCondition);

        let bcKey = await holonusFileService.getKey(bcCondition);

        let publicKeyId = dbKey.publicKeyId;
        let publicKey = bcKey.publicKey;

        return { publicKeyId, publicKey };

    } catch(e) {
        logger.error(e);
        let publicKeyId = null;
        let publicKey = null;
        return { publicKeyId, publicKey };
    }
};

function getKeyStub() {
    let publicKeyId = 'publicKeyId1';
    let publicKey = 'publicKey1';
    return { publicKeyId, publicKey };
}

module.exports.putKey = async (condition = {}, data) => {
    if (config.stub) return putKeyStub();

    //
    let dbCondition = {
        _id: condition.publicKeyId,
        userId: condition.userId,
        forRecovery: { $ne: true }
    };

    logger.debug('[putKey]', 'DB', 'keysModel.checkNotFound', 'dbCondition = ', dbCondition);

    await keysModel.checkNotFound(dbCondition);
    await keysModel.checkLocked(dbCondition._id);

    //
    let bcData = {
        publicKeyId: condition.publicKeyId.toString(),
        publicKey: data.publicKey.toString(),
    };

    logger.debug('[putKey]', 'BC', 'holonusFileService.setKey', 'bcData = ', bcData);

    await holonusFileService.setKey(bcData);

    return condition.publicKeyId;
};

function putKeyStub() { }

module.exports.deleteKey = async (condition = {}) => {
    if (config.stub) return deleteKeyStub();

    let exec = async (session) => {
        //
        let dbCondition = {
            _id: condition.publicKeyId,
            userId: condition.userId,
            forRecovery: { $ne: true }
        };

        logger.debug('[deleteKey]', 'DB', 'keysModel.checkNotFound', 'dbCondition = ', dbCondition);

        await keysModel.checkNotFound(dbCondition);
        await keysModel.checkLocked(dbCondition._id);

        logger.debug('[deleteKey]', 'DB', 'keysModel.deleteOne', 'dbCondition = ', dbCondition);

        await keysModel.deleteOne(dbCondition, { session });

        //
        let filter = { userId : condition.userId };
        let updateData = { _keysId : null };
        let ret = await usersModel.updateOne(filter, updateData, { session : session });
        if (!ret || ret.ok != 1) {
            throw boom.internal('updating user information failed');
        }
    };

    return await dbUtil.transaction(exec);
};

function deleteKeyStub() { }
