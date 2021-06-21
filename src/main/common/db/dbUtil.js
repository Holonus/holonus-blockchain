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
const log4js = require('log4js');
const boom = require('@hapi/boom');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger();
const dbLogger = log4js.getLogger('db');

module.exports.connect = (url, option) => {
    mongoose.connect(url, option);

    mongoose.set('debug', (collectionName, method, query, doc) => {
        dbLogger.info(`${collectionName}.${method}`, JSON.stringify(query), doc);
    });

    mongoose.connection.on('connected', function () {
        logger.info(`Database default connection (${url}) was opened`);
    });

    mongoose.connection.on('error', function (err) {
        logger.error('Database default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', function () {
        logger.info('Database default connection was disconnected');
    });

    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            logger.info('Database default connection was disconnected due to application termination');
            process.exit(0);
        });
    });

    return mongoose;
};

module.exports.startSession = async () => {
    return await mongoose.startSession();
}

module.exports.transaction = async (exec) => {
    try {
        logger.debug('Mongoose start session');
        let session = await mongoose.startSession();
        try {
            logger.debug('Mongoose session start transaction');
            let result;
            await session.withTransaction(async () =>{
                result = await exec(session)
            })
            logger.debug('Mongoose session commit transaction');
            return result;
        } catch (err) {
            logger.error('Mongoose session abort transaction');
            throw err;
        } finally {
            logger.debug('Mongoose session finish');
            await session.endSession();
        }
    } catch (err) {
        logger.error(err);
        throw err;
    }
}