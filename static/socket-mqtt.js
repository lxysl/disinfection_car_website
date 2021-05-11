var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
var img = new Image();
var last_x = 546;
var last_y = 20;

socket.on('connect', function () {
    socket.emit('connect_message', {data: 'connected!'});
    subscribe();
});

// 接收消毒车位置参数并显示
socket.on('odom', function (msg) {
    console.log('odom');
    console.log(msg);
    // ((?<=<x:).+)(.+(?=,))
    // ((?<=,).+)(.+(?=>))
    var x = parseFloat(msg.payload.match(/((?<=<x).+)(.+(?=,))/));
    var y = parseFloat(msg.payload.match(/((?<=, y).+)(.+(?=>))/));

    var canvas = document.getElementById('map');
    if (!canvas.getContext) return;
    var ctx = canvas.getContext("2d");

    x_img = 78.83 * x - 31.24;
    console.log("x:" + x.toString());
    y_img = -61.59 * y - 0.324;
    console.log("y:" + y.toString());
    img.onload = function () {
        ctx.clearRect(last_x,last_y,20,20);
        ctx.drawImage(img, x_img, y_img, 20, 20);
        last_x = x_img;
        last_y = y_img;
    }
    img.src = "../static/images/location.png"; // 设置图片源地址
});

socket.on('no_mask_warning', function () {
    toastr.warning("发现未佩戴口罩人员！");
    var no_mask = parseInt(document.getElementById("no_mask").innerText);
    document.getElementById("no_mask").innerText = (no_mask + 1).toString();
})

function subscribe() {
    console.log("click subscribe");
    socket.emit('subscribe', {topic: 'odom'});
}

function publish() {
    console.log("click publish");
    socket.emit('publish', {topic: 'odom', message: 'battery warning'});
}

function unsubscribe() {
    console.log("click unsubscribe");
    socket.emit('unsubscribe', {topic: 'odom', message: ''})
}

function toast() {
    console.log("click toast");
    socket.emit('toast');
}

function hideControl() {
    document.getElementsByClassName("change_camera_direction")[0].style.visibility = "hidden";//隐藏
}

function displayControl() {
    document.getElementsByClassName("change_camera_direction")[0].style.visibility = "visible";//显示
}

function left_direction() {
    console.log("left");
    socket.emit('direction', {topic: 'cmd', message: 4});
}

function forward_direction() {
    console.log("forward");
    socket.emit('direction', {topic: 'cmd', message: 2});
}

function stop_direction() {
    console.log("stop");
    socket.emit('direction', {topic: 'cmd', message: 5});
}

function backward_direction() {
    console.log("backward");
    socket.emit('direction', {topic: 'cmd', message: 8});
}

function right_direction() {
    console.log("right");
    socket.emit('direction', {topic: 'cmd', message: 6});
}

function send_cmd(cmd) {
    // var message = new Paho.MQTT.Message("<" + cmd + " > "); //"<1>", "<2>", ...
    console.log(cmd);
    // message.destinationName = "610_cmd"; //topic
    for (var i = 0; i < 5; i++) {
        // cmd_client.send(message);
        socket.emit('publish', {topic: 'cmd', message: cmd});
    }
}

document.onkeydown = function (event) {
    if (document.getElementsByClassName("change_camera_direction")[0].style.visibility === "visible") {
        // 手动模式
        if (event.key === 'ArrowLeft') { // 按左箭头
            left_direction();
        }
        if (event.key === 'ArrowUp') { // 按上箭头
            forward_direction();
        }
        if (event.key === ' ') { // 按空格
            stop_direction();
        }
        if (event.key === 'ArrowDown') { // 按下箭头
            backward_direction();
        }
        if (event.key === 'ArrowRight') { // 按右箭头
            right_direction();
        }
    }
};
