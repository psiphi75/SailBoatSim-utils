/*********************************************************************
 *                                                                   *
 *   Copyright 2019 Simon M. Werner                                  *
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

const test = require('tape');
const { getVaneAngle, getOptimumSailAngle } = require('../boatUtil');

test('vane heading test', function(t) {
  t.equal(getVaneAngle(0, 0), 0);
  t.equal(getVaneAngle(-10, 0), -10);
  t.equal(getVaneAngle(10, 0), 10);
  t.equal(getVaneAngle(10, 10), 0);
  t.equal(getVaneAngle(-10, 10), -20);
  t.equal(getVaneAngle(-370, 10), -20);

  t.end();
});

test('Optimal sail angle test', function(t) {
  const SAIL_MAX_ANGLE = 180;
  const SAIL_OFFSET = 10;
  t.equal(getOptimumSailAngle(0, SAIL_MAX_ANGLE, SAIL_OFFSET), 10);
  t.equal(getOptimumSailAngle(-10, SAIL_MAX_ANGLE, SAIL_OFFSET), 0);
  t.equal(getOptimumSailAngle(10, SAIL_MAX_ANGLE, SAIL_OFFSET), 0);
  t.equal(getOptimumSailAngle(20, SAIL_MAX_ANGLE, SAIL_OFFSET), 10);

  t.end();
});
