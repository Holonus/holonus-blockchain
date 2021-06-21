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
const request = require('request');
const config = require('config');

const HEADERS = {
    'Authorization': 'Bearer 123123123',
    'Content-Type': 'application/json',
};

const HEADERS_NO_AUTH = {
    'Content-Type': 'application/json',
};

const req = (options) => {
    return new Promise(function (resolve, reject) {
        request(options, function (error, res) {
            if (error) {
                reject(error);
            } else {
                resolve(res);
            }
        });
    });
};

module.exports = (port) => {
    const API_URL = `http://localhost:${port}/api/v1`;

    before(() => {
        try {
            config.stub = true;
            const server = require('../../common/utils/webserver');

            server.listen(config.web, {
                '/api/v1' : require('../routes/api/v1')});
        } catch (err) {
            console.error(err);
        }
    });

    // ------------------------------------------------------------ /healthcheck

    describe('[Web] /isalive request test', async function () {
        it('/isalive {GET} isalive', async function () {
            const res = await req({
                method: 'GET',
                url: `http://localhost:${port}/isalive`,
            });

            assert.strictEqual(res.statusCode, 200, 'status code');
        });
    });

    // ------------------------------------------------------------ /api/v1/files

    describe('[Web] /api/v1/files request test', async function () {
        let fileId = '5fb5cf40f0c1c8218c9092b4';

        it('/files/ {POST} register file', async function () {
            let url = `${API_URL}/files/`;
            const res = await req({
                method: 'POST',
                url: url,
                headers: HEADERS,
                json: {
                    file: {
                        fileName: 'test1.jpg',
                        mimeType: 'image/png',
                        attachement: '1213213215555',
                    },
                },
            });
            assert.strictEqual(res.statusCode, 201, 'status code');
            assert.strictEqual(res.body.success, true, 'success');
            assert.strictEqual(res.body.message, 'created', 'message');
        });

        it('/files/<file ID> {GET} get file', async function () {
            let url = `${API_URL}/files/${fileId}`;
            const res = await req({
                method: 'GET',
                url: url,
                headers: HEADERS,
            });
            assert.strictEqual(res.statusCode, 200, 'status code');
        });

        it('/files/<file ID> {PUT} update file', async function () {
            let url = `${API_URL}/files/${fileId}`;
            const res = await req({
                method: 'PUT',
                url: url,
                headers: HEADERS,
                json: {
                    file: {
                        fileName: 'test2.jpg',
                        mimeType: 'image/png',
                        attachement: '<Base64 encoded (encrypted file)>',
                    },
                },
            });
            assert.strictEqual(res.statusCode, 201, 'status code');
        });

        it('/files/<file ID> {DELETE} delete file', async function () {
            let url = `${API_URL}/files/${fileId}`;
            const res = await req({
                method: 'DELETE',
                url: url,
                headers: HEADERS,
            });
            assert.strictEqual(res.statusCode, 200, 'status code');
        });
    });

    // ------------------------------------------------------------ /api/v1/keys

    describe('[Web] /api/v1/keys request test', async function () {
        let publicKeyId = '5fb5cf40f0c1c8218c9092b4';

        it('/keys {POST} register public key', async function () {
            let url = `${API_URL}/keys`;
            const res = await req({
                method: 'POST',
                url: url,
                headers: HEADERS,
                json: {
                    '01': '01',
                },
            });
            assert.strictEqual(res.statusCode, 201, 'status code');
        });

        it('/keys/<public key ID> {GET} get public key', async function () {
            let url = `${API_URL}/keys/${publicKeyId}`;
            const res = await req({
                method: 'GET',
                url: url,
                headers: HEADERS,
            });
            assert.strictEqual(res.statusCode, 200, 'status code');
        });

        it('/keys/<public key ID> {PUT} update public key', async function () {
            let url = `${API_URL}/keys/${publicKeyId}`;
            const res = await req({
                method: 'PUT',
                url: url,
                headers: HEADERS,
                json: {
                    testUserId_1: 'TEST',
                },
            });
            assert.strictEqual(res.statusCode, 200, 'status code');
        });

        it('/keys/<public key ID> {DELETE} delete public key', async function () {
            let url = `${API_URL}/keys/${publicKeyId}`;
            const res = await req({
                method: 'DELETE',
                url: url,
                headers: HEADERS,
            });
            assert.strictEqual(res.statusCode, 200, 'status code');
        });
    });

    // ------------------------------------------------------------ /api/v1/auth

    describe('[Web] /api/v1/auth request test', async function () {
        let autchorization = 'Bearer 123123123';

        it('/auth/login {POST} login', async function () {
            let url = `${API_URL}/auth/login`;
            const res = await req({
                method: 'POST',
                url: url,
                headers: {
                    'content-type': 'application/json',
                },
                json: {
                    loginId: process.env.loginId || 'someone@example.com',
                    password: process.env.password || 'Password99$',
                },
            });
            assert.strictEqual(res.statusCode, 200, 'status code');
        });

        it('/auth/login {DELETE} logout', async function () {
            let url = `${API_URL}/auth/login`;
            const res = await req({
                method: 'DELETE',
                url: url,
                headers: {
                    'authorization': autchorization,
                    'content-type': 'application/json',
                },
                json: {},
            });
            assert.strictEqual(res.statusCode, 204, 'status code');
        });
    });
};
