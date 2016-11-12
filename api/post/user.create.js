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
    if (!number || !name) {
        res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    var options = {
        url: facesURL('students'),
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "e16d3ed01c1243099ed866638c17d79d"
        },
        form: {
            name: name
        }
    };
    request(options, function(err, httpRES, body) {
        if (!err || err === null) {
            var user = {
                number: number,
                name: name,
                facesID: JSON.parse(body).personId
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

// create.DBWrapper.insert('users', function(req) {
//     return {
//         number: req.getParameter('number'),
//         name: req.getParameter('name')
//     };
// });

module.exports = create;
