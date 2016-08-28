'use strict';

var Position = require('./Position');

function WaypointManager(wpArray) {
    this.waypoints = wpArray.map(function(wp, i) {
        var thisWp = new Waypoint(wp);
        thisWp.number = (i + 1).toString();
        return thisWp;
    });

    //
    // Calc the average
    //
    this.averageWaypoint = this.waypoints.reduce(function(a, b) {
        return {
            latitude: a.latitude + b.latitude,
            longitude: a.longitude + b.longitude
        };
    });
    this.averageWaypoint.latitude /= this.waypoints.length;
    this.averageWaypoint.longitude /= this.waypoints.length;

    //
    // Calc the direction of the waypoints (clockwise or anti-clockwise)
    //
    this.isClockwise = (function(wpList) {
        var sumPoints = 0;
        var wp1 = wpList[0];
        wpList.forEach(function(wp2, i) {
            if (i === 0) return;
            sumPoints += (wp2.longitude - wp1.longitude) * (wp2.latitude + wp1.latitude);
            wp1 = wp2;
        });
        var isClockwise = (sumPoints > 0);
        return isClockwise;
    }(this.waypoints));

    //
    // Calculate for each waypoint the cummulative distance of the course
    //
    var prevWp = this.waypoints[0];
    var courseDist = 0;
    var finishWp = this.waypoints[this.waypoints.length - 1];
    this.waypoints.forEach(function(wp) {
        courseDist += wp.distanceHeadingTo(prevWp).distance;
        wp.courseDist = courseDist;
        wp.distToFinish = wp.distanceHeadingTo(finishWp).distance;
        prevWp = wp;
    });

    // Find the first active waypoint
    this.nextActiveWaypoint();
}


/**
 * Move to the next waypoint, in sequential order.  Mark the current waypoint as achieved.
 * @return {Position} pos The new current waypoint.
 */
WaypointManager.prototype.next = function (pos) {
    this.waypoints[this.current].achieved = true;
    this.nextActiveWaypoint();
    return this.getStatus(pos);
};

WaypointManager.prototype.nextActiveWaypoint = function () {
    if (this.current === undefined) this.current = 0;
    var self = this;

    var length = this.waypoints.length;
    for (var i = 0; i < length; i += 1) {
        if (i >= self.current && this.waypoints[i].achieved !== true) {
            break;
        }
    }
    this.current = i;

    // If all waypoints are achieved, then we restart the course
    if (this.current === length) {
        this.waypoints.forEach(function (wp) {
            wp.achieved = false;
        });
    }
};

/**
 * Move to the next closed waypoint.  Mark the current waypoint as achieved.
 * @return {Position} pos The new current waypoint.
 */
WaypointManager.prototype.nextClosest = function (pos) {
    this.waypoints[this.current].achieved = true;
    var minDist = this.waypoints.reduce(function (min, wp, i) {
        var d = wp.distanceHeadingTo(pos);
        if (d < min.distance) {
            return {
                distance: d,
                i: i
            };
        } else {
            return min;
        }
    }, {distance: Infinity, i: -1});
    this.current = minDist.i;
    return this.getStatus(pos);
};
/**
 * Get the distance and heading to the current waypoint.
 * @param {Position} pos the Position to calculate from.
 * @return {object} {distance, heading}
 */
WaypointManager.prototype.getStatus = function (pos) {
    var currentWP = this.getCurrent();
    var result = pos.distanceHeadingTo(currentWP);
    result.achieved = (result.distance < currentWP.radius);
    result.radius = currentWP.radius;
    return result;
};
WaypointManager.prototype.getCurrent = function () {
    if (this.current >= this.waypoints.length) this.current = 0;
    return this.waypoints[this.current];
};
WaypointManager.prototype.getPrevious = function () {
    var prev = this.current - 1;
    if (prev < 0) {
        prev = this.waypoints.length - 1;
    }
    return this.waypoints[prev];
};
WaypointManager.prototype.peekNext = function () {
    var next = (this.current + 1) % this.waypoints.length;
    return this.waypoints[next];
};
/**
 * Cycle through all the waypoints until we get to the nth waypoint.
 * @param  {number} n
 * @param  {Position} pos The Position
 * @return {object}     The same as WaypointManager.next();
 */
WaypointManager.prototype.gotoNth = function (n, pos) {
    if (n < 0) {
        n = this.waypoints.length + n;
    }
    do {
        this.next(pos);
    } while (this.current < n);
    return this.getStatus(pos);
};

/**
 * Get the state of the waypoints as an array.
 * @param  {[type]} n   [description]
 * @param  {[type]} pos [description]
 * @return {[type]}     [description]
 */
WaypointManager.prototype.getState = function () {
    var wpsState = this.waypoints.map(function(wp) { return wp.achieved; });
    return wpsState;
};

/**
 * Return the average of the waypoints.  Useful to know the center of the course.
 * @return {Waypoint}
 */
WaypointManager.prototype.getAverage = function () {
    return this.averageWaypoint;
};

module.exports = WaypointManager;


function Waypoint(coord) {
    Position.call(this, coord);
    this.achieved = coord.achieved;
    this.type = coord.type;
    this.radius = coord.radius;
}
// subclass extends superclass
Waypoint.prototype = Object.create(Position.prototype);
Waypoint.prototype.constructor = Waypoint;
