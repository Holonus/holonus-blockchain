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

const express = require('express');
const log4js = require('log4js');
const boom = require('@hapi/boom');
const config = require('config');
const { header } = require('express-validator');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const common = require('../../../common/common');
const cors = require('cors');

const usersModel = require('../../../common/db/users');
const responseLogsModel = require('../../../common/db/responseLogs');
const dbUtil = require('../../../common/utils/dateUtil');

log4js.configure('config/log4js.config.json');
const logger = log4js.getLogger();
const responselogger = log4js.getLogger('response');

const router = express.Router();

router.use(cors({ origin: '*', methods: ['GET', 'PUT', 'POST', 'DELETE'] }));

router.use((req, res, next) => {
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks = [];

    res.write = (...restArgs) => {
        chunks.push(Buffer.from(restArgs[0]));
        oldWrite.apply(res, restArgs);
    };

    res.end = (...restArgs) => {
        if (restArgs[0]) {
            chunks.push(Buffer.from(restArgs[0]));
        }
        let body = Buffer.concat(chunks).toString('utf8');
        // eslint-disable-next-line no-empty
        try { body = JSON.parse(body); } catch (err) { }

        responselogger.debug({
            fromIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            method: req.method,
            originalUri: req.originalUrl,
            uri: req.url,
            requestHeader: req.headers,
            requestBody: req.body,
            statusCode: res.statusCode,
            responseBody: body,
        });

        (async () => {
            try {
                let data = {
                    userId: '',
                    date: dbUtil.formatDateTime(new Date()),
                    endpoint: req.url,
                    role: '',
                    statusCode: res.statusCode,
                    message: body
                };

                if (req.loginUser) {
                    let user = config.stub ? getUserStub() : await usersModel.findOne({ userId: req.loginUser.userId });
                    data.userId = user.userId;
                    data.role = user.role;
                }

                if (config.stub == false) await responseLogsModel.create(data);
            } catch (err) { logger.error(err); }
        })();

        oldEnd.apply(res, restArgs);
    };

    next();
});

function getUserStub() {
    return {
        userId : '00',
        role : 'user'
    };
}

router.use([header('Content-Type').contains('application/json')], (req, res, next) => {
    common.checkInputValue(req);
    next();
});

router.use('/', require('./v1/auth'));
router.use('/', require('./v1/coins'));
router.use('/', require('./v1/files'));
router.use('/', require('./v1/keys'));

router.use((req, res) => {
    res.status(StatusCodes.NOT_FOUND).json(
        common.generateResponseData(false, ReasonPhrases.NOT_FOUND)
    );
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
    if (boom.isBoom(err)) {
        logger.error(err);
        res.status(err.output.statusCode).json(
            common.generateResponseData(false, err.message)
        );
    } else {
        logger.error(err.stack);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            common.generateResponseData(false, ReasonPhrases.INTERNAL_SERVER_ERROR)
        );
    }
});

module.exports = router;
