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

const filesModel = require('../../../../common/db/files');
const usersModel = require('../../../../common/db/users');
const ipfsUtil = require('../../../../common/utils/ipfsUtil');
const holonusFileService = require('../../../../common/bc/holonusFileService');
const dbUtil = require('../../../../common/db/dbUtil');
const transactionLogsModel = require('../../../../common/db/transactionLogs');
const cryptoUtil = require('../../../../common/utils/cryptoUtil');

const keysCore = require('./keys');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger('service');

async function getTargetUser(userId) {
    await usersModel.checkNotFound({ userId: userId });
    return await usersModel.findOne({ userId: userId });
}

module.exports.postFile = async (data) => {
    if (config.stub) return postFileStub();

    let exec = async (session) => {
        let user = await getTargetUser(data.userId);
        await usersModel.checkLocked(user.userId);

        let publicKey = await keysCore.getKey({
            userId: data.userId,
            publicKeyId: data.publicKeyId
        });

        if (publicKey.publicKey == null) {
            throw new Error('public key not registered');
        }

        //
        let derPublicKey = cryptoUtil.pem2der('pkcs1-public', publicKey.publicKey);
        let ipfsData = cryptoUtil.encrypt(derPublicKey, data.attachement);

        logger.debug('[postFile]', 'IPFS', 'ipfsService.add');

        let ipfsPath = await ipfsUtil.add(ipfsData);

        logger.debug('[postFile]', 'IPFS', 'ipfsService.add', 'hash = ', ipfsPath);

        //
        let dbData = {
            userId: user.userId,
            fileName: data.fileName,
            mimeType: data.mimeType,
            hash: ipfsPath,
            isLocked: false
        };

        logger.debug('[postFile]', 'DB', 'filesModel.create', 'dbData = ', dbData);

        let dbFile = (await filesModel.create([dbData], { session }))[0];

        logger.debug('[postFile]', 'DB', 'filesModel.create', 'dbFile = ', dbFile);

        //
        let bcData = {
            fileId: dbFile.fileId.toString(),
            hash: ipfsPath.toString(),
        };

        logger.debug('[postFile]', 'BC', 'holonusFileService.setFile', 'bcData = ', bcData);

        let txInfo = await holonusFileService.setFile(bcData);
        await transactionLogsModel.create([txInfo]);

        logger.debug('[postFile]', 'BC', 'holonusFileService.setFile', 'bcData = ', bcData);

        return { fileId: dbFile.fileId };
    };
    return await dbUtil.transaction(exec);
};

function postFileStub() {
    let fileId = 'fileId1';
    return { fileId };
}

module.exports.getFile = async (condition = {}) => {
    if (config.stub) return getFileStub();

    let user = await getTargetUser(condition.userId);

    await usersModel.checkLocked(user.userId);

    //
    let dbCondition = {
        _id: condition.fileId,
        userId: user.userId
    };

    logger.debug('[getFile]', 'DB', 'filesModel.checkNotFound', 'dbCondition = ', dbCondition);

    await filesModel.checkNotFound(dbCondition);
    await filesModel.checkLocked(dbCondition._id);

    let fileinfo = await filesModel.findOne(dbCondition);

    logger.debug('[getFile]', 'DB', 'filesModel.findOne', 'fileinfo = ', fileinfo);

    //
    let bcCondition = {
        fileId: condition.fileId.toString(),
    };

    logger.debug('[getFile]', 'BC', 'holonusFileService.getFile', 'bcCondition = ', bcCondition);

    let bcData = await holonusFileService.getFile(bcCondition);

    logger.debug('[getFile]', 'BC', 'holonusFileService.getFile', 'bcData = ', bcData);

    //
    logger.debug('[getFile]', 'IPFS', 'ipfsService.get', 'hash = ', bcData.hash);

    let ipfsData = await ipfsUtil.cat(bcData.hash);

    let file = {
        fileName: fileinfo.fileName,
        mimeType: fileinfo.mimeType,
        attachement: ipfsData,
    };

    return file;
};

function getFileStub() {
    let file = {
        fileName: 'fileName1',
        fileId: 'fileId1',
        attachement: 'attachement1',
        mimeType: 'image/jpeg'
    };

    return file;
}

module.exports.putFile = async (condition, data) => {
    if (config.stub) return putFileStub();

    let exec = async (session) => {
        //
        let user = await getTargetUser(condition.userId);
        
        //
        let publicKey = keysCore.getKey({
            userId: condition.userId,
            publicKeyId: condition.publicKeyId
        });

        let dbCondition = {
            _id: condition.fileId,
            userId: user.userId
        };

        logger.debug('[putFile]', 'DB', 'filesModel.checkNotFound', 'dbCondition = ', dbCondition);

        await filesModel.checkNotFound(dbCondition);
        await filesModel.checkLocked(dbCondition._id);

        //
        let derPublicKey = cryptoUtil.pem2der('pkcs1-public', publicKey);
        let ipfsData = cryptoUtil.encrypt(derPublicKey, data.attachement);

        logger.debug('[putFile]', 'IPFS', 'ipfsService.add');

        let ipfsPath = await ipfsUtil.add(ipfsData);

        logger.debug('[putFile]', 'IPFS', 'ipfsService.add', 'hash = ', ipfsPath);

        //
        let dbData = {
            fileName: data.fileName,
            mimeType: data.mimeType,
            updateDate: Date.now()
        };

        logger.debug('[putFile]', 'DB', 'filesModel.updateOne', 'dbCondition = ', dbCondition, 'dbData = ', dbData);

        var ret = await filesModel.updateOne(dbCondition, dbData, { session });
        if (!ret || ret.ok != 1) {
            throw boom.notFound('update failed');
        }

        //
        let bcData = {
            fileId: condition.fileId.toString(),
            hash: ipfsPath.toString(),
        };

        logger.debug('[putFile]', 'BC', 'holonusFileService.setFile', 'bcData = ', bcData);

        let txInfo = await holonusFileService.setFile(bcData);
        await transactionLogsModel.create([txInfo]);
    };
    return await dbUtil.transaction(exec);
};

function putFileStub() { }

module.exports.deleteFile = async (condition) => {
    if (config.stub) return deleteFileStub();

    let exec = async (session) => {
        let user = await getTargetUser(condition.userId);
        let filesData = await filesModel.findOne({ _id: condition.fileId });

        // *** Uploaded files to IPFS can't be deleted,
        // *** so deletion from IPFS is not performed.

        //
        let dbCondition = {
            _id: condition.fileId,
            userId: user.userId
        };

        logger.debug('[deleteFile]', 'DB', 'filesModel.checkNotFound', 'dbCondition = ', dbCondition);

        await filesModel.checkNotFound(dbCondition);
        await filesModel.checkLocked(dbCondition._id);

        logger.debug('[deleteFile]', 'DB', 'filesModel.updateOne', 'dbCondition = ', dbCondition);

        var ret = await filesModel.deleteOne(dbCondition, { session });
        if (!ret || ret.ok != 1) {
            throw boom.notFound('delete failed');
        }

        return ret;
    };

    return await dbUtil.transaction(exec);
};

function deleteFileStub() { }
