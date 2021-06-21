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

const chai = require('chai');
const assert = chai.assert;

const ipfsUtil = require('../../common/utils/ipfsUtil')

describe('[IPFS] test', async function () { 
    let sendData = 'ABCDEFG';
    let hash;

    it('regsiter file', async function () {
        hash = await ipfsUtil.add(sendData);
        assert.isOk(hash)
    });
    
    it('get file', async function () {
        let data = await ipfsUtil.cat(hash);
        assert.isNotNull(data);
    });
});
