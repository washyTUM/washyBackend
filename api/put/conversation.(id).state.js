var Method = require('aeolus').Method;
var DB = require('aeolus').DB;

var convo = new Method();

convo.DBWrapper.edit('conversations', function(req) {
    return {
        convoID: req.getParameter('id'),
    };
}, function(conversation) {
    conversation.userID = req.getParameter('user') || conversation.userID;
    conversation.state = req.getParameter('state') || conversation.state;
    conversation.date = req.getParameter('date') || conversation.date;
    return conversation;
});

module.exports = convo;
