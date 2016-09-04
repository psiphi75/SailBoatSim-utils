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

var fs = require('fs');
var util = require('./util');

function StateManager(name) {

    this.stateFolder = __dirname + '/state/' + name;

    if (!fs.existsSync(this.stateFolder)){
        fs.mkdirSync(this.stateFolder);
    }

}

StateManager.prototype.save = function(newStateList) {
    var self = this;
    this.get(function(err, oldStateList) {
        newStateList.forEach(function(newState, i) {
            if (newState === true && oldStateList[i] !== true) {
                self.saveState(i);
            }
        });

        // Find those which have been removed
        oldStateList.forEach(function(oldState, i) {
            if (oldState === true && newStateList[i] !== true) {
                // State is now false state
                self.clearState(i);
            }
        });

    });
};


StateManager.prototype.get = function(callback) {
    fs.readdir(this.stateFolder, function(err, items) {
        if (err) {
            console.error('StateManager.get(): ERROR: ', err);
            callback(err);
        } else {
            var stateList = [];
            items.forEach(function(state) {
                if (util.isNumeric(state)) {
                    stateList[state] = true;
                }
            });
            callback(null, stateList);
        }
    });
};

StateManager.prototype.clearAll = function() {
    var self = this;
    this.get(function(err, stateFiles) {
        if (!err) {
            stateFiles.forEach(function (state, i) {
                if (state === true) {
                    self.clearState(i);
                }
            });
        }
    });
};

StateManager.prototype.clearState = function(i) {

    fs.unlink(this.getStateFilename(i), function(err) {
        if (err) {
            console.error('StateManager.clearState(): ERROR: ', err);
        }
    });

};

StateManager.prototype.saveState = function(i) {

    // Save state
    fs.appendFile(this.getStateFilename(i), '', function (err) {
        if (err) {
            console.error('StateManager.save(): ERROR: ', err);
        }
    });

};

StateManager.prototype.getStateFilename = function(i) {
    var filename = i.toString();
    return this.stateFolder + '/' + filename;
};

module.exports = StateManager;
