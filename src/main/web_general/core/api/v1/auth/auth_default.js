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
const jsonwebtoken = require('jsonwebtoken');
const boom = require('@hapi/boom');
const log4js = require('log4js');

const usersModel = require('../../../../../common/db/users');
const dateUtil = require('../../../../../common/utils/dateUtil');
const common = require('../../../../../common/common');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger('service');

module.exports.postLogin = async (data) => {
    if (config.stub == true) return postLoginStub();

    var userInfo = await usersModel.findOne({
        userId: data.loginId,
        password: common.getHash(data.password)
    });
    if (!userInfo) {
        throw boom.unauthorized('login incorrect');
    }

    let accessToken = await updateAccessToken(userInfo);
    let decodedData = jsonwebtoken.decode(accessToken);

    return {
        userId: userInfo.userId,
        authorization: 'Bearer' + ' ' + accessToken,
        accessExpire: dateUtil.formatDateTime(new Date(decodedData.exp * 1000)),
        refreshToken: null,
        refreshExpire: null,
    };
}

async function updateAccessToken(userInfo) {
    let accessToken = common.makeNewAccessToken({ id: userInfo.userId, time : new Date().getTime() });

    let ret = await usersModel.updateOne({ userId : userInfo.userId }, { accessToken : accessToken });
    if (!ret || ret.ok != 1) {
        throw boom.internal('update accesstoken failed');
    }

    return accessToken;
}

function postLoginStub() {
    return {
        userId: 'userId1',
        authorization: 'Bearer accessToken1',
        accessExpire: 'accessExpire1',
        refreshToken: 'refreshToken1',
        refreshExpire: 'refreshExpire1',
    };
}

module.exports.deleteLogin = async (data) => {
    if (config.stub == true) return postLoginStub();

    var userInfo = await usersModel.findOne({
        userId: data.loginId,
        password: common.getHash(data.password)
    });
    if (!userInfo) {
        throw boom.unauthorized('login incorrect');
    }

    let accessToken = await updateAccessToken(userInfo);
    let decodedData = jsonwebtoken.decode(accessToken);

    return {
        userId: userInfo.userId,
        authorization: 'Bearer' + ' ' + accessToken,
        accessExpire: dateUtil.formatDateTime(new Date(decodedData.exp * 1000)),
        refreshToken: null,
        refreshExpire: null,
    };
}
