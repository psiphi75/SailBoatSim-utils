/*********************************************************************
 *                                                                   *
 *   Copyright 2016 Simon M. Werner                                  *
 *                                                                   *
 *   Licensed to the Apache Software Foundation (ASF) under one      *
 *   or more contributor license agreements.  See the NOTICE file    *
 *   distributed with this work for additional information           *
 *   regarding copyright ownership.  The ASF licenses this file      *
 *   to you under the Apache License, Version 2.0 (the               *
 *   "License"); you may not use this file except in compliance      *
 *   with the License.  You may obtain a copy of the License at      *
 *                                                                   *
 *      http://www.apache.org/licenses/LICENSE-2.0                   *
 *                                                                   *
 *   Unless required by applicable law or agreed to in writing,      *
 *   software distributed under the License is distributed on an     *
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY          *
 *   KIND, either express or implied.  See the License for the       *
 *   specific language governing permissions and limitations         *
 *   under the License.                                              *
 *                                                                   *
 *********************************************************************/

var test = require('tape');
var util = require('../util');

test('WRSC GPS logging', function(t) {

    t.plan(2);

    // Tue Aug 23 2016 17:28:06 GMT+1200 (NZST)
    var gps = {
        time: 1471930086600,
        latitude: -36.809255,
        longitude: 174.75038666666666,
        altitude: -38.6,
        quality: 'dgps-fix',
        hdop: 0.89,
        sameCounter: 191
    };

    t.equal(util.wrscGPSlogger(gps), '17280623,-368092550,1747503867');

    gps.time = 1471930080600 - 28 * 60 * 1000;
    t.equal(util.wrscGPSlogger(gps), '17000023,-368092550,1747503867');

    t.end();

});
