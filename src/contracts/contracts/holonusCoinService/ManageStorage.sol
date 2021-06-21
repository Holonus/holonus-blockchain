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

import "./base/SafeMath.sol";
import "./base/owned.sol";

contract ManageStorage is owned {
  using   SafeMath for uint256;
  mapping(address => bool) public allowAccount;

  constructor() {
    enableAllowAccount(msg.sender, true);
  }

  modifier isAllow(address user) {
    require(allowAccount[user]);
    _;
  }

  function enableAllowAccount(address account, bool enable) onlyOwner public {
    allowAccount[account] = enable;
  }

  mapping (bytes32 => mapping(address => mapping(uint256 => address))) private accountIndex;
  function getAccountIndex(bytes32 record, address owner, uint256 index) isAllow(msg.sender) public view returns (address)	{ return accountIndex[record][owner][index];   }

  mapping (bytes32 => mapping(address => uint256)) private accountCount;
  function getAccountCount(bytes32 record, address owner) isAllow(msg.sender) public view returns (uint256)	{ return accountCount[record][owner];  }

  function AddManageAccount(bytes32 record, address owner, address sender) isAllow(msg.sender) public {
    uint256     count = getAccountCount(record, owner);
    bool        find  = false;

    for (uint256 i = 0; i < count; i++) {
      address addr = getAccountIndex(record, owner, i);
      if(addr != sender) { continue; }
      find = true;
      break;
    }

    if(find == false)
    {
      count = count.add(1);
      accountCount[record][owner]             = count;
      accountIndex[record][owner][count - 1]  = sender;
    }
  }
}
