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

const ipfsClient = require('ipfs-http-client');

const boom = require('@hapi/boom');
const config = require('config');
const log4js = require('log4js');

const ipfs = ipfsClient(config.ipfs.url);
const messages = require('./messageUtil');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger();
const ipfsLogger = log4js.getLogger('ipfs');

module.exports.getIpfsObject = () => {
    return ipfs;
};

module.exports.get = async (cid) => {
    try {
        let files = await ipfs.get(cid, { timeout: 10000 });
        let data = '';
        for await (let file of files) {
            let chunks = [];
            for await (let c of file.content) {
                chunks.push(c);
            }
            data += Buffer.concat(chunks).toString();
        }
        ipfsLogger.info('ipfs.get', cid, data);
        return data;
    } catch (err) {
        if (err.name == 'TimeoutError') {
            throw boom.notFound(messages.error.ipfs.file.notfoundError);
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.ipfs.file.getError);
    }
};

module.exports.cat = async (cid) => {
    try {
        let result = [];
        for await (const chunk of ipfs.cat(cid)) {
            result.push(chunk);
        }

        let data = [];
        for(let i = 0; i < result.length; i++) {
            for(let j = 0; j < result[i].length; j++) {
                data.push(result[i][j]);
            }
        }

        ipfsLogger.info('ipfs.get', cid, data);
        return data;
    } catch (err) {
        if (err.name == 'TimeoutError') {
            throw boom.notFound(messages.error.ipfs.file.notfoundError);
        }
        logger.error(err);
        throw boom.notAcceptable(messages.error.ipfs.file.getError);
    }
};

module.exports.add = async (data) => {
    try {
        let ipfsfileInfo = await ipfs.add(data);
        ipfsLogger.info('ipfs.add', data, ipfsfileInfo);
        return ipfsfileInfo.cid;
    } catch (err) {
        logger.error(err);
        throw boom.notAcceptable(messages.error.ipfs.file.addError);
    }
};
