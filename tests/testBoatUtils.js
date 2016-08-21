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
var boatUtil = require('../boatUtil');

test('Apparent Wind', function(t) {

    t.plan(15);

    var windSpeed = 1;
    var windHeading = 90;
    var boatSpeed = 0;
    var boatHeading = 0;

    t.equal(round(calcAW().heading), -90, 'heading is from left');
    t.equal(round(calcAW().speed), 1, 'is just the wind speed');

    boatHeading = -90;
    t.equal(round(calcAW().heading), 0, 'heading is head on');
    t.equal(round(calcAW().speed), 1, 'is just the wind speed');

    boatSpeed = 1;
    t.equal(round(calcAW().heading), 0, 'heading is still head on');
    t.equal(round(calcAW().speed), 2, 'is double the wind speed');

    windHeading = -45;
    boatHeading = 0;
    boatSpeed = 0;
    t.equal(round(calcAW().heading), 135, 'apparent wind heading is from right rear');
    t.equal(round(calcAW().speed), 1, 'is unit');

    windSpeed = Math.sqrt(2);
    boatSpeed = 1;
    t.equal(round(calcAW().heading), 90, 'apparent wind heading is side on');
    t.equal(round(calcAW().speed), 1, 'is unit');

    windHeading += 83.3;
    boatHeading += 83.3;
    t.equal(round(calcAW().heading), 90, 'adding on degrees just works');
    t.equal(round(calcAW().speed), 1, '... same with speed');

    windHeading -= 179.11;
    boatHeading -= 179.11;
    t.equal(round(calcAW().heading), 90, '... and again for heading');
    t.equal(round(calcAW().speed), 1, '... and again for speed');

    windHeading = 133;
    windSpeed = 1;
    boatHeading = 133;
    boatSpeed = 1;
    t.equal(round(calcAW().speed), 0, 'Vectors in same direction give zero speed');

    t.end();

    function calcAW() {
        return boatUtil.calcApparentWind(windSpeed, windHeading, boatSpeed, boatHeading);
    }

    function round(val) {
        return Math.round(val * 100000) / 100000;
    }

});

test('True Wind', function(t) {

    t.plan(8);

    var windSpeed = 1;
    var windHeading = 90;
    var boatSpeed = Math.random();  // Boat speed does not matter for TW
    var boatHeading = -90;
    t.equal(calcTW().heading, 0, 'head on');
    t.equal(calcTW().speed, windSpeed, 'wind speed doesn\'t change');

    windHeading = -90;
    boatSpeed = Math.random();
    t.equal(calcTW().heading, 180, 'aft wind');

    windHeading = 89;
    boatSpeed = Math.random();
    t.equal(calcTW().heading, -1, 'head on, but just to side');

    windHeading = 0;
    boatSpeed = Math.random();
    t.equal(calcTW().heading, -90, 'from right');

    windHeading = 180;
    boatSpeed = Math.random();
    t.equal(calcTW().heading, 90, 'from left');

    windHeading = -90;
    boatHeading = 45;
    boatSpeed = Math.random();
    t.equal(calcTW().heading, 45, 'from front right');

    windHeading = 90;
    boatHeading = 45;
    boatSpeed = Math.random();
    t.equal(calcTW().heading, -135, 'from back left');

    t.end();

    function calcTW() {
        return boatUtil.calcTrueWind(windSpeed, windHeading, boatSpeed, boatHeading);
    }

});
