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

var fn = {
  /**
   * Calculate the apparent wind, relative to the boat.  Where the bow of the boat is the front/forward.
   * @param  {number} windSpeed   - The speed of the wind (in any units).
   * @param  {number} windHeading - The way the wind is going, in degrees, relative to north. // http://www.windspeed.co.uk/ws/index.php?option=faq&task=viewfaq&Itemid=5&artid=17
   * @param  {number} boatSpeed   - The speed of the boat (in same units as windSpeed).
   * @param  {number} boatHeading - The heading of the boat, in degrees, relative to north.
   * @returns {Object}            - {heading, headingToBoat, speed}.
   */
  calcApparentWind: function(windSpeed, windHeading, boatSpeed, boatHeading) {
    var trueWind = this.calcTrueWind(
      windSpeed,
      windHeading,
      boatSpeed,
      boatHeading
    );
    var trueWindHeading = trueWind.heading + 180;

    var trueWindVec = util.createVector(
      windSpeed,
      -util.toRadians(trueWindHeading)
    );
    var boatVec = util.createVector(-boatSpeed, 0);

    // The ApparentWind vector - relative to boat
    var x = boatVec.x + trueWindVec.x;
    var y = boatVec.y + trueWindVec.y;

    var awHeadingToBoat = util.wrapDegrees(
      180 + util.toDegrees(-Math.atan2(y, x))
    );
    var awSpeed = Math.sqrt(x * x + y * y);
    var awHeadingToNorth = util.wrapDegrees(
      180 + boatHeading + awHeadingToBoat
    );

    return {
      headingToNorth: awHeadingToNorth,
      heading: awHeadingToBoat,
      speed: awSpeed
    };
  },

  calcTrueWind: function(windSpeed, windHeading, boatSpeed, boatHeading) {
    var windDirection = util.wrapDegrees(windHeading - 180);
    var twHeadingBoat = util.wrapDegrees(windDirection - boatHeading);
    return {
      heading: twHeadingBoat,
      speed: windSpeed
    };
  },

  calcNextPosition: function(
    oldLat,
    oldLong,
    newSpeed,
    newHeading,
    drift,
    time
  ) {
    var newPos;
    newPos = util.getNextLatLongFromVelocity(
      oldLat,
      oldLong,
      newSpeed,
      newHeading,
      time.delta
    );
    newPos = util.getNextLatLongFromVelocity(
      newPos.latitude,
      newPos.longitude,
      drift.wind.speed,
      drift.wind.headingToNorth,
      time.delta
    );
    newPos = util.getNextLatLongFromVelocity(
      newPos.latitude,
      newPos.longitude,
      drift.water.speed,
      drift.water.headingToNorth,
      time.delta
    );
    var velocity = util.getVelocityFromDeltaLatLong(
      oldLat,
      oldLong,
      newPos.latitude,
      newPos.longitude
    );
    newPos.direction = velocity.heading;
    return newPos;
  },
  calcVMG: function(trueWind, boatVelocity) {
    var theta = util.toRadians(trueWind.heading);
    return boatVelocity.speed * Math.cos(theta);
  },

  /**
   * Get the angle of the vane relative to the boat.  The vane points into the direction
   * of the wind.
   *
   * @param {number} vaneHeading - The absolute heading of the vane.
   * @param {number} lastBoatHeading - The absolute heading of the boat.
   * @returns {number} - The direction the vane is pointing, relative to the boat.
   */
  getVaneAngle: function(vaneHeading, lastBoatHeading) {
    return util.wrapDegrees(vaneHeading - lastBoatHeading);
  },

  /**
   * Get the optimum angle for the sail.
   *
   * @param {number} vaneAngle - The direction of the vane relative to the boat.
   * @param {number} SAIL_MAX_ANGLE - Maximum sail angle.
   * @param {number} SAIL_OFFSET - How many degrees the sail should be offset to the wind.
   * @returns {number} - The sail angle.
   */
  getOptimumSailAngle: function(vaneAngle, SAIL_MAX_ANGLE, SAIL_OFFSET) {
    if (vaneAngle > 0) {
      return Math.min(SAIL_MAX_ANGLE, vaneAngle - SAIL_OFFSET);
    } else {
      return Math.max(-SAIL_MAX_ANGLE, vaneAngle + SAIL_OFFSET);
    }
  }
};

module.exports = fn;
