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

const jsonwebtoken = require('jsonwebtoken');
const boom = require('@hapi/boom');

const usersModel = require('../db/users');
const common = require('../common');

module.exports.getAccessTokenFromHeader = (req, logger) => {
    let authorization = req.headers['authorization'];
    if (!authorization) {
        throw boom.badRequest('authorization is invalid, remote=' + common.getRemoteAddress(req));
    }

    let temp = authorization.split(' ');
    if (temp[0] != 'Bearer' || temp.length < 2 || temp[1] == '') {
        if (logger) logger.warn('invalid header, no accesstoken, remote=' + common.getRemoteAddress(req));
        throw boom.badRequest('authorization is invalid');
    }

    return temp[1];
};

module.exports.checkAccessTokenExpiry = (req, accessToken, logger) => {
    let ret = jsonwebtoken.decode(accessToken);
    if (!ret) {
        throw boom.badRequest('authorization is invalid');
    }
    let expDate = new Date(ret.exp * 1000);
    let nowDate = new Date();
    let now = nowDate.getTime() / 1000;
    if (logger) logger.debug('accesstoken check');
    if (logger) logger.debug('exp: ' + expDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) + ` (${ret.exp})`);
    if (logger) logger.debug('now: ' + nowDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) + ` (${now})`);
    if (now > ret.exp) {
        if (logger) logger.warn('invalid accesstoken, accesstoken is expired, remote=' + common.getRemoteAddress(req));
        throw boom.unauthorized('authorization is invalid');
    }
};

module.exports.getUserByAccessToken = async (req, accessToken, logger) => {
    let userInfo = await usersModel.findOne({ accessToken : accessToken });
    if (!userInfo) {
        if (logger) logger.warn('invalid accesstoken, user not found, remote=' + common.getRemoteAddress(req));
        throw boom.unauthorized('authorization is invalid');
    }
    return userInfo;
};
