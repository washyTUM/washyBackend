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
            userID: req.getParameter('user') || conversation.userID,
            state: req.getParameter('state') || conversation.state,
            date: req.getParameter('date') || conversation.date
        };
        DB.insert('conversations', item, function() {
            res.respondJSON(item);
        }, function() {
            res.respondPlainText("Internal Database Error", 500);
        });
    });
});

convo.DBWrapper.edit('conversations', function(req) {
    return {
        convoID: req.getParameter('id'),
    };
}, function(conversation) {
    conversation.userID = req.getParameter('user') || conversation.userID;
    conversation.state = req.getParameter('state') || conversation.state;
    conversation.date = req.getParameter('date') || conversation.date;
    return conversation;
}, 200, {}, function() {
    console.log("Item is not in DB");
    DB.insert('conversations', {})
});

module.exports = convo;
