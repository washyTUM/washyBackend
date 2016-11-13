var Method = require('aeolus').Method;
var DB = require('aeolus').DB;
var request = require('request');

var create = new Method();

function facesURL(groupID) {
    return "https://api.projectoxford.ai/face/v1.0/persongroups/" + groupID + "/persons";
}

create.handle(function (req, res) {
    var name = req.getParameter('name');
    var number = req.getParameter('number');
    if (!number) {
        res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    DB.edit('users', { number: number }, function(item) {
        item.facebookID = req.getParameter('facebook') || item.facebookID;
        item.telegramID = req.getParameter('telegram') || item.telegramID;
        item.emulatorID = req.getParameter('emulator') || item.emulatorID;
        item.name = name || item.name;
        return item;
    }, function(item) {
        res.respondJSON(item);
    }, function() {
        if (!number) {
            res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
            return;
        }
        var options = {
            url: facesURL('students'),
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": "e16d3ed01c1243099ed866638c17d79d"
            },
            json: true,
            body: {
                name: name
            }
        };
        request(options, function(err, httpRES, body) {
            if (!err || err === null) {
                var user = {
                    number: number,
                    name: name,
                    balance: 10.0,
                    oxfordID: body.personId,
                    facebookID: req.getParameter('facebook'),
                    telegramID: req.getParameter('telegram'),
                    emulatorID: req.getParameter('emulator')
                };
                DB.insert('users', user, function() {
                    res.respondJSON(user);
                }, function() {
                    res.respondPlainText("FUUUUUCK. DB broke.", 501);
                });
            } else {
                res.respondPlainText(err.toString(), 501);
            }
        });
    });
});

module.exports = create;
