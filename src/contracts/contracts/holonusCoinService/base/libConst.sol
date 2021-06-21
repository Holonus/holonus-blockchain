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

library libConst {

  struct sh3 { bytes32 _sh3value; }

  function totalSupply() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_TotalSupply");
  }

  function tocken() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_Balances");
  }

  function reflectTocken() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_ReflectTocken");
  }

  function allowed() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_Allowed");
  }

  function reliability() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_Reliability");
  }

  function evaAccount() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_EvaAccount");
  }

  function evaAccountCnt() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_EvaAccountCnt");
  }

  function accountEvaList() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_AccountEvaList");
  }

  function adjustParameter() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_AdjustParameter");
  }

  function accumulationPoint() internal pure returns(bytes32)
  {
    return keccak256("HOLONUS_AccumulationPoint");
  }

  function strCat(string memory str1, string memory str2) private pure returns(string memory) {
    bytes   memory strbyte1     = bytes(str1);
    bytes   memory strbyte2     = bytes(str2);
    bytes   memory str          = new bytes(strbyte1.length + strbyte2.length);
    uint8   point               = 0;

    for(uint8 j = 0; j < strbyte1.length;j++)
    {
        str[point++] = strbyte1[j];
    }
    for(uint8 k = 0; k < strbyte2.length;k++)
    {
        str[point++] = strbyte2[k];
    }
    return string(str);
  }
}
