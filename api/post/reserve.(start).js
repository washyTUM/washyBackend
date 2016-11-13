var Method = require('aeolus').Method;
var schedule = require('node-schedule');
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
    var emulatorID = req.getParameter('emulator');
    var number = req.getParameter('number');
    if (facebookID) {
        query = { facebookID: facebookID };
    } else if (telegramID) {
        query = { telegramID: telegramID };
    } else if (emulatorID) {
        query = { emulatorID: emulatorID };
    } else if (number) {
        query = { number: number };
    }
    var start = new Date(req.getParameter('start') + " GMT+0100");
    if (!query || !start) {
        res.respondPlainText("Get yo shit in order. Missing parameters", 400);
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
                DB.edit('machines', { _id: available[0]._id }, function(m) {
                    m.slots.push(newSlot);
                    return m;
                }, function() {
                    var alertTime = new Date(newSlot.start.getTime() - 10 * 60 * 1000);
                    schedule.scheduleJob(alertTime, function() {
                        var client = require('twilio')('AC7287cce52cd331042c68dda863805bf6', 'c90be39667768626ae38d19c75728b71');
                        client.sendMessage({
                            to: user.number,
                            from: '+4915735987500',
                            body: 'Your laundry slot is in 10 min in room ' + available[0].room
                        }, function(err, responseData) {
                            if (!err) {
                                console.log(responseData.from);
                                console.log(responseData.body);
                            } else {
                                console.log(err);
                            }
                        });
                    });
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
