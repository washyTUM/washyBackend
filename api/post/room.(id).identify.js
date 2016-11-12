var Method = require('aeolus').Method;
var DB = require('aeolus').DB;
var request = require('request');

var identify = new Method();

var facesDetectURL = "https://api.projectoxford.ai/face/v1.0/detect";
var facesIdentifyURL = "https://api.projectoxford.ai/face/v1.0/identify";

function detect(url, callback) {
    var options = {
        url: facesDetectURL,
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "e16d3ed01c1243099ed866638c17d79d"
        },
        json: true,
        body: {
            url: url
        }
    };
    console.log(options);
    request(options, function(err, httpRES, body) {
        if (!err || err === null) {
            console.log(body);
            callback(body.faceId);
        } else {
            console.log(err);
            callback(null);
        }
    });
}

function identify(face, groupID, callback) {
    var options = {
        url: facesIdentifyURL,
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
            if (body.lenght > 0) {
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
        console.log(new Date());
        console.log(now);
        console.log(machines);
        machines = machines.map(function(machine) {
            machine.slots = machine.slots.filter(function(x) {
                // TODO: Add some more criteria regarding time left in slot
                // console.log(x);
                // console.log(new Date(x.start));
                // console.log(new Date(x.end));


                var startDate = new Date(x.start);
                var endDate = new Date(x.end);

                console.log(startDate);
                console.log(endDate);

                var startTimeStamp = startDate.getTime();
                var endTimeStamp = endDate.getTime();

                var didStart = startTimeStamp <= now;
                var notEnded = endTimeStamp >= now;

                console.log(didStart);
                console.log(notEnded);

                return (didStart && notEnded);
            });
            console.log(machine);
            return machine;
        }).filter(function(x) { return x.slots.length > 0; });
        if (machines.length > 0) {
            console.log("Machines are reserved");
            console.log(machines);
            detect(function(face) {
                console.log(face);
                identify(face, 'students', function(candidates) {
                    console.log(candidates);
                    var machine = getMachine(machines, candidates);
                    if (machine) {
                        res.respondJSON(true);
                        // TODO: Send message through IoT
                    } else {
                        res.respondJSON(false);
                    }
                });
            }, function() {
                res.respondJSON(false);
            });
        } else {
            res.respondJSON(false);
        }
    });
});

module.exports = identify;
