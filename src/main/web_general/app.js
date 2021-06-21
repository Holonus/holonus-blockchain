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

const log4js = require('log4js');
const config = require('config');

log4js.configure('./config/log4js.config.json');
const logger = log4js.getLogger();

const common = require('../common/common');

try {
    main();
} catch(e) {
    logger.error(e);
    logger.error('System terminated.');
    process.exit(0);
}

async function main() {
    logger.info('------------------------------------------------------------');
    logger.info('  Holonus Backend System');
    logger.info('  Copyright 2021 by FRPA.');
    logger.info('------------------------------------------------------------');
    logger.debug(`NODE_CONFIG_DIR=[${process.env.NODE_CONFIG_DIR}]`);
    logger.debug(`Configuration name=[${config.ConfigName}]`);

    //
    if (!config.db) {
        throw new Error('Configuration error! Missing \'db\' section.')
    }
    if (!config.web) {
        throw new Error('Configuration error! Missing \'web\' section.')
    }
    if (!config.bc) {
        throw new Error('Configuration error! Missing \'bc\' section.')
    }
    if (!config.ipfs) {
        throw new Error('Configuration error! Missing \'ipfs\' section.')
    }

    //
    if (!config.stub) {
        common.connectToDB();
    }

    // 
    common.checkBlockchain(config, logger);

    //
    await common.checkIPFS(config, logger);

    //
    require('../common/utils/webserver').listen(config.web, {
        '/api/v1' : require('./routes/api/v1')
    });
}
