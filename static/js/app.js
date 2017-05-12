/*
-------------------------------------------------------------
	Author:	jcasoft	- Juan Carlos Argueta
	Web Chat Client for Mycroft

	to do:
		reload or refresh
		mic_on
		mic_off
		mute
		vol_up
		vol_down
		backward
		forward
		play
		pause

-------------------------------------------------------------
*/

var ip = ""
var por = ""

function set_ip(val)
{
    ip=val
    console.log("Local computer IP="+ ip)
}

function set_port(val)
{
    port=val
    console.log("Socket Port="+ port)
}


$(document).ready(function(){

	var received = $('#received');

	// Define Socket with local computer IP
	// var socket = new WebSocket("ws://"+ip+":8181/ws");
	var socket = new WebSocket("ws://"+ip+":"+port+"/ws");
	console.log("ws://"+ip+":"+port+"/ws")

	 
	socket.onopen = function(){  
	  console.log("connected");
	  push_response('Web Chat Client from JCASOFT')
	}; 

	socket.onmessage = function (message) {
	  console.log("receiving: " + message.data);
	  received.append(message.data);
	  push_response(message.data)

	};

	socket.onclose = function(){
	  console.log("disconnected"); 
	};

	var sendMessage = function(message) {
	  console.log("sending:" + message.data);
	  socket.send(message.data);
	};



	$('.chat[data-chat=person2]').addClass('active-chat')
	$('.person[data-chat=person2]').addClass('active')
	$('.left .person').mousedown(function () {
	    if ($(this).hasClass('.active')) {
		return false
	    }
	    const findChat = $(this).attr('data-chat')
	    const personName = $(this).find('.name').text()
	    $('.right .top .name').html(personName)
	    $('.chat').removeClass('active-chat')
	    $('.left .person').removeClass('active')
	    $(this).addClass('active')
	    $('.chat[data-chat = ' + findChat + ']').addClass('active-chat')
	})


	function push_statment(msg) {
	    $('.chat').append('<div class="bubble me"><i class="fa fa-user-circle" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')  
	}


	function push_response(msg, callback) {
	    if (msg == 'stop') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-window-close" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'reload') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-refresh" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'play') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-play" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'pause') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-pause" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'mute') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-volume-off" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'vol_up') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-volume-up" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'vol_down') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-volume-down" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'mic_on') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-microphone" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'mic_off') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-microphone-slash" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'forward') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-forward" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'backward') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-backward" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else if (msg == 'Web Chat Client from JCASOFT') {
		$('.chat').append('<div class="bubble you loading"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    } else {
		$('.chat').append('<div class="bubble you"><i class="fa fa-commenting" aria-hidden="true"></i>&nbsp;&nbsp;' + msg + '</div>')
	    }
	}

	function get_resp(q, is_response = false) {
	    let query = q
	    console.log("*****Utterance to send to main.py server="+query)	// Send to tornado and wait for response
	    sendMessage({ 'data' : query});

	}

	$('#stop').click(function(){
	   sendMessage({ 'data' : 'stop'});
	   push_response('stop')
	});

	$('#pause').click(function(){
	   sendMessage({ 'data' : 'pause'});
	   push_response('pause')
	});

	$('#play').click(function(){
	   sendMessage({ 'data' : 'play'});
	   push_response('play')
	});

	$('#next_track').click(function(){
	   sendMessage({ 'data' : 'next track'});
	   push_response('next track')
	});

	$('#previous_track').click(function(){
	   sendMessage({ 'data' : 'previous track'});
	   push_response('previous track')
	});

	$('#reduce_volume').click(function(){
	   sendMessage({ 'data' : 'reduce volume'});
	   push_response('reduce volume')
	});

	$('#increase_volume').click(function(){
	   sendMessage({ 'data' : 'increase volume'});
	   push_response('increase volume')
	});

	$('#mute_volume').click(function(){
	   sendMessage({ 'data' : 'mute volume'});
	   push_response('mute volume')
	});

	$('#mic_on').click(function(){
	   sendMessage({ 'data' : 'mic_on'});
	   push_response('start listening on Mycroft mic')
	});

	$('#mic_off').click(function(){
	   sendMessage({ 'data' : 'mic_off'});
	   push_response('mic off')
	});

	$('#reload').click(function(){
	   sendMessage({ 'data' : 'reload'});
	   push_response('reload')
	});



	$('#textbox').keypress(function (e) {
	    if (e.which == 13) {
		$(this).blur()
		push_statment($('#textbox').val())
		get_resp($('#textbox').val())
		document.getElementById('textbox').value = ''
		return false
	    }
	})

});
