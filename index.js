var exxpress = require("express");
var http = require("http");
var seedrandom = require("seedrandom");
var app = exxpress();
var totalTai = 0;
var totalXiu = 0;
var listDice = [];
var listResult = [];
var listDiceTotal = {
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
    17: 0,
    18: 0
}
var listDicePer = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
}

app.use(exxpress.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = http.Server(app);
var io = require("socket.io")(server);
var totalViews = 0;
server.listen(3000);

io.on("connection", function(socket) {
    console.log("Connection : " + socket.id);
    socket.on("disconnect", function(data) {
        totalViews--;
    });
    socket.on("getListDice", function() {
        io.sockets.emit("listDice", listDice);
        io.sockets.emit("diceData", { listTotal: listDiceTotal, listPer: listDicePer });
    });
    socket.on("getListuser", function() {
        io.sockets.emit("listUser", totalViews);
    });
    totalViews++;
})

app.get("/", function(req, res, next) {
    res.render("index");
});


getData();

function getData() {
    var http = require('https');

    var str = '';
    var data;
    var _countDown = 0,
        _D1 = 0,
        _D2 = 0,
        _D3 = 0;
    var options = {
        host: 'max.club',
        path: '/signalr/connect?transport=serverSentEvents&clientProtocol=1.5&UserID=&connectionToken=8GDXPv21/jA2mpaobxf8Uq2CEiOqxQOPLM0NRM5FlkC606WGwTezzASF0hbIFT3O7LDyeFWOR7SxTCTAZugl6fURrnGmmEZr12sQzUBYFbzqMVON&connectionData=[{"name":"usernotififyhub"}]&tid=4'
    };

    var isGet = false;
    var sessionId = 0;
    var seedEndtime = '';
    var dataPush;
    var MemberT = 0,
        MemberX = 0,
        TotalT = 0,
        TotalX = 0;
    callback = function(response) {
        response.on('data', function(chunk) {
            try {
                data = JSON.parse(chunk.toString().replace("data: ", ""));
                countDown = data["M"][0]["A"][0]["countdown"].toString();
                if (countDown < 60 && countDown > 0 && isGet == false) {
                    isGet = true;
                }
                D1 = data["M"][0]["A"][0]["result"][0];
                D2 = data["M"][0]["A"][0]["result"][1];
                D3 = data["M"][0]["A"][0]["result"][2];
                TotalT = data["M"][0]["A"][0]["oval"];
                TotalX = data["M"][0]["A"][0]["uval"];
                MemberT = data["M"][0]["A"][0]["onum"];
                MemberX = data["M"][0]["A"][0]["unum"];
                sessionId = data["M"][0]["A"][0]["diceId"];
                seedEndtime = data["M"][0]["A"][0]["EndCountdownTime"];
                io.sockets.emit("countDown", {
                    _countDown: countDown,
                    _D1: D1,
                    _D2: D2,
                    _D3: D3,
                    _MemberT: MemberT,
                    _MemberX: MemberX,
                    _TotalT: TotalT,
                    _TotalX: TotalX
                });
                if (D1 != 0 && isGet == true) {
                    isGet = false;
                    dataPush = {
                        dice1: D1,
                        dice2: D2,
                        dice3: D3,
                        totalDice: parseInt(D1) + parseInt(D2) + parseInt(D3),
                        Id: sessionId,
                        Entime: seedEndtime
                    };
                    listDice.push(dataPush);
                    DiceResult(D1, D2, D3);
                    if (listDice.length >= 200) {
                        listDice.splice(0, 1);
                    }
                    io.sockets.emit("listDice", listDice);
                    io.sockets.emit("totalTX", listResult);
                    io.sockets.emit("diceData", { listTotal: listDiceTotal, listPer: listDicePer });
                }
                msleep(5);
            } catch (e) {}
        });
        // request.on('response', function(response) { sleep(100); });
        response.on('error', function(err) {
            console.log(err);
        });
    }
    var req = http.request(options, callback).end();
    req.on('error', function(e) {
        sleep(5);
        req = http.request(options, callback).end();
        console.log("error");
    });
}

function DiceResult(dice1, dice2, dice3) {
    var D1 = parseInt(dice1);
    var D2 = parseInt(dice2);
    var D3 = parseInt(dice3);
    var totalDice = D1 + D2 + D3;
    if (totalDice > 10) {
        totalTai++;
    } else {
        totalXiu++;
    }
    listResult = { Tai: totalTai, Xiu: totalXiu };
    listDicePer[D1]++;
    listDicePer[D2]++;
    listDicePer[D3]++;
    listDiceTotal[totalDice]++;
}

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
    msleep(n * 1000);
}