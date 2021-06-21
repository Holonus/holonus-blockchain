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
const boom = require('@hapi/boom');
const log4js = require('log4js');

const usersModel = require('../../../common/db/users');
const consts = require('../../../resources/const.json');
const authUtil = require('../../../common/utils/authUtil');

log4js.configure('config/log4js.config.json');
const logger = log4js.getLogger();

module.exports.useAuthorization = async (req, res, next) => {
    try {
        if (!req.headers['authorization']) {
            throw boom.badRequest('authorization is invalid');
        }

        if (config.stub) {
            authorizationByStub(req);
            next();
            return;
        }

        if (config.authMode == 'cognito') {
            await authorizationWithCognito(req);
        } else {
            await authorizationDefault(req);
        }

        next();
    } catch (err) {
        next(err);
    }
};

async function authorizationWithCognito(req) {
    // *** If you wish to authenticate with Cognito, please link with your account. ***
}

async function authorizationDefault(req) {
    let accessToken = authUtil.getAccessTokenFromHeader(req, logger);

    authUtil.checkAccessTokenExpiry(req, accessToken, logger);

    var userInfo = await authUtil.getUserByAccessToken(req, accessToken, logger);

    req.loginUser = {
        userId: userInfo.userId,
        userName: userInfo.userName,
        publicKeyId : userInfo._keysId
    };

    req.accessToken = accessToken;
}

function authorizationByStub(req) {
    req.loginUser = {
        userId: '01',
        userName: 'テスト太郎',
    };
    req.accessToken = 'hoge';
}

module.exports.onlyUserRole = async (req, res, next) => {
    try {
        if (config.stub) { return next(); }
        let dbUser = await usersModel.findOne({ userId: req.loginUser.userId });
        req.loginUser.role = dbUser.role;

        if (req.loginUser.role != consts.role.user) {
            throw boom.forbidden('access denied for not user role');
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports.checkExsistUser = async (req, res, next) => {
    try {
        if (config.stub) { return next(); }
        
        //
        let dbCondition = { 
            userId: req.loginUser.userId,
        };

        await usersModel.checkNotFound(dbCondition);

        if(req.body.name){
            await cognitoService.verifyAccessToken(req.accessToken);
            let userInfo = await cognitoService.getUser(req.accessToken);
            
            if (userInfo.UserAttributes.find((v) => v.Name == 'name').Value != req.body.name) {
                throw boom.forbidden('name is different');
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};
