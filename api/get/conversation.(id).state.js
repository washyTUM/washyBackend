var Method = require('aeolus').Method;
var DB = require('aeolus').DB;

var convo = new Method();

convo.DBWrapper.find('conversations', function(req) {
    return {
        convoID: req.getParameter('id'),
    };
}, function(x) {
    return x;
});

module.exports = convo;
