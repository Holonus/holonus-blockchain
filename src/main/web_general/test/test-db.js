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

const filesModel = require('../../common/db/files');
const keysModel = require('../../common/db/keys');
const usersModel = require('../../common/db/users');

before(async () => {
    const db = require('../../common/db/dbUtil');

    let url = config.db.url;
    let option = config.db.option;
    let m = db.connect(url, option);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    while (true) {
        await sleep(1000);
        if (m.connection.readyState != m.connection.states.connecting) { break; }
    }
});

after(async () => {
    await keysModel.deleteOne({ userId : '1'});
    await keysModel.deleteOne({ userId : '2'});
    await usersModel.deleteOne({ userId : '2'});
});

describe('[DB] files test', async function () {
    let condition = { isDeleted: { $ne: true } };
    let data1 = { userId: '1', fileName: 'TEST1.png', mimeType: 'image/png', hash: 'e9a92a2ed0d53732ac13b031a27b071814231c8633c9f41844ccba884d482b16' };
    let data2 = { userId: '2', fileName: 'TEST2.png', mimeType: 'image/png', hash: '9ac2197d9258257b1ae8463e4214e4cd0a578bc1517f2415928b91be4283fc48' };

    let data01 = { userId: null, fileName: 'TEST1.png', mimeType: 'image/png', hash: 'e9a92a2ed0d53732ac13b031a27b071814231c8633c9f41844ccba884d482b16' };
    let data02 = { userId: '1', fileName: null, mimeType: 'image/png', hash: 'e9a92a2ed0d53732ac13b031a27b071814231c8633c9f41844ccba884d482b16' };
    let data03 = { userId: '1', fileName: 'TEST1.png', mimeType: null, hash: 'e9a92a2ed0d53732ac13b031a27b071814231c8633c9f41844ccba884d482b16' };
    let data04 = { userId: '1', fileName: 'TEST1.png', mimeType: 'image/png', hash: null };

    it('register files', async function () {
        const result = await filesModel.create([data1]);
        condition._id = result[0]._id;
        assert.isArray(result);
        assert.equal(result.length, 1, 'result length');
        assert.isObject(result[0]);
        console.log(condition._id);
    });
    it('get files', async function () {
        const result = await filesModel.findOne(condition);
        assert.isObject(result);
    });
    it('update files', async function () {
        const result = await filesModel.updateOne(condition, data2);
        assert.equal(result.ok, 1);
    });
    it('delete files', async function () {
        const result = await filesModel.updateOne(condition, { isDeleted: true });
        assert.equal(result.ok, 1);
    });

    it('register files 01 <userId is missing>', async function () {
        try {
            const result = await filesModel.create([data01]);
            assert.fail('validator not working!');
        } catch(e) {
            assert.equal(e.message, 'File create failure in database');
        }
    });
    it('register files 02 <filename is missing>', async function () {
        try {
            const result = await filesModel.create([data02]);
            assert.fail('validator not working!');
        } catch(e) {
            assert.equal(e.message, 'File create failure in database');
        }
    });
    it('register files 03 <mimetype is missing>', async function () {
        try {
            const result = await filesModel.create([data03]);
            assert.fail('validator not working!');
        } catch(e) {
            assert.equal(e.message, 'File create failure in database');
        }
    });
    it('register files 04 <hash is missing>', async function () {
        try {
            const result = await filesModel.create([data04]);
            assert.fail('validator not working!');
        } catch(e) {
            assert.equal(e.message, 'File create failure in database');
        }
    });
});

describe('[DB] keys test', async function () {
    let condition = { isDeleted: { $ne: true } }
    let data1 = { userId: '1' }
    let data2 = { userId: '2' }
    let data01 = { userId: null };
    
    it('register keys', async function () {
        const result = await keysModel.create([data1]);
        condition._id = result[0]._id;
        assert.isArray(result);
        assert.equal(result.length, 1, 'result length');
        assert.isObject(result[0]);
    });
    it('get keys', async function () {
        const result = await keysModel.findOne(condition);
        assert.isNotNull(result);
        assert.isObject(result);
    });
    it('update keys', async function () {
        const result = await keysModel.updateOne(condition, data2);
        assert.equal(result.ok, 1);
    });
    it('delete keys', async function () {
        const result = await keysModel.updateOne(condition, { isDeleted: true });
        assert.equal(result.ok, 1);
    });

    it('register keys 01 <missing userId>', async function () {
        try {
            const result = await keysModel.create([data01]);
            assert.fail('validator not working!');
        } catch(e) {
            assert.equal(e.message, 'Key create failure in database');
        }
    });
});

describe('[DB] users test', async function () {
    let condition = { isDeleted: { $ne: true } }
    let data1 = { userId: '1' }
    let data2 = { userId: '2' }
    let data01 = { userId: null }

    it('register users', async function () {
        const result = await usersModel.create([data1]);
        condition._id = result[0]._id;
        assert.isArray(result);
        assert.equal(result.length, 1, 'result length');
        assert.isObject(result[0]);
    });
    it('get users', async function () {
        const result = await usersModel.findOne(condition);
        assert.isObject(result);
    });
    it('update users', async function () {
        const result = await usersModel.updateOne(condition, data2);
        assert.equal(result.ok, 1);
    });
    it('delete users', async function () {
        const result = await usersModel.updateOne(condition, { isDeleted: true });
        assert.equal(result.ok, 1);
    });

    it('register users 01 <missing userId>', async function () {
        try {
            const result = await usersModel.create([data01]);
            assert.fail('validator not working!');
        } catch(e) {
            assert.equal(e.message, 'User create failure in database');
        }
    });
});
