var Method = require('aeolus').Method;

var create = new Method();

create.DBWrapper.insert('users', function(req) {
    return {
        number: req.getParameter('number'),
        name: req.getParameter('name')
    };
});

module.exports = create;
