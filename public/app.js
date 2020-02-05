var socket_taixiu = io.connect('https://chat.max.game', {
    transports: ['polling'],
    upgrade: false
});

function keepAlive() {
    var timeout = 2000;
    if (socket_taixiu.readyState == socket_taixiu.OPEN) {
        socket_taixiu.send('');
    }
    timerId = setTimeout(keepAlive, timeout);
}
socket_taixiu.emit('adduser', 'nhbn2019');
socket_taixiu.emit('history');
socket_taixiu.emit('updatestatustoserver', 'nhbn2019', '0');