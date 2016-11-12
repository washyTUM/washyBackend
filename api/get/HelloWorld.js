var Method = require('aeolus').Method;

var hello = new Method();

hello.handle(function(req, res) {
    res.respondPlainText("Hello");
});

module.exports = hello;
