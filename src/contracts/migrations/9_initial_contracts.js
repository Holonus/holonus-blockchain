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

const Web3 = require('web3');

const truffleConf = require('../truffle-config');
const from = truffleConf.networks.development.from;
const networkId = truffleConf.networks.development.network_id;

let web3 = new Web3(new Web3.providers.HttpProvider(`http://${truffleConf.networks.development.host}:${truffleConf.networks.development.port}`));
web3.eth.defaultAccount = from;

const info = require('../info.json');

module.exports = async function (deployer, network, accounts) {
    let FileStorage = new web3.eth.Contract(info.current.FileStorage.abi,
            info.current.FileStorage.address);
    let KeyStorage = new web3.eth.Contract(info.current.KeyStorage.abi,
                info.current.KeyStorage.address);
    
    await enableCallerAddr(FileStorage, info.current.HolonusFileService.address);
    await enableCallerAddr(KeyStorage, info.current.HolonusFileService.address);

    let EternalStorage = new web3.eth.Contract(info.current.EternalStorage.abi,
        info.current.EternalStorage.address);
    let ManageStorage = new web3.eth.Contract(info.current.ManageStorage.abi,
        info.current.ManageStorage.address);

    await enableCallerAddr2(EternalStorage, info.current.TokenERC20.address);
    await enableCallerAddr2(EternalStorage, info.current.HolonusCoinService.address);
    await enableCallerAddr2(EternalStorage, accounts[0]);
    await enableCallerAddr2(ManageStorage, info.current.HolonusCoinService.address);

    await initCoin(accounts[0]);

    info.owner = accounts[0];
   
    const fs = require('fs');
    fs.writeFileSync('./info.json', JSON.stringify(info, null, 4));
};


async function enableCallerAddr(contract, callerAddr) {
    let isEnable = await contract.methods.isEnableAllowAccount(callerAddr).call();
    if (isEnable === false) {
        let gas = await contract.methods
        .enableAllowAccount(callerAddr, true)
        .estimateGas();
        await contract.methods
        .enableAllowAccount(callerAddr, true)
        .send({ gas, from });
    }
}

async function enableCallerAddr2(contract, callerAddr) {
    let gas = await contract.methods
    .enableAllowAccount(callerAddr, true)
    .estimateGas();
    var txInfo = await contract.methods
    .enableAllowAccount(callerAddr, true)
    .send({ gas, from });
    console.log(txInfo);
    return txInfo;
}

async function initCoin(adr) {
    console.log('------------------------------------------------------------ initCoin() start');
    try {
        let tokenERC20 = new web3.eth.Contract(info.current.TokenERC20.abi,
            info.current.TokenERC20.address);
        let gas = await tokenERC20.methods.Init().estimateGas({ from: adr });
        console.log(`gas=[${gas}]`);
        let txInfo = await tokenERC20.methods.Init().send({ gas: gas, from: adr });
        console.log('tokenERC20.Init', 'adr=', adr, 'txInfo=', txInfo, 'hash=', txInfo.hash);
        return txInfo;
    } catch (err) {
        console.error(err.message);
        throw err;
    } finally {
        console.log('------------------------------------------------------------ initCoin() end');
    }
}