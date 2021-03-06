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

var util = {
    RADIUS_EARTH: 6371000,
    rand: function(min, max) {
        if (typeof min === 'undefined') min = 0;
        if (typeof max === 'undefined') max = 1;
        return Math.random() * (max - min) + min;
    },
    toRadians: function(deg) { return deg * Math.PI / 180; },
    toDegrees: function(rad) { return rad / Math.PI * 180; },
    defaultFor: function (arg, val) {
        return typeof arg !== 'undefined' ? arg : val;
    },
    createVector: function (len, angle) {
        return {
            x: len * Math.cos(angle),
            y: len * Math.sin(angle)
        };
    },
    angleBetweenLatLongLines: function (line1, line2) {
        var angle1 = Math.atan2(line1[0].latitude - line1[1].latitude, line1[0].longitude - line1[1].longitude);
        var angle2 = Math.atan2(line2[0].latitude - line2[1].latitude, line2[0].longitude - line2[1].longitude);
        return util.toDegrees(angle1 - angle2);
    },
    wrapDegrees: function (deg) {
        while (deg > 180) {
            deg -= 360;
        }
        while (deg < -180) {
            deg += 360;
        }
        return deg;
    },
    isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    assertNumber: function (n, lowerBound, upperBound) {
        if (!util.isNumeric(n)) {
            throw new Error('util.assertNumber() failed');
        }
        if (lowerBound && n < lowerBound) {
            throw new Error('util.assertNumber() number is out of bounds');
        }
        if (upperBound && n > upperBound) {
            throw new Error('util.assertNumber() number is out of bounds');
        }
    },
    /**
     * Calculate the speed in m/s and heading.  Thanks to: http://www.movable-type.co.uk/scripts/latlong.html
     * @param  {number} lat        The old latitude
     * @param  {number} long       The old longitude
     * @param  {number} speed      The speed in m/s
     * @param  {number} heading    The heading in degrees
     * @param  {number} dt_ms      The change in time between the two readings (milliseconds)
     * @return {object}            {latitude, longitude}
     */
    getNextLatLongFromVelocity: function(lat1, long1, speed, heading, dt_ms) {
        var sigma1 = util.toRadians(lat1);
        var lambda1 = util.toRadians(long1);
        var distance = speed * dt_ms / 1000;
        var headingRad = util.toRadians(heading);
        var dRe = distance / util.RADIUS_EARTH;
        var sigma2 = Math.asin(Math.sin(sigma1) * Math.cos(dRe) + Math.cos(sigma1) * Math.sin(dRe) * Math.cos(headingRad));
        var lambda2 = lambda1 + Math.atan2(
                            Math.sin(headingRad) * Math.sin(dRe) * Math.cos(sigma1),
                            Math.cos(dRe) - Math.sin(sigma1) * Math.sin(sigma2)
                        );

        return {
            latitude: util.toDegrees(sigma2),
            longitude: util.toDegrees(lambda2)
        };
    },
    /**
     * Deep copy an object.
     *     credit: http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
     * @param  {object} obj The object to copy
     * @return {object}     The deep copy
     */
    clone: function(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (obj === null || typeof obj !== 'object') return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = util.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = util.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type isn\'t supported.');
    },
    jitter: function (val, jit) {
        return val + util.rand(-jit, jit);
    },
    jitterLatLong: function(val) {
        var mult = 5 / 3 * 1e7; // This is the 1/min value for GPS value.
        var newValue = util.jitter(Math.round(val * mult), 1) / mult;

        // The u-blox randomily throws out some wacky lat/long values, let's do the same .... just for fun
        if (Math.random() < 0.01) {
            newValue += util.rand(-673 / mult, 673 / mult);
        }

        return newValue;
    },

    /**
     * Round a number to dp number of decimal points.
     * @param  {number} val The number to round
     * @param  {number} dp  decimal points (whole number)
     * @return {number}     The rounded number
     */
    round: function (val, dp) {
        if (typeof val !== 'number') {
            return val;
        }
        dp = dp || 5;
        var pow = Math.pow(10, dp);
        return Math.round(val * pow) / pow;
    },

    /**
     * Round {x,y,z} vector values to the dp number of decimal points.
     * @param  {object} v  The object with x,y,z as numbers.
     * @param  {number} dp decimal points (whole number).
     * @return {object}    The rounded x,y,z vector.
     */
    roundVector: function (v, dp) {
        if (typeof v !== 'object') {
            console.error('roundVector(): supplied parameter is not an object', v);
        }
        validateVectorValue('x');
        validateVectorValue('y');
        validateVectorValue('z');

        return {
            x: this.round(v.x, dp),
            y: this.round(v.y, dp),
            z: this.round(v.z, dp)
        };

        function validateVectorValue(dim) {
            if (typeof v[dim] !== 'number') {
                console.error('roundVector(): supplied parameter is not a valid vector.  The ' + dim + ' dimension is invalid.');
            }
        }
    },

    /**
     * Vector to String
     * @param  {object} v The x,y,z vector as an object
     * @return {String}   Numbers as strings separated by tabs.
     */
    vToStr: function (v) {
        if (v && typeof v.x === 'number') {
            return v.x.toString() + '\t' + v.y.toString() + '\t' + v.z.toString();
        } else {
            return v;
        }
    },

    /**
     * Convert a latitude and longitude values to strings
     * @param  {object} v Vector with latitude and longitude.
     * @return {string}   String of latitude and longitude, separated by a tab.
     */
    gpsToStr: function (v) {
        if (v && typeof v.latitude === 'number') {
            return this.round(v.latitude, 5).toString() + '\t' + this.round(v.longitude, 5).toString();
        } else {
            return v;
        }
    },

    /**
     * Calculate the speed in m/s and heading.  Thanks to: http://www.movable-type.co.uk/scripts/latlong.html
     * @param  {number} latitude  [description]
     * @param  {number} longitude [description]
     * @param  {number} latitude  [description]
     * @param  {number} longitude [description]
     * @param  {number} dt_ms     The change in time between the two readings (milliseconds)
     * @return {number}           velocity in m/s
     */
    getVelocityFromDeltaLatLong: function(lat1, long1, lat2, long2, dt_ms) {

        var dLambda = util.toRadians(long2 - long1);
        var Sigma1 = util.toRadians(lat1);
        var Sigma2 = util.toRadians(lat2);
        var sinSigma1 = Math.sin(Sigma1);
        var sinSigma2 = Math.sin(Sigma2);
        var cosSigma1 = Math.cos(Sigma1);
        var cosSigma2 = Math.cos(Sigma2);
        var cosdLambda = Math.cos(dLambda);
        var A = cosSigma2 * cosdLambda;

        // Distance - an approximation, but works for small distances
        var x = dLambda * Math.cos((Sigma1 + Sigma2) / 2);
        var y = (Sigma2 - Sigma1);
        var distance = Math.sqrt(x * x + y * y) * util.RADIUS_EARTH;
        var speed = distance / (dt_ms / 1000);

        // Bearing
        var yy = Math.sin(dLambda) * cosSigma2;
        var xx = cosSigma1 * sinSigma2 - sinSigma1 * A;
        var heading = util.toDegrees(Math.atan2(yy, xx));

        return {
            speed: speed,
            heading: heading
        };
    },
    isValidGPS: function(gps) {
            if (gps === null) return false;
            if (typeof gps !== 'object') return false;
            if (!util.isNumeric(gps.latitude)) return false;
            if (!util.isNumeric(gps.longitude)) return false;
            if (gps.latitude === 0 && gps.longitude === 0) return false;
            return true;
    },
    useLastIfNecessary: function(lastValue) {
        return {
            check: function(currentValue) {
                if (currentValue === null || currentValue === undefined) {
                    return lastValue;
                } else {
                    lastValue = currentValue;
                    return currentValue;
                }
            }
        };
    },
    /**
     * Create GPS output relavent for the WRSC champs
     *           A CSV (comma-separated values) text file with three decimal integer numbers per line
                 representing “hhmmssdd, Lat*107, Lon*107”. For example, the entry
                 September, lat=41.6887091º (north) and lon = -8.8259850º (west) ); 9h of recording
                 “14233407, 416887091, -88259850” means 14h23m34s of day 7 of
                 will need approximately 1MByte of data.

                 The same format as above but using 3 digits for the field representing the seconds,
                 where the third digit (rightmost) represents the decimal part of seconds. For example,
                 the record “142334807, 416887091, -88259850” means 14h23m34.8s of day
                 7 of September, lat=41.6887091º (north) and lon = -8.8259850º (west) ).

     * @param  {[type]} gps [description]
     * @param  {[type]} log [description]
     * @return {[type]}     [description]
     */
    wrscGPSlogger: function(gps) {
        var d = new Date(gps.time);
        var hh = util.zeroPad(d.getUTCHours());
        var mm = util.zeroPad(d.getUTCMinutes());
        var ss = util.zeroPad000(d.getUTCSeconds() * 10 + Math.round(d.getUTCMilliseconds() / 100));
        var dd = util.zeroPad(d.getUTCDate());

        var lat = (gps.latitude * Math.pow(10, 7)).toFixed(0);
        var long = (gps.longitude * Math.pow(10, 7)).toFixed(0);

        return hh + mm + ss + dd + ', ' + lat + ', ' + long;
    },
    zeroPad: function (num) {
        if (!util.isNumeric(num)) return num;
        if (num <= 9) return '0' + num.toString();
        return num.toString();
    },
    zeroPad000: function (num) {
        if (!util.isNumeric(num)) return num;
        if (num <= 9) return '00' + num.toString();
        if (num <= 99) return '0' + num.toString();
        return num.toString();
    }

};

module.exports = util;
