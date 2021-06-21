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

pragma solidity >=0.5.0 <0.8.5;

import "./base/AddressRestriction.sol";
import "./base/Lock.sol";

import "./FileStorage.sol";
import "./KeyStorage.sol";

contract HolonusFileService is AddressRestriction, Lock {

    FileStorage internal fileStorage;
    KeyStorage internal keyStorage;

    constructor(address _fileStorage, address _keyStorage) isAllow() isUnlocked() {
        fileStorage = FileStorage(_fileStorage);
        keyStorage = KeyStorage(_keyStorage);
    }

    function setFile(string calldata fileId, string calldata hash) external isAllow isUnlocked{
        fileStorage.set(fileId, hash);
    }

    function getFile(string calldata fileId) external view isAllow isUnlocked returns(string memory,  string memory) {
        return (fileStorage.get(fileId));
    }

    function setKey(string calldata publickeyId, string calldata publicKey) external isAllow isUnlocked{
        keyStorage.set(publickeyId, publicKey);
    }

    function getKey(string calldata publickeyId) external view isAllow isUnlocked returns(string memory, string memory) {
        return (keyStorage.get(publickeyId));
    }
}