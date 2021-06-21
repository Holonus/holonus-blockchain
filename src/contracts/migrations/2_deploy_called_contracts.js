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

const FileStorage = artifacts.require("holonusFileService/FileStorage");
const KeyStorage = artifacts.require("holonusFileService/KeyStorage");

const EternalStorage = artifacts.require("holonusCoinService/EternalStorage");
const ManageStorage = artifacts.require("holonusCoinService/ManageStorage");
const TokenERC20 = artifacts.require("holonusCoinService/TokenERC20");

const info = require('../info.json');

module.exports = function(deployer) {
    // holonus file
    deployer.deploy(FileStorage).then(() => { 
        info.current.FileStorage.address = FileStorage.address;
        info.current.FileStorage.abi = FileStorage._json.abi;
    }) ;
    deployer.deploy(KeyStorage).then(() => { 
        info.current.KeyStorage.address = KeyStorage.address;
        info.current.KeyStorage.abi = KeyStorage._json.abi;
    }) ;

    // holonus coin
    deployer.deploy(EternalStorage).then(() => { 
        info.current.EternalStorage.address = EternalStorage.address;
        info.current.EternalStorage.abi = EternalStorage._json.abi;
        return deployer.deploy(TokenERC20, EternalStorage.address);
    }).then(() => { 
        info.current.TokenERC20.address = TokenERC20.address;
        info.current.TokenERC20.abi = TokenERC20._json.abi;
    });

    deployer.deploy(ManageStorage).then(() => { 
        info.current.ManageStorage.address = ManageStorage.address;
        info.current.ManageStorage.abi = ManageStorage._json.abi;
    }) ;
};  