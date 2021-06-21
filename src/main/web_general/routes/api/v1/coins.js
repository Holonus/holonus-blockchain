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

const express = require('express');
const router = express.Router();

const coinsProcess = require('../../../process/api/v1/coins');
const v1Process = require('../../../process/api/v1');

router.get('/coins/:account', v1Process.useAuthorization, coinsProcess.getCoinsValid, coinsProcess.getCoins);
router.post('/coins/:from/:to/:amount', v1Process.useAuthorization, coinsProcess.postCoinsValid, coinsProcess.postCoins);

module.exports = router;
