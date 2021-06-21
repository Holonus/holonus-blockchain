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

pragma solidity >=0.5.0 < 0.8.5;

import "./base/AddressRestriction.sol";
import "./base/Lock.sol";

contract FileStorage is AddressRestriction, Lock{

    struct File {
        string fileId;
        string hash;
    }

    mapping(string => File) private files;

    function set(string calldata fileId, string calldata hash) external isAllow isUnlocked {
        File memory file;
        file.fileId = fileId;
        file.hash = hash;
        files[fileId] = file;
    }

    function get(string calldata fileId) external view isAllow isUnlocked returns(string memory, string memory){
        File memory file = files[fileId];
        return (
            file.fileId,
            file.hash
        );
    }
}