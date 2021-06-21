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

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md

pragma solidity >=0.5.0 <0.8.5;

import "./base/SafeMath.sol";
import "./base/libConst.sol";
import "./base/owned.sol";
import "./EternalStorage.sol";

contract TokenERC20 is owned {
  using   SafeMath for uint256;
  string          public  constant    name                = "Holon";
  string          public  constant    symbol              = "HOLON";
  uint256         public  constant    decimals            = 18;
  uint256         public  constant    initialSupply       = 10000000000;
  EternalStorage  private             eternalStorage;

  bytes32         private             totalSupplySha3;
  bytes32         private             tockenSha3;
  bytes32         private             allowedSha3;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

  constructor(address storageAddress) {
    eternalStorage          = EternalStorage(storageAddress);
    totalSupplySha3         = libConst.totalSupply();
    tockenSha3              = libConst.tocken();
    allowedSha3             = libConst.allowed();
  }

  function Init() onlyOwner public {
    if(totalSupply() <= 0) {
      eternalStorage.setAddrUIntValue(tockenSha3, msg.sender, initialSupply);
      eternalStorage.setUIntValue(totalSupplySha3, initialSupply);
    }
  }

  function totalSupply() public view returns (uint) {
    return eternalStorage.getUIntValue(totalSupplySha3);
  }

  function balanceOf(address _owner) public view returns (uint256 balance) {
    return eternalStorage.getAddrUIntValue(tockenSha3, _owner);
  }

  function _transfer(address _from, address _to, uint _value) internal {
    uint256 fromBalances   = eternalStorage.getAddrUIntValue(tockenSha3, _from);
    uint256 toBalances     = eternalStorage.getAddrUIntValue(tockenSha3, _to);

    require(_to != address(0) && fromBalances >= _value && _value > 0);
    require(toBalances + _value > toBalances);

    uint previousBalances   = fromBalances.add(toBalances);
    fromBalances            = fromBalances.sub(_value);
    toBalances              = toBalances.add(_value);
    eternalStorage.setAddrUIntValue(tockenSha3, _from, fromBalances);
    eternalStorage.setAddrUIntValue(tockenSha3, _to, toBalances);

    emit Transfer(_from, _to, _value);

    assert(eternalStorage.getAddrUIntValue(tockenSha3, _from).add(eternalStorage.getAddrUIntValue(tockenSha3, _to)) == previousBalances);
  }

  function transfer(address _to, uint256 _value) public {
    _transfer(msg.sender, _to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    uint256 allowed = eternalStorage.getAddrGrpUIntValue(allowedSha3, _from, msg.sender);
    require(_value <= allowed);
    allowed -= _value;
    eternalStorage.setAddrGrpUIntValue(allowedSha3, _from, msg.sender, allowed);
    _transfer(_from, _to, _value);
    return true;
  }

  function approve(address _spender, uint256 _value) public returns (bool success) {
    eternalStorage.setAddrGrpUIntValue(allowedSha3, msg.sender, _spender, _value);
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
    return eternalStorage.getAddrGrpUIntValue(allowedSha3, _owner, _spender);
  }
}
