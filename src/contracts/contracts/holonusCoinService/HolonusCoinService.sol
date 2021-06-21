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
import "./base/libConst.sol";
import "./base/owned.sol";
import "./EternalStorage.sol";
import "./ManageStorage.sol";
import "./TokenERC20.sol";

contract HolonusCoinService is owned {
  using   SafeMath for uint256;

  EternalStorage  private                 eternalStorage;
  ManageStorage   private                 manageStorage;
  TokenERC20      private                 tokenContract;

  uint8           private                 reliabilityDecimals     = 18;
  bytes32         private                 reliabilitySha3;
  bytes32         private                 evaAccountSha3;
  bytes32         private                 evaAccountCntSha3;

  bytes32         private                 accountEvaListSha3;

  bytes32         private                 adjustParameterSha3;

  bytes32         private                 totalSupplySha3;
  bytes32         private                 tockenSha3;
  bytes32         private                 reflectTokenSha3;
  bytes32         private                 accumulationPointSha3;

  event Transfer(address indexed from, address indexed to, uint256 value);

  constructor(address strageAddress, address manageAddress, address tokenAddress) {
    eternalStorage          = EternalStorage(strageAddress);
    manageStorage           = ManageStorage(manageAddress);
    tokenContract           = TokenERC20(tokenAddress);
    reliabilitySha3         = libConst.reliability();
    evaAccountSha3          = libConst.evaAccount();
    evaAccountCntSha3       = libConst.evaAccountCnt();
    accountEvaListSha3      = libConst.accountEvaList();
    adjustParameterSha3     = libConst.adjustParameter();
    totalSupplySha3         = libConst.totalSupply();
    tockenSha3              = libConst.tocken();
    reflectTokenSha3        = libConst.reflectTocken();
    accumulationPointSha3   = libConst.accumulationPoint();
  }

  function setReliability(address owner, uint256 reliability) onlyOwner public {
    uint256 setValue = reliability;
    eternalStorage.setAddrUIntValue(reliabilitySha3, owner, setValue);
  }

  function getReliability(address owner) public view returns (uint256) {
    uint256 reliability = eternalStorage.getAddrUIntValue(reliabilitySha3, owner);
    if(reliability > 10 * 10 ** uint256(reliabilityDecimals))
    {
      reliability = 10 * 10 ** uint256(tokenContract.decimals());
    }
    return reliability;
  }

  function getFullReliability(address owner) public view returns (uint256) {
    return eternalStorage.getAddrUIntValue(reliabilitySha3, owner);
  }

  function getEvaAccountCnt(address owner) public view returns(uint256) {
    return manageStorage.getAccountCount(evaAccountSha3, owner);
  }

  function getTrustworthy(address sender) public view returns(address, int, uint256) {
    return eternalStorage.getAddrUserInfo(evaAccountSha3, sender, msg.sender);
  }

  function reliabilityConsensus(address sender, int trustworthy) private view returns (uint256) {
    if(trustworthy <= 0) { return 0; }

    uint256 reliability = getReliability(sender) / 10 ** uint256(reliabilityDecimals);
    uint256 param       = uint256(trustworthy) * 10 ** uint256(reliabilityDecimals - 2);

    return reliability.mul(param);
  }

  function CallEvaluateReliability(address owner, address sender, int trustworthy) public {
    require(trustworthy == -1 || (trustworthy >= 1 && trustworthy <= 5));

    uint256 oldReliability  = getReliability(sender) / 10 ** uint256(reliabilityDecimals);

    fcUpdateReliability(owner, sender, trustworthy);

    uint256 nowReliability = getReliability(sender) / 10 ** uint256(reliabilityDecimals);
    if (oldReliability != nowReliability)
    {
      uint256 cnt = manageStorage.getAccountCount(accountEvaListSha3, sender);
      for(uint256 i = 0; i < cnt; i++)
      {
        address account = manageStorage.getAccountIndex(accountEvaListSha3, sender, i);
        fcUpdateReliability(sender, account, 0);
      }
    }
  }

  function fcUpdateReliability(address owner, address sender, int trustworthy) private {
    address     user;
    int         nowTrustworthy;
    uint256     nowReliability;
    (user, nowTrustworthy, nowReliability) = eternalStorage.getAddrUserInfo(evaAccountSha3, sender, owner);
    if(trustworthy == 0) { trustworthy = nowTrustworthy; }

    uint256     senderReliability   = getFullReliability(sender);
    uint256     reliability         = reliabilityConsensus(owner, trustworthy);

    if(user != address(0)) { senderReliability = senderReliability.sub(nowReliability); }
    senderReliability = senderReliability.add(reliability);
    eternalStorage.setAddrUIntValue(reliabilitySha3, sender, senderReliability);
    require(getFullReliability(sender) == senderReliability);

    manageStorage.AddManageAccount(evaAccountSha3    , sender, owner);
    manageStorage.AddManageAccount(accountEvaListSha3, owner, sender);
    eternalStorage.setAddrUserInfo(evaAccountSha3, sender, owner, trustworthy, reliability);
  }

  function setAdjustParameter(uint256 value, uint8 decimals) onlyOwner public {
    uint256 mulValue        = 10 ** uint256(tokenContract.decimals() - decimals);
    eternalStorage.setUIntValue(adjustParameterSha3, value.mul(mulValue));
  }

  function getAdjustParameter() public view returns(uint256) {
    uint256 param = eternalStorage.getUIntValue(adjustParameterSha3);
    if(param == 0) { param = 10 ** uint256(tokenContract.decimals()); }
    return param;
  }

  function evaluationConsensus(address sender, uint8 workPoint) private view returns (uint256, uint256) {
    uint256     tokendecimals       = uint256(tokenContract.decimals());
    uint256     reliability         = getReliability(sender) / 10 ** uint256(reliabilityDecimals);
    uint256     adjustParam         = (10 ** tokendecimals) / getAdjustParameter();
    uint256     evaluationPoint     = 0;
    uint256     ownerPoint          = 0;
    uint256     decimalPoint        = 3;

    uint256 fr      = ((reliability + 2) ** 2 - 4) * 10 ** decimalPoint / 14;
    uint256 fw      = uint256(workPoint);
    uint256 v       = fw.mul(fr).div(adjustParam);
    evaluationPoint = v.mul(10 ** (tokendecimals - decimalPoint));

    ownerPoint = evaluationPoint.div(100);

    return (evaluationPoint, ownerPoint);
  }

  function getTotalPoint(address owner) public view returns(uint256) {
    return eternalStorage.getAddrUIntValue(accumulationPointSha3, owner);
  }

  function getPoint(address owner) public view returns(uint256) {
    return tokenContract.balanceOf(owner);
  }

  function getReflectToken(address owner) public view returns(uint256) {
    return eternalStorage.getAddrUIntValue(reflectTokenSha3, owner);
  }

  function CallEvaluatePost(address owner, address sender, uint8 workPoint) public {
    require(owner != sender);

    uint256 senderpoint       = 0;
    uint256 ownerpoint        = 0;
    (senderpoint, ownerpoint) = evaluationConsensus(owner, workPoint);

    uint256 senderToken   = eternalStorage.getAddrUIntValue(tockenSha3, sender);
    uint256 ownerToken    = eternalStorage.getAddrUIntValue(tockenSha3, owner);
    uint256 totalToken    = eternalStorage.getUIntValue(totalSupplySha3);
    senderToken           = senderToken.add(senderpoint);
    ownerToken            = ownerToken.add(ownerpoint);
    totalToken            = totalToken.add(senderpoint).add(ownerpoint);

    eternalStorage.setAddrUIntValue(tockenSha3, sender, senderToken);
    eternalStorage.setAddrUIntValue(tockenSha3, owner , ownerToken);
    eternalStorage.setUIntValue(totalSupplySha3, totalToken);

    emit Transfer(address(0)   , address(this)  , senderToken.add(ownerToken));
    emit Transfer(address(this), sender, senderToken);
    emit Transfer(address(this), owner , ownerToken);

    require(eternalStorage.getAddrUIntValue(tockenSha3, sender) == senderToken);
    require(eternalStorage.getAddrUIntValue(tockenSha3, owner ) == ownerToken);

    uint256 sederTotalPoint  = eternalStorage.getAddrUIntValue(accumulationPointSha3, sender);
    uint256 ownerTotalPoint  = eternalStorage.getAddrUIntValue(accumulationPointSha3, owner);

    sederTotalPoint  = sederTotalPoint.add(senderpoint);
    eternalStorage.setAddrUIntValue(accumulationPointSha3, sender, sederTotalPoint);
    assert(eternalStorage.getAddrUIntValue(accumulationPointSha3, sender) == sederTotalPoint);

    ownerTotalPoint  = ownerTotalPoint.add(ownerpoint);
    eternalStorage.setAddrUIntValue(accumulationPointSha3, owner, ownerTotalPoint);
    assert(eternalStorage.getAddrUIntValue(accumulationPointSha3, owner) == ownerTotalPoint);

  }

  function reflectToken(address sender, uint256 value) onlyOwner public {
    uint256 reflectPoint  = eternalStorage.getAddrUIntValue(reflectTokenSha3, sender);
    uint256 senderpoint   = eternalStorage.getAddrUIntValue(tockenSha3, sender);

    require(senderpoint != 0);
    require(value <= senderpoint);

    eternalStorage.setAddrUIntValue(reflectTokenSha3, sender, reflectPoint.add(value));
    require(eternalStorage.getAddrUIntValue(reflectTokenSha3, sender) == reflectPoint.add(value));

    uint256 subPoint  = eternalStorage.getAddrUIntValue(tockenSha3, sender);
    eternalStorage.setAddrUIntValue(tockenSha3, sender, subPoint.sub(value));

    emit Transfer(sender, sender, value);

    assert(eternalStorage.getAddrUIntValue(tockenSha3, sender) == subPoint.sub(value));
  }

  function _transfer(address _from, address _to, uint _value) private {
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

  function transferToken(address _to, uint256 _value) onlyOwner public {
    _transfer(msg.sender, _to, _value);
    uint256 reflectPoint  = eternalStorage.getAddrUIntValue(reflectTokenSha3, _to);
    eternalStorage.setAddrUIntValue(reflectTokenSha3, _to, reflectPoint.add(_value));
    assert(eternalStorage.getAddrUIntValue(reflectTokenSha3, _to) == reflectPoint.add(_value));
  }
}
