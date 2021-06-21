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
const config = require('config');

const messages = require('../../../../common/utils/messageUtil');
const common = require('../../../../common/common');

const authCore = {
    'cognito' : require('../../../core/api/v1/auth/auth_cognito'),
    'default' : require('../../../core/api/v1/auth/auth_default')
    // *1
};

let authMode = 'default';
if (config.authMode == 'cognito') {
    authMode = 'cognito';
}
// *1
// *1 If you wish to use another authentication method, please make a core process file and add it here. ***

module.exports.postLoginValid = [
    body('loginId').notEmpty(),
    body('password').notEmpty()
];

module.exports.postLogin = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let data = {
            loginId: req.body.loginId,
            password: req.body.password,
        };

        let result = await authCore[authMode].postLogin(data);

        res.json(common.generateResponseData(true, null, result));
    } catch (err) {
        next(err);
    }
};

module.exports.deleteLoginValid = [];

module.exports.deleteLogin = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let data = {
            accessToken: req.accessToken,
        };

        await authCore[authMode].deleteLogin(data);

        res.status(StatusCodes.NO_CONTENT).json({ message: messages.statusCode[StatusCodes.NO_CONTENT] });
    } catch (err) {
        next(err);
    }
};
