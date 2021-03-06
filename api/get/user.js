var Method = require('aeolus').Method;
var DB = require('aeolus').DB;

var user = new Method();

user.DBWrapper.find('users', function(req) {
    var facebookID = req.getParameter('facebook');
    var telegramID = req.getParameter('telegram');
    var emulatorID = req.getParameter('emulator');
    var number = req.getParameter('number');
    if (telegramID) {
        return {
            telegramID: telegramID
        };
    } else if (facebookID) {
        return {
            facebookID: facebookID
        };
    } else if (number) {
        return {
            number: number
        };
    } else if (emulatorID) {
        return {
            emulatorID: emulatorID
        };
    } else {
        return {
            notPossible: true
        };
    }
}, function(x) {
    return x;
});

module.exports = user;
