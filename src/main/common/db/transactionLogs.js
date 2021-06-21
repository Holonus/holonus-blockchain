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

const mongoose = require('mongoose');

const transactionLogs = mongoose.Schema({
    blockHash: String,
    blockNumber: Number,
    contractAddress: String,
    cumulativeGasUsed: Number,
    from: String,
    gasUsed: Number,
    logsBloom: String,
    status: Boolean,
    to: String,
    transactionHash: String,
    transactionIndex: Number,
    events: Object,
    insertDate: { type: Date, default: Date.now() },
});

module.exports = mongoose.model('transactionLogs', transactionLogs);
