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
    var id = req.getParameter('id');
    console.log(req.getParameter('start'));
    var start = new Date(req.getParameter('start'));
    console.log(start);
    if (!id || !start) {
        res.responsdPlainText("Get yo shit in order. Missing parameters", 400);
        return;
    }
    var day = start.toDateString();
    var end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    var newSlot = {
        start: start,
        end: end,
        person: id,
    };
    DB.findAll('machines', { }, function(machines) {
        console.log(machines);
        var available = machines.map(function(machine) {
            machine.slots = machine.slots.filter(function(slot) {
                console.log(slot);
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
                res.respondJSON(true);
            }, function() {
                res.respondJSON(false, 501);
            });
        } else {
            res.respondJSON(false, 404);
        }
    });
});

module.exports = reserve;
