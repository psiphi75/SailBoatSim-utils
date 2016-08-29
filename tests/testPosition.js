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
var Position = require('../Position');

test('Position.crossesLine', function(t) {

    t.plan(5);

    var myPosition = new Position({ latitude: -36.80935463716581, longitude: 174.75070195907324 });
    var myHeading = -60;
    var linePos = new Position({ latitude: -36.80927433216732, longitude: 174.75066030535743 });
    var lineHeading = -170;
    var distLimit = 10;

    t.equal(true, myPosition.crossesLine(myHeading, linePos, lineHeading, distLimit), 'The lines cross');

    distLimit = 5;
    t.equal(false, myPosition.crossesLine(myHeading, linePos, lineHeading, distLimit), 'The distlimit does not reach');

    myPosition = new Position({ latitude: -36.80944653367685, longitude: 174.75081419729484 });
    distLimit = 10;
    t.equal(false, myPosition.crossesLine(myHeading, linePos, lineHeading, distLimit), 'The myPos distlimit still does not reach');

    myPosition = new Position({ latitude: -36.80933396037482, longitude: 174.7506287078221 });
    t.equal(false, myPosition.crossesLine(myHeading, linePos, lineHeading, distLimit), 'Past the line and on the other side (do not reach)');

    myHeading = 120;
    t.equal(true, myPosition.crossesLine(myHeading, linePos, lineHeading, distLimit), 'Past the line and on the other side, but turned around');

    t.end();

});
