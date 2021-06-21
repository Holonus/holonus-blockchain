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

const { param, body } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const boom = require('@hapi/boom');

const messages = require('../../../../common/utils/messageUtil');
const common = require('../../../../common/common');
const keysCore = require('../../../core/api/v1/keys');

module.exports.postKeyValid = [];

module.exports.postKeyValid2 = (req, res, next) => {
    if (!Object.keys(req.body).length) {
        throw boom.badRequest('Invalid parameter');
    }

    let userId = Object.keys(req.body)[0];
    if (userId != req.loginUser.userId) {
        throw boom.badRequest('Invalid parameter');
    }

    next();
};

module.exports.postKey = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let data = {
            userId: Object.keys(req.body)[0],
            publicKey: req.body[Object.keys(req.body)[0]],
        };

        let publicKeyId = await keysCore.postKey(data);
        res.status(StatusCodes.CREATED).json(common.generateResponseData(true, 'registered', {
            publicKeyId: publicKeyId,
        }));
    } catch (err) {
        next(err);
    }
};

module.exports.getKey = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let condition = {
            userId: req.loginUser.userId,
            publicKeyId: req.params.publicKeyId,
        };
        let info = await keysCore.getKey(condition);
        res.json(common.generateResponseData(true, null, info));
    } catch (err) {
        next(err);
    }
};

module.exports.getKeyValid = [param('publicKeyId').notEmpty().isMongoId()];

module.exports.deleteKey = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let condition = {
            userId: req.loginUser.userId,
            publicKeyId: req.params.publicKeyId,
        };

        await keysCore.deleteKey(condition);

        res.json(common.generateResponseData(true, 'deleted', {
            publicKeyId: req.params.publicKeyId,
        }));
    } catch (err) {
        next(err);
    }
};
module.exports.deleteKeyValid = [param('publicKeyId').notEmpty().isMongoId()];

module.exports.putKey = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let condition = {
            userId: req.loginUser.userId,
            publicKeyId: req.params.publicKeyId
        };

        let data = {
            publicKey: req.body[Object.keys(req.body)[0]],
        };

        let publicKeyId = await keysCore.putKey(condition, data);
        res.json(
            common.generateResponseData(true, 'replaced', { publicKeyId: publicKeyId })
        );
    } catch (err) {
        next(err);
    }
};

module.exports.putKeyValid = [];

module.exports.putKeyValid2 = (req, res, next) => {
    if (!Object.keys(req.body).length) {
        throw boom.badRequest('body is Invalid value');
    }
    next();
};
