var Method = require('aeolus').Method;
var DB = require('aeolus').DB;

var convo = new Method();

convo.handle(function(req, res) {
    DB.edit('conversations', { convoID: req.getParameter('id') }, function(conversation) {
        conversation.userID = req.getParameter('user') || conversation.userID;
        conversation.state = req.getParameter('state') || conversation.state;
        conversation.date = req.getParameter('date') || conversation.date;
        return conversation;
    }, function(item) {
        res.respondJSON(item);
    }, function() {
        var item = {
            userID: req.getParameter('user'),
            state: req.getParameter('state'),
            date: req.getParameter('date'),
            convoID: req.getParameter('id')
        };
        DB.insert('conversations', item, function() {
            res.respondJSON(item);
        }, function() {
            res.respondPlainText("Internal Database Error", 500);
        });
    });
});

module.exports = convo;
