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


const HolonusFileService = artifacts.require("HolonusFileService");
const HolonusCoinService = artifacts.require("HolonusCoinService");
const info = require('../info.json');

module.exports = function (deployer) {

    deployer.deploy(HolonusFileService, info.current.FileStorage.address, info.current.KeyStorage.address)
        .then(() => {
            info.current.HolonusFileService.abi = HolonusFileService._json.abi;
            info.current.HolonusFileService.address = HolonusFileService.address
    });

    deployer.deploy(HolonusCoinService, info.current.EternalStorage.address, info.current.ManageStorage.address, info.current.TokenERC20.address)
    .then(() => {
        info.current.HolonusCoinService.abi = HolonusCoinService._json.abi;
        info.current.HolonusCoinService.address = HolonusCoinService.address
    });
};
