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

'use strict';

var util = require('./util');

//
// This polar chart describes the optimal 'speed' for a given true wind angle with wind of 1 m/s.  It also describes the position of the sail.
// TODO: This is fabricated, we should make a real one.
//
var POLAR_CHART = {
    '0': { 'speedFactor': 0, 'sail': -1 },
    '5': { 'speedFactor': 0.075, 'sail': -1 },
    '10': { 'speedFactor': 0.15, 'sail': -1 },
    '15': { 'speedFactor': 0.23, 'sail': -1 },
    '20': { 'speedFactor': 0.30, 'sail': -1 },
    '25': { 'speedFactor': 0.37, 'sail': -0.8 },
    '30': { 'speedFactor': 0.44, 'sail': -0.7 },
    '35': { 'speedFactor': 0.47, 'sail': -0.6 },
    '40': { 'speedFactor': 0.49, 'sail': -0.5 },
    '45': { 'speedFactor': 0.52, 'sail': -0.4 },
    '50': { 'speedFactor': 0.54, 'sail': -0.3 },
    '55': { 'speedFactor': 0.57, 'sail': 0.1 },
    '60': { 'speedFactor': 0.59, 'sail': 0.1 },
    '65': { 'speedFactor': 0.62, 'sail': 0.5 },
    '70': { 'speedFactor': 0.64, 'sail': 0.5 },
    '75': { 'speedFactor': 0.67, 'sail': 0.5 },
    '80': { 'speedFactor': 0.69, 'sail': 0.5 },
    '85': { 'speedFactor': 0.72, 'sail': 0.5 },
    '90': { 'speedFactor': 0.74, 'sail': 0.5 },
    '95': { 'speedFactor': 0.77, 'sail': 0.5 },
    '100': { 'speedFactor': 0.79, 'sail': 0.5 },
    '105': { 'speedFactor': 0.82, 'sail': 0.5 },
    '110': { 'speedFactor': 0.84, 'sail': 0.6 },
    '115': { 'speedFactor': 0.853, 'sail': 0.6 },
    '120': { 'speedFactor': 0.865, 'sail': 0.6 },
    '125': { 'speedFactor': 0.87, 'sail': 0.6 },
    '130': { 'speedFactor': 0.875, 'sail': 0.6 },
    '135': { 'speedFactor': 0.879, 'sail': 0.6 },
    '140': { 'speedFactor': 0.883, 'sail': 0.63 },
    '145': { 'speedFactor': 0.887, 'sail': 0.7 },
    '150': { 'speedFactor': 0.891, 'sail': 0.77 },
    '155': { 'speedFactor': 0.894, 'sail': 0.85 },
    '160': { 'speedFactor': 0.896, 'sail': 0.9 },
    '165': { 'speedFactor': 0.897, 'sail': 0.95 },
    '170': { 'speedFactor': 0.901, 'sail': 1 },
    '175': { 'speedFactor': 0.901, 'sail': 1 },
    '180': { 'speedFactor': 0.901, 'sail': 1 }
};
console.log('BOAT_PROPERTIES: t0-v2');


/**
 * Supplement the polar chart with VMG (velocity made good) data.
 */
(function() {  // eslint-disable-line wrap-iife
    for (var twAngle in POLAR_CHART) {
        var data = POLAR_CHART[twAngle];
        var radians = util.toRadians(parseFloat(twAngle));
        var vmg = data.speedFactor * Math.cos(radians);
        data.vmgSpeed = util.round(vmg, 3);
    }
})();

var fn = {

    getPolarData: function(twAngle) {
        twAngle = util.wrapDegrees(twAngle);
        twAngle = Math.abs(twAngle);
        twAngle = Math.round(twAngle / 5) * 5;
        var data = POLAR_CHART[twAngle];
        return data;
    },

    findOptimalApparentForeWindAngle: function() {
        var maxSpeedAngle = 0;
        for (var twAngle in POLAR_CHART) {
            var data = POLAR_CHART[twAngle];
            if (POLAR_CHART[maxSpeedAngle].vmgSpeed < data.vmgSpeed) {
                maxSpeedAngle = twAngle;
            }
        }
        return parseFloat(maxSpeedAngle);
    },

    findOptimalApparentAftWindAngle: function() {
        var minSpeedAngle = 0;
        for (var twAngle in POLAR_CHART) {
            var data = POLAR_CHART[twAngle];
            if (POLAR_CHART[minSpeedAngle].vmgSpeed > data.vmgSpeed) {
                minSpeedAngle = twAngle;
            }
        }
        return parseFloat(minSpeedAngle);
    },

    getSpeed: function(twSpeed, twAngle, sail) {
        var data = fn.getPolarData(twAngle);

        if (!util.isNumeric(sail)) {
            // Simply get the speed - assume sail is in ideal position
            return twSpeed * data.speedFactor;
        } else {
            // Reduce the ideal speed based on the deviation from ideal because the sail is not ideal
            var sailPerformance = 1 - Math.abs(sail - data.sail) / 2;
            var adjustedSpeed = twSpeed * sailPerformance * data.speedFactor;
            return adjustedSpeed;
        }

    }

};

module.exports = fn;
