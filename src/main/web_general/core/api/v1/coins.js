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
const log4js = require('log4js');

const holonusCoinService = require('../../../../common/bc/holonusCoinService');
const dbUtil = require('../../../../common/db/dbUtil');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger('service');

module.exports.getCoinCore = async (condition) => {
    if (config.stub) return getCoinStub(condition);

    let bcCondition = {
        account: condition.account
    };

    logger.debug('[getCoinCore]', 'BC', 'holonusCoinService.getBalance', 'bcCondition = ', bcCondition);

    let balance = await holonusCoinService.getBalance(bcCondition);

    logger.debug('[getCoinCore]', 'BC', 'holonusCoinService.getBalance', 'balance = ', balance);

    return {
        account: condition.account,
        balance: balance,
    };
};

function getCoinStub(condition) {
    return {
        account: condition.account,
        balance: 32767,
    };
}

module.exports.postCoinCore = async (data) => {
    if (config.stub) return postCoinStub();

    let exec = async (session) => {
        let bcData = {
            from: data.from,
            to: data.to,
            amount: data.amount
        };

        logger.debug('[postCoinCore]', 'BC', 'holonusCoinService.transfer', 'bcData = ', bcData);

        let txInfo = await holonusCoinService.transfer(bcData);

        logger.debug('[postCoinCore]', 'BC', 'holonusCoinService.transfer', 'txInfo = ', txInfo);

        return txInfo;
    };

    return exec();
};

function postCoinStub() {
    return { hash : 'xxx' };
}
