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

const responseLogs = mongoose.Schema({
    userId: String,
    date: String,
    endpoint: String,
    role: String,
    statusCode: Number,
    message: Object,
    insertDate: { type: Date, default: Date.now() },
    updateDate: { type: Date, default: Date.now() },
});

const responseLogsModel = mongoose.model('responseLogs', responseLogs);

module.exports.create = async (data, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);
        let r = await responseLogsModel.create(data, option);
        return r;
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.record.createError);
    }
};

module.exports.findOne = async (condition) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await responseLogsModel.findOne(condition);
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.record.findError);
    }
};

module.exports.find = async (condition, projection = null, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await responseLogsModel.find(condition, projection, option);
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.record.findError);
    }
};

module.exports.updateOne = async (condition, data, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await responseLogsModel.updateOne(condition, data, option);
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.record.updateError);
    }
};

module.exports.deleteOne = async (condition, option = {}) => {
    try {
        common.checkConnectedDb(mongoose.connection);

        return await responseLogsModel.deleteOne(condition, option);
    } catch (err) {
        logger.error(err);
        throw err;
    }
};

module.exports.checkNotFound = async (condition) => {
    try {
        common.checkConnectedDb(mongoose.connection);
        let exists = await responseLogsModel.exists(condition);
        if (!exists) {
            throw boom.notFound(messages.error.db.record.notfoundError);
        }
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.record.updateError);
    }
};

module.exports.checkConflict = async (condition) => {
    try {
        common.checkConnectedDb(mongoose.connection);
        let exists = await responseLogsModel.exists(condition);
        if (exists) {
            throw boom.conflict(messages.error.db.record.conflictError);
        }
    } catch (err) {
        if (boom.isBoom(err)) {
            throw err;
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.db.record.updateError);
    }
};