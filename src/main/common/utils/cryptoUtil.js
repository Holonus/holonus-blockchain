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

const NodeRSA = require('node-rsa');
const fs = require('fs');

exports.generateKeyPair = function(bits = 1024) {
    const key = new NodeRSA({ b: bits });

    var priv = key.exportKey('pkcs1-private-der');
    var pub = key.exportKey('pkcs1-public-der');

    return { public: pub, private: priv };
};

exports.der2pem = function(scheme, key) {
    var der = Buffer.from(key);
    const rsa = new NodeRSA(der, scheme + '-der');
    return rsa.exportKey(scheme + '-pem');
};

exports.pem2der = function(scheme, pem) {
    const rsa = new NodeRSA(pem, scheme + '-pem');
    return rsa.exportKey(scheme + '-der');
};

exports.der2der = function(key, src_scheme, dest_scheme) {
    var der = Buffer.from(key);
    const rsa = new NodeRSA(der, src_scheme + '-der');
    return rsa.exportKey(dest_scheme + '-der');
};

exports.encrypt = function(publicKey, buffer) {
    var input = Buffer.from(buffer);
    var der = Buffer.from(publicKey);
    const rsa = new NodeRSA(der, 'pkcs1-public-der', { encryptionScheme: 'pkcs1_oaep' });
    var enc = rsa.encrypt(input);
    return enc;
};

exports.decrypt = function(privateKey, buffer) {
    var input = Buffer.from(buffer);
    var der = Buffer.from(privateKey);
    const rsa = new NodeRSA(der, 'pkcs1-private-der', { encryptionScheme: 'pkcs1_oaep' });
    var dec = rsa.decrypt(input);
    return dec;
};

exports.sign = function(privateKey, buffer) {
    var input = Buffer.from(buffer);
    var der = Buffer.from(privateKey);
    const rsa = new NodeRSA(der, 'pkcs1-private-der');
    var sig = rsa.sign(input);
    return sig;
};

exports.verify = function(publicKey, buffer, signature) {
    var input = Buffer.from(buffer);
    var der = Buffer.from(publicKey);
    var sig = Buffer.from(signature)
    const rsa = new NodeRSA(der, 'pkcs1-public-der');
    var result = rsa.verify(input, sig);
    return result;
};

exports.encryptFile = function(pemPublicKey, filepathFrom, filepathTo) {
    var derPublicKey = this.pem2der('pkcs1-public', pemPublicKey);
    var data = fs.readFileSync(filepathFrom);
    var encryptedData = this.encrypt(derPublicKey, data);
    fs.writeFileSync(filepathTo, encryptedData);
};

exports.decryptFile = function(pemPrivateKey, filepathFrom, filepathTo) {
    var derPrivateKey = this.pem2der('pkcs1-private', pemPrivateKey);
    var data = fs.readFileSync(filepathFrom);
    var encryptedData = this.decrypt(derPrivateKey, data);
    fs.writeFileSync(filepathTo, encryptedData);
};
