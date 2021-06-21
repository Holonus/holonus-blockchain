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

const messages = require('../../../../common/utils/messageUtil');
const common = require('../../../../common/common');
const coinsCore = require('../../../core/api/v1/coins');

module.exports.getCoinsValid = [param('account').notEmpty().isEthereumAddress()];

module.exports.getCoins = async (req, res, next) => {
     try {
         common.checkInputValue(req);
 
        let filter = {
            userId: req.loginUser.userId,
            account: req.params.account,
        };
        let bcData = await coinsCore.getCoinCore(filter);

        let ret = common.generateResponseData(true, null, { account : req.params.account, balance : bcData.balance });
        res.status(StatusCodes.OK).json(ret);

    } catch (err) {
         next(err);
     }
 };

module.exports.postCoinsValid = [param('from').notEmpty().isEthereumAddress(), param('to').notEmpty().isEthereumAddress(), param('amount').notEmpty().isInt()];

module.exports.postCoins = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let data = {
            userId: req.loginUser.userId,
            from: req.params.from,
            to: req.params.to,
            amount: req.params.amount,
        };
        let txInfo = await coinsCore.postCoinCore(data);

        delete data.userId;
        data.txHash = txInfo.hash;

        let ret = common.generateResponseData(true, null, data);
        res.status(StatusCodes.OK).json(ret);

    } catch (err) {
        next(err);
    }
};
