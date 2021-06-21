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

const web3 = require('./bcUtil').connect(config.bc.url, config.bc.account);
const messages = require('../utils/messageUtil');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger();
const contractLogger = log4js.getLogger('contract');

const bcInfo = require('../../../contracts/info.json');
const holonusCoinServiceJson = require('../../../contracts/build/contracts/HolonusCoinService.json');
let holonusCoinService = new web3.eth.Contract(holonusCoinServiceJson.abi, holonusCoinServiceJson.networks[bcInfo.networkid].address);

const eternalStorageJson = require('../../../contracts/build/contracts/EternalStorage.json');
let eternalStorage = new web3.eth.Contract(eternalStorageJson.abi, eternalStorageJson.networks[bcInfo.networkid].address);

const tokenERC20Json = require('../../../contracts/build/contracts/TokenERC20.json');
let tokenERC20 = new web3.eth.Contract(tokenERC20Json.abi, tokenERC20Json.networks[bcInfo.networkid].address);

const DEFAULT_UNLOCK_DURATION = 1000000;

const bcCommon = require('./bcCommon');

module.exports.getBalance = async (data) => {
    return await getBalanceReal(data);
};

function getBalanceStub() {
    return {
        balance: 65535
    };
}

async function getBalanceReal(data) {
    contractLogger.info('getBalanceReal() start');
    contractLogger.info(`param = ${JSON.stringify(data, null, 4)}`);

    try {
        let ret = await tokenERC20.methods.balanceOf(data.account).call({ from : data.account });
        contractLogger.info('IholonusCoinService.getPoint', 'params=', data.account, 'ret=', ret);
        return ret;
    } catch (err) {
        logger.error(err);
        if (boom.isBoom(err)) {
            throw err;
        } else {
            throw boom.notAcceptable(messages.error.bc.coin.getError);
        }
    } finally {
        contractLogger.info('getBalanceReal() end');
    }
}

module.exports.transfer = async (data) => {
    return await transferReal(data);
};

function transferStub(data) {
    return data;
}

async function transferReal(data) {
    try {
        var manageAddress = await bcCommon.getManageAccount(config, web3);
        if (!manageAddress) {
            throw new Error('manage address not specified');
        }

        await allowExecution(data.from, manageAddress);

        await web3.eth.personal.unlockAccount(data.from, config.bc.password, DEFAULT_UNLOCK_DURATION);

        contractLogger.info('tokenERC20.approve', 'params=', data.from, '-->', data.to, ' : ', data.amount);
        let gas = await tokenERC20.methods.approve(data.to, data.amount).estimateGas({ from: data.from });
        let txInfo1 = await tokenERC20.methods.approve(data.to, data.amount).send({ gas : gas, from: data.from });
        contractLogger.info('tokenERC20.approve', 'tx', txInfo1);

        contractLogger.info('tokenERC20.transfer', 'params=', data.from, '-->', data.to, ' : ', data.amount);
        gas = await tokenERC20.methods.transfer(data.to, data.amount).estimateGas({ from: data.from });
        let txInfo2 = await tokenERC20.methods.transfer(data.to, data.amount).send({ gas : gas, from: data.from });
        contractLogger.info('tokenERC20.transfer', 'tx', txInfo2);

        return txInfo2;
    } catch (err) {
        logger.error(err);
        if (boom.isBoom(err)) {
            throw err;
        } else {
            throw boom.notAcceptable(messages.error.bc.coin.transferError);
        }
    }
}

async function allowExecution(adr, manageAddress) {
    var ret = eternalStorage.methods.isEnabled(adr).call();
    if (ret == false) {
        let gas = await eternalStorage.methods.enableAllowAccount(adr).estimateGas({ from: manageAddress });
        let txInfo = await tokenERC20.methods.enableAllowAccount(adr).send({ gas : gas, from: manageAddress });
        return txInfo;
    }
    return null;
}
