var Method = require('aeolus').Method;
var DB = require('aeolus').DB;

function isOnDay(slot, day) {
    return slot.start.getDay() == day || slot.end.getDay() == day;
}

function isIn(slot, time) {
    return slot.start <= time && slot.end >= time;
}

function doOverlap(first, second) {
    return isIn(first, second.start) || isIn(first, second.end);
}

var reserve = new Method();

reserve.handle(function (req, res) {
    var query;
    var facebookID = req.getParameter('facebook');
    var telegramID = req.getParameter('telegram');
    var number = req.getParameter('number');
    if (facebookID) {
        query = { facebookID: facebookID };
    } else if (telegramID) {
        query = { telegramID: telegramID };
    } else if (number) {
        query = { number: number };
    }
    var start = new Date(req.getParameter('start') + " GMT+0100");
    if (!query || !start) {
        res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    var day = start.toDateString();
    var end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    DB.find('users', query, function(user) {
        var id = user.oxfordID;
        var newSlot = {
            start: start,
            end: end,
            person: id,
        };
        DB.findAll('machines', { }, function(machines) {
            var available = machines.map(function(machine) {
                machine.slots = machine.slots.filter(function(slot) {
                    return doOverlap(slot, newSlot);
                });
                return machine;
            }).filter(function(machine) {
                return machine.slots.length < 1;
            });
            if (available.length > 0) {
                console.log("Will edit");
                DB.edit('machines', { _id: available[0]._id }, function(m) {
                    m.slots.push(newSlot);
                    return m;
                }, function() {
                    res.respondJSON(available[0]);
                }, function() {
                    res.respondJSON(false, 501);
                });
            } else {
                res.respondJSON(false, 404);
            }
        });
    }, function() {
        res.respondPlainText("No user corresponds that info", 500);
    });
});

module.exports = reserve;
