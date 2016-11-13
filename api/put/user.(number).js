var Method = require('aeolus').Method;
var DB = require('aeolus').DB;

var user = new Method();

user.DBWrapper.edit('users', function(req) {
    return {
        number: req.getParameter('number')
    };
}, function(user) {
    user.facebookID = req.getParameter('facebook') || user.facebookID;
    user.telegramID = req.getParameter('telegram') || user.telegramID;
    return user;
});

module.exports = user;
