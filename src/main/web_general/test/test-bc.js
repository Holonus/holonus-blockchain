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
const config = require('config');

const holonusFileService = require('../../common/bc/holonusFileService');

before(async () => {
    const dbUtil = require('../../common/db/dbUtil');

    let url = config.db.url;
    let option = config.db.option;
    let m = dbUtil.connect(url, option);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    while (true) {
        await sleep(1000);
        if (m.connection.readyState != m.connection.states.connecting) { break; }
    }
});

describe('[BC] files test', async function () {
    let data = {
        fileId: '5fb6107d03efb94058e676eb',
        hash: '9ac2197d9258257b1ae8463e4214e4cd0a578bc1517f2415928b91be4283fc48'
    }

    it('register file', async function () {
        await holonusFileService.setFile(data);
    });

    it('get file', async function () {
        let result = await holonusFileService.getFile(data);
        assert.equal(result.fileId, data.fileId)
        assert.equal(result.hash, data.hash)
    });
});

describe('[BC] public key test', async function () {
    let data = {
        publicKeyId: '5fb6107d03efb94058e676eb',
        publicKey: '9ac2197d9258257b1ae8463e4214e4cd0a578bc1517f2415928b91be4283fc48'
    }

    it('register public key', async function () {
        await holonusFileService.setKey(data);
    });

    it('get public key', async function () {
        let result = await holonusFileService.getKey(data);
        assert.equal(result.publicKeyId, data.publicKeyId)
        assert.equal(result.publicKey, data.publicKey)
    });
});
