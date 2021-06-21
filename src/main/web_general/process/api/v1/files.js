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

const { param, body } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

const messages = require('../../../../common/utils/messageUtil');
const common = require('../../../../common/common');
const filesCore = require('../../../core/api/v1/files');
const v1Process = require('../v1');

module.exports.postFileValid = [body('file').notEmpty(), body('file.fileName').notEmpty(), body('file.mimeType').notEmpty(), body('file.attachement').notEmpty()];

module.exports.postFile = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let data = {
            userId: req.loginUser.userId,
            publicKeyId: req.loginUser.publicKeyId,
            fileName: req.body.file.fileName,
            mimeType: req.body.file.mimeType,
            attachement: req.body.file.attachement,
        };
        let { fileId } = await filesCore.postFile(data);

        let ret = common.generateResponseData(true, 'created', { fileId : fileId });
        res.status(StatusCodes.CREATED).json(ret);

    } catch (err) {
        next(err);
    }
};

module.exports.getFileValid = [param('fileId').notEmpty().isMongoId()];

module.exports.getFile = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let condition = {
            userId: req.loginUser.userId,
            fileId: req.params.fileId,
        };
        let file = await filesCore.getFile(condition);
        let buf = Buffer.from(file.attachement);
        res.setHeader('content-type', 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Headers', 'x-filename,x-mimetype');
        res.setHeader('Access-Control-Expose-Headers', 'x-filename,x-mimetype');
        res.setHeader('x-filename', encodeURI(file.fileName));
        res.setHeader('x-mimetype', file.mimeType);
        res.status(StatusCodes.OK).send(buf);

    } catch (err) {
        next(err);
    }
};

module.exports.putFileValid = [
    param('fileId').notEmpty().isMongoId(),
    body('file.fileName').notEmpty(),
    body('file.mimeType').notEmpty(),
    body('file.attachement').notEmpty(),
];

module.exports.putFile = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let condition = {
            userId: req.loginUser.userId,
            publicKeyId: req.loginUser.publicKeyId,
            fileId: req.params.fileId,
        };

        let data = {
            fileName: req.body.file.fileName,
            mimeType: req.body.file.mimeType,
            attachement: req.body.file.attachement,
        };

        await filesCore.putFile(condition, data);

        let ret = common.generateResponseData(true, 'replaced', {
            fileId : req.params.fileId
        });
        res.status(StatusCodes.CREATED).json(ret);

    } catch (err) {
        next(err);
    }
};

module.exports.deleteFileValid = [param('fileId').notEmpty().isMongoId()];

module.exports.deleteFile = async (req, res, next) => {
    try {
        common.checkInputValue(req);

        let condition = {
            userId: req.loginUser.userId,
            fileId: req.params.fileId,
        };

        await filesCore.deleteFile(condition);

        let ret = common.generateResponseData(true, 'deleted', {
            fileId: req.params.fileId
        });
        res.status(StatusCodes.OK).json(ret);

    } catch (err) {
        next(err);
    }
};
