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

const express = require('express');
const log4js = require('log4js');
const { StatusCodes } = require('http-status-codes');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger();

module.exports.listen = (webConfig, routingMap, serviceName = 'Web-service') => {
    const app = express();

    app.use(log4js.connectLogger(log4js.getLogger('request')));
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: true }));

    // app.use(
    //     (req, res, next) => {
    //         logger.debug(req.method, req.url);
    //         logger.debug(JSON.stringify(req.headers));
    //         next();
    // });

    app.use((req, res, next) => {
        res.setHeader( 'X-Powered-By', 'Holonus Backend Server v1.0.0' );
        next();
    });

    app.use('/isalive', (req, res) => {
        res.status(StatusCodes.OK).send('System is working.');
    });

    for(let key in routingMap) {
        app.use(key, routingMap[key]);
    }

    app.use((req, res) => {
        res.status(StatusCodes.NOT_FOUND).send('Not Found');
    });

    app.use((err, req, res, next) => {
        logger.error(err.stack);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    });

    app.on('error', (err) => { 
        logger.error(err.stack);
    });

    return app.listen(webConfig.port, () => {
        logger.info(`${serviceName} is listening on port ${webConfig.port}`);
    });
};
