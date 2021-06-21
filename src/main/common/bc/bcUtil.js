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

const Web3 = require('web3');

module.exports.connect = (url, defaultAccount) => { 
    return connect(url, defaultAccount);
};

module.exports.connect2 = (config) => { 
    return connect(config.bc.url, config.bc.account);
};

function connect(url, defaultAccount) {
    const web3 = new Web3(new Web3.providers.HttpProvider(url));
    web3.eth.defaultAccount = defaultAccount;
    return web3;
}