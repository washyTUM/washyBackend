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

identify.handle(function (req, res) {
    var machineID = req.getParameter('id');
    var url = req.getParameter('url');
    if (!machineID || !url) {
        res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    DB.find('wash', { _id: machineID }, function(machine) {
        var now = (new Date()).getTime();
        var slots = machine.slots.filter(function(x) {
            // TODO: Add some more criteria regarding time left in slot
            return (new Date(x.start)).getTime() <= now && (new Date(x.end)).getTime() >= now;
        });
        if (slots.length > 0) {
            var id = slots[0].user.oxfordID;
            detect(function(face) {
                identify(face, 'students', function(candidates) {
                    var withSameID = candidates.filter(function(x) { return x.personId == id; });
                    if (withSameID.length > 0) {
                        res.respondJSON(true);
                        // TODO: Send message through IoT
                    } else {
                        res.respondJSON(false);
                    }
                });
            });
        } else {
            res.respondJSON(false);
        }
    });
});

module.exports = identify;
