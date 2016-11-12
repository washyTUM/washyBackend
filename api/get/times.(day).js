var Method = require('aeolus').Method;
var DB = require('aeolus').DB;

var find = new Method();

function isIn(slot, time) {
    return slot.start <= time && slot.end >= time;
}

function doOverlap(first, second) {
    return isIn(first, second.start) || isIn(first, second.end);
}

function overLapped(first, second) {
    if (doOverlap(first, second)) {
        var result = {};
        if (first.start < second.start) {
            result.start = second.start;
        } else {
            result.start = first.start;
        }
        if (first.end < second.end) {
            result.end = first.end;
        } else {
            result.end = second.end;
        }
        return result;
    } else {
        return null;
    }
}

function overLappingSlots(first, second) {
    var result = [];
    for (var i = 0; i < first.length; i++) {
        for (var j = 0; j < second.length; j++) {
            var over = overLapped(first[i], second[j]);
            result.push(over);
        }
    }
    return result.filter(function (i) { return i !== null; });
}

function getOverlappedSlots(slots) {
    if (slots.length > 0) {
        var overLapped = slots.reduce(overLappingSlots, slots[0]);
        return overLapped;
    } else {
        return [];
    }
}

function getAvailable(notAvailable, startDate, endDate) {
    sorted = notAvailable.sort(function (a, b) {
        return a.start - b.start;
    });
    var available = notAvailable.reduce(function (r, i) {
        var last = r[r.length - 1];
        last.end = i.start;
        r[r.length] = { start: i.end };
        return r;
    }, [{ start: startDate }]);
    available[available.length - 1].end = endDate;
    available = available.filter(function (a) {
        return a.end && a.start.getTime() < a.end.getTime();
    });
    return available;
}

function slotsFromMachines(machines) {
    return machines.map(function (item) {
        return item.slots.map(function (slot) {
            return {
                start: new Date(slot.start),
                end: new Date(slot.end)
            };
        });
    });
}

find.handle(function (req, res) {
    var day = new Date(req.getParameter('day'));
    var today = day.toDateString();
    var tomorrow = new Date(day.getTime() + (24 * 60 * 60 * 1000));
    DB.findAll('machines', {}, function (machines) {
        console.log(machines);
        var allSlots = slotsFromMachines(machines);
        var occupiedOnDay = allSlots.map(function (slots) {
            return slots.filter(function (slot) {
                return slot.start.toDateString() == today || slot.end.toDateString() == today;
            });
        });
        var available = getAvailable(getOverlappedSlots(occupiedOnDay), new Date(today), new Date(tomorrow.toDateString()));
        res.respondJSON(available);
    }, function () {
        res.respondJSON([]);
    });
});

module.exports = find;
