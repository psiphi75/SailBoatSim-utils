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
var StateManager = require('../contests/StateManager');

test('Create State', function(t) {

    t.plan(7);

    var sm = new StateManager();
    sm.get(function(err, state) {
        t.equal(state.length, 0, 'no state to begin with');
        testState(sm, t, []);
    });

    sm.save([true, true, false, true]);

    setTimeout(function() {
        testState(sm, t, [true, true, undefined, true]);
    }, 200);

});


test('Clear State', function(t) {

    var sm = new StateManager();

    t.plan(6);

    //
    // Clear one state item
    //
    sm.clearState(1);
    setTimeout(function() {
        testState(sm, t, [true, undefined, undefined, true]);

        //
        // Clear all state items
        //
        sm.clearAll();
        setTimeout(function() {
            testState(sm, t, []);
        }, 200);

    }, 200);

});


function testState(sm, t, expectedState) {
    sm.get(function(err, stateList) {
        t.equal(stateList.length, expectedState.length, 'number of state items is the same');
        expectedState.forEach(function(s, i) {
            t.equal(stateList[i], expectedState[i], 'individual state is the same: ' + i);
        });
    });
}
