var Method = require('aeolus').Method;
var DB = require('aeolus').DB;
var request = require('request');

var identify = new Method();

var facesDetectURL = "https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false";
var facesIdentifyURL = "https://api.projectoxford.ai/face/v1.0/identify";

function detect(url, callback) {
    var options = {
        url: facesDetectURL,
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "e16d3ed01c1243099ed866638c17d79d"
        },
        json: true,
        body: {
            url: url
        }
    };
    request(options, function(err, httpRES, body) {
        if (!err || err === null) {
            if (body.length > 0) {
                callback(body[0].faceId);
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
}

function identifyAPI(face, groupID, callback) {
    var options = {
        url: facesIdentifyURL,
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "e16d3ed01c1243099ed866638c17d79d"
        },
        json: true,
        body: {
            personGroupId: groupID,
            faceIds: [face]
        }
    };
    request(options, function(err, httpRES, body) {
        if (!err || err === null) {
            if (body.length > 0) {
                var candidates = body[0].candidates;
                callback(candidates);
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
}

function getMachine(machines, candidates) {
    for (var i = 0; i < machines.length; i++) {
        var slot = machines[i].slots[0];
        var withSameID = candidates.filter(function(x) {
            return x.personId === slot.person;
        });
        if (withSameID.length > 0) {
            return machines[i];
        }
    }
}

identify.handle(function (req, res) {
    var roomID = req.getParameter('id');
    var url = req.getParameter('url');
    if (!roomID || !url) {
        res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    DB.findAll('machines', { room: roomID }, function(machines) {
        var now = (new Date()).getTime();
        machines = machines.map(function(machine) {
            machine.slots = machine.slots.filter(function(x) {
                var startDate = new Date(x.start);
                var endDate = new Date(x.end);
                var startTimeStamp = startDate.getTime();
                var endTimeStamp = endDate.getTime();
                var didStart = startTimeStamp <= now;
                var notEnded = endTimeStamp >= now;
                return (didStart && notEnded);
            });
            return machine;
        }).filter(function(x) { return x.slots.length > 0; });
        if (machines.length > 0) {
            detect(url, function(face) {
                console.log(face);
                if (face === null) {
                    res.respondJSON("no-face");
                    return;
                }
                identifyAPI(face, 'students', function(candidates) {
                    if (candidates === null) {
                        res.respondPlainText('no-candidate');
                        return;
                    }
                    var machine = getMachine(machines, candidates);
                    if (machine) {
                        DB.find('users', { oxfordID: machine.person }, function(user) {
                            res.respondPlainText(user.name);
                        }, function() {
                            res.respondPlainText('user-not-available');
                        });
                    } else {
                        res.respondPlainText("not-available");
                    }
                });
            }, function() {
                res.respondPlainText("no-face");
            });
        } else {
            res.respondPlainText("not-available");
        }
    });
});

module.exports = identify;
