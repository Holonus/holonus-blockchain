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

import "./base/owned.sol";

contract EternalStorage is owned {
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

  function isEnabled(address account) onlyOwner view public returns(bool) {
    return allowAccount[account];
  }

  mapping (bytes32 => mapping(address => mapping (address => uint256))) private AddrGrpUIntStorage;
  function getAddrGrpUIntValue(bytes32 record, address owner, address spender) isAllow(msg.sender) public view returns (uint256)	{ return AddrGrpUIntStorage[record][owner][spender];     }
  function setAddrGrpUIntValue(bytes32 record, address owner, address spender, uint256 value) isAllow(msg.sender) public	            { AddrGrpUIntStorage[record][owner][spender] = value;    }

  mapping (bytes32 => mapping(address => mapping (address => int))) private AddrGrpIntStorage;
  function getAddrGrpIntValue(bytes32 record, address owner, address spender) isAllow(msg.sender) public view returns (int)	{ return AddrGrpIntStorage[record][owner][spender];     }
  function setAddrGrpIntValue(bytes32 record, address owner, address spender, int value) isAllow(msg.sender) public	            { AddrGrpIntStorage[record][owner][spender] = value;    }

  struct UserInfo {
    address     sender;
    int         intValue;
    uint256     uintValue;
  }
  mapping (bytes32 => mapping(address => mapping (address => UserInfo))) private AddrGrpUserInfoStorage;
  function getAddrUserInfo(bytes32 record, address owner, address spender) isAllow(msg.sender) public view returns (address, int, uint256) {
    return (AddrGrpUserInfoStorage[record][owner][spender].sender, AddrGrpUserInfoStorage[record][owner][spender].intValue, AddrGrpUserInfoStorage[record][owner][spender].uintValue);
  }
  function setAddrUserInfo(bytes32 record, address owner, address spender, int intVal, uint256 uintVal) isAllow(msg.sender) public {
    AddrGrpUserInfoStorage[record][owner][spender].sender       = spender;
    AddrGrpUserInfoStorage[record][owner][spender].intValue     = intVal;
    AddrGrpUserInfoStorage[record][owner][spender].uintValue    = uintVal;
  }

  mapping (bytes32 => mapping(address => uint256)) private AddrUIntStorage;
  function getAddrUIntValue(bytes32 record, address owner) isAllow(msg.sender) public view returns (uint256)  { return AddrUIntStorage[record][owner];     }
  function setAddrUIntValue(bytes32 record, address owner, uint256 value) isAllow(msg.sender) public	            { AddrUIntStorage[record][owner] = value;    }

  mapping(bytes32 => mapping(address => int)) private AddrIntStorage;
  function getAddrIntValue(bytes32 record, address owner) isAllow(msg.sender) public view returns (int) { return AddrIntStorage[record][owner];    }
  function setAddrIntValue(bytes32 record, address owner, int value) isAllow(msg.sender) public             { AddrIntStorage[record][owner] = value;	}

  mapping (bytes32 => mapping(address => bool)) private AddrBooleanStorage;
  function getAddrBooleanValue(bytes32 record, address owner) isAllow(msg.sender) public view returns (bool)  { return AddrBooleanStorage[record][owner];     }
  function setAddrBooleanValue(bytes32 record, address owner, bool value) isAllow(msg.sender) public	            { AddrBooleanStorage[record][owner] = value;    }

	mapping(bytes32 => uint256) private UIntStorage;
	function getUIntValue(bytes32 record) isAllow(msg.sender) public view returns (uint256) { return UIntStorage[record];   }
	function setUIntValue(bytes32 record, uint256 value) isAllow(msg.sender) public             { UIntStorage[record] = value;	}

	mapping(bytes32 => string) private StringStorage;
	function getStringValue(bytes32 record) isAllow(msg.sender) public view returns (string memory) { return StringStorage[record];    }
	function setStringValue(bytes32 record, string memory value) isAllow(msg.sender) public             { StringStorage[record] = value;   }

	mapping(bytes32 => address) private AddressStorage;
	function getAddressValue(bytes32 record) isAllow(msg.sender) public view returns (address) { return AddressStorage[record];     }
	function setAddressValue(bytes32 record, address value) isAllow(msg.sender) public             { AddressStorage[record] = value;	}

	mapping(bytes32 => bytes) private BytesStorage;
	function getBytesValue(bytes32 record) isAllow(msg.sender) public view returns (bytes memory) { return BytesStorage[record];   }
	function setBytesValue(bytes32 record, bytes memory value) isAllow(msg.sender) public             { BytesStorage[record] = value;	}

	mapping(bytes32 => bytes32) private Bytes32Storage;
	function getBytes32Value(bytes32 record) isAllow(msg.sender) public view returns (bytes32) { return Bytes32Storage[record];     }
	function setBytes32Value(bytes32 record, bytes32 value) isAllow(msg.sender) public             { Bytes32Storage[record] = value;	}

	mapping(bytes32 => bool) private BooleanStorage;
	function getBooleanValue(bytes32 record) isAllow(msg.sender) public view returns (bool)	{ return BooleanStorage[record];	}
	function setBooleanValue(bytes32 record, bool value) isAllow(msg.sender) public 	        { BooleanStorage[record] = value;	}

	mapping(bytes32 => int) private IntStorage;
	function getIntValue(bytes32 record) isAllow(msg.sender) public view returns (int) { return IntStorage[record];	    }
	function setIntValue(bytes32 record, int value) isAllow(msg.sender) public             { IntStorage[record] = value;	}

}
