var Method = require('aeolus').Method;
var DB = require('aeolus').DB;
var request = require('request');

var add = new Method();

function facesURL(groupID, personId) {
    return "https://api.projectoxford.ai/face/v1.0/persongroups/" + groupID + "/persons/" + personId + "/persistedFaces";
}

function facesTrainURL(gropudID) {
    return "https://api.projectoxford.ai/face/v1.0/persongroups/" + gropudID + "/train";
}

function doTrain() {
    var options = {
        url: facesTrainURL('students'),
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "e16d3ed01c1243099ed866638c17d79d"
        }
    };
    request(options, function(err, httpRES, body) {});
}

add.handle(function (req, res) {
    var query;
    var facebookID = req.getParameter('facebook');
    var telegramID = req.getParameter('telegram');
    var emulatorID = req.getParameter('emulator');
    var number = req.getParameter('number');
    if (facebookID) {
        query = { facebookID: facebookID };
    } else if (telegramID) {
        query = { telegramID: telegramID };
    } else if (emulatorID) {
        query = { emulatorID: emulatorID };
    } else if (number) {
        query = { number: number };
    }
    var url = req.getParameter('url');
    if (!query || !url) {
        res.respondPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    DB.find('users', query, function(user) {
        var id = user.oxfordID;
        var options = {
            url: facesURL('students', id),
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
        console.log(options);
        request(options, function(err, httpRES, body) {
            if (!err || err === null) {
                console.log(body);
                doTrain();
                res.respondPlainText("Succesfully added pic. Nice...");
            } else {
                res.respondPlainText(err.toString(), 501);
            }
        });
    }, function(err) {
        res.respondPlainText(err, 501);
    });
});

module.exports = add;
