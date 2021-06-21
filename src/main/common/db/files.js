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

const mongoose = require('mongoose');
const boom = require('@hapi/boom');
const log4js = require('log4js');

const messages = require('../utils/messageUtil');
const common = require('../common');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger();

const files = mongoose.Schema({
    userId: { type : String, required: true },
    fileName: { type : String, required: true },
    mimeType: { type : String, required: true },
    hash: { type : String, required: true },
    isLocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    insertDate: { type: Date, default: Date.now() },
    updateDate: { type: Date, default: Date.now() },
});

files.virtual('fileId').get(function () {
    return this._id;
});

const filesModel = mongoose.model('files', files);

module.exports.create = async (data, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await filesModel.create(data, option);
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.file.createError);
    }
};

module.exports.findOne = async (condition) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await filesModel.findOne(condition);
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.file.findError);
    }
};

module.exports.find = async (condition, projection = null, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await filesModel.find(condition, projection, option);
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.file.findError);
    }
};

module.exports.updateOne = async (condition, data, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await filesModel.updateOne(condition, data, option);
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.file.updateError);
    }
};

module.exports.deleteOne = async (condition, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await filesModel.deleteOne(condition);
    } catch (err) {
        logger.error(err);
        throw err;
    }
};

module.exports.checkNotFound = async (condition) => {
    try {
        common.checkConnectedDb(mongoose.connection);
        let exists = await filesModel.exists(condition);
        if (!exists) {
            throw boom.notFound(messages.error.db.file.notfoundError);
        }
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.user.updateError);
    }
};

module.exports.checkLocked = async (fileId) => {
    try {
        common.checkConnectedDb(mongoose.connection);
        let file = await filesModel.findOne({ _id: fileId });
        if (file.isLocked) {
            throw boom.badRequest('file is locked');
        }
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.user.updateError);
    }
};

module.exports.checkConflict = async (condition) => {
    try {
        common.checkConnectedDb(mongoose.connection);
        let exists = await filesModel.exists(condition);
        if (exists) {
            throw boom.conflict(messages.error.db.file.conflictError);
        }
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.user.updateError);
    }
};
