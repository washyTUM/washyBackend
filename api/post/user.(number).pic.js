var Method = require('aeolus').Method;
var DB = require('aeolus').DB;
var request = require('request');

var add = new Method();

function facesURL(groupID, personId) {
    return "https://api.projectoxford.ai/face/v1.0/persongroups/" + groupID + "/persons/" + personId + "/persitedFaces";
}

add.handle(function (req, res) {
    var number = req.getParameter('number');
    var url = req.getParameter('url');
    if (!number || !url) {
        res.respondPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    DB.find('users', { number: number }, function(user) {
        var id = user.oxfordID;
        var options = {
            url: facesURL('students', id),
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
