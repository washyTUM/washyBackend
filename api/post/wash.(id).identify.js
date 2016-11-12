var Method = require('aeolus').Method;
var DB = require('aeolus').DB;
var request = require('request');

var identify = new Method();

var facesDecectURL = "https://api.projectoxford.ai/face/v1.0/detect";
var facesIdentifyURL = "https://api.projectoxford.ai/face/v1.0/identify";

function detect(url, callback) {
    var options = {
        url: facesDecectURL,
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
            callback(body.faceId);
        } else {
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
    if (!machineID || !url) {
        res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    DB.findAll('wash', { room: roomID }, function(machines) {
        var now = (new Date()).getTime();
        machines = machines.map(function(machine) {
            machine.slots = machine.slots.filter(function(x) {
                // TODO: Add some more criteria regarding time left in slot
                return (new Date(x.start)).getTime() <= now && (new Date(x.end)).getTime() >= now;
            });
            return machine;
        }).filter(function(x) { return x.slots.length > 0; });
        if (machines.length > 0) {
            detect(function(face) {
                identify(face, 'students', function(candidates) {
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
