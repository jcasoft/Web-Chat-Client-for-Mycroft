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
var user_id = "demo.ekylibre.io"



$(document).ready(function(){

	var received = $('#received');

	var parser = document.createElement('a');
	parser.href = document.URL;
	ip = parser.hostname;
	port = parser.port;

	// Define Socket with local computer IP
	var socket = new WebSocket("ws://192.168.1.128:8181/core");

	socket.onopen = function(){
	  console.log("connected");
	};

	socket.onmessage = function (message) {
  parseIncomingMessage(message.data)
	};

	socket.onclose = function(){
	  console.log("disconnected");
	};

	var sendMessage = function(message) {
	  console.log("sending:" + message.data);
    var jsonMessage = "{\"data\": {\"utterances\": [\""+message.data+"\"] }, \"type\": \"recognizer_loop:utterance\", \"context\": {\"userid\" : \"demo.ekylibre.io\"}}"
	  socket.send(jsonMessage);
	};

  var parseIncomingMessage = function(inputString) {
      const incomingjson = JSON.parse(inputString);
      if (incomingjson.context.userid == user_id) {
          if (incomingjson.data.expect_response == true){
            var response = true
          }
          if (incomingjson.type == "speak") {
            received.append(incomingjson.data.utterance);
        	  push_response(incomingjson.data.utterance)
          }
          if (incomingjson.type == "NLP_correction") {
              console.log("NLP à corriger")
              // To do : Function to correct utterances & highlight text
          }
      }
  // The function returns the product of p1 and p2
}



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
		$('.chat').append('<div class="bubble you">&nbsp;&nbsp;' + msg + '</div>')
	}

	function get_resp(q, is_response = false) {
	    let query = q
	    sendMessage({ 'data' : query});

	}

	$('#mic_on').click(function(){
    console.log("on fait appel au stt")
	});


	$('#textbox_submit').click(function(){
		$(this).blur()
		$('.chat').append('<div class="bubble me">&nbsp;' + $('#textbox').val() + '</div>')
		get_resp($('#textbox').val())
		document.getElementById('textbox').value = ''
		return false
	})


	$('#textbox').keypress(function (e) {
	    if (e.which == 13) {
		$(this).blur()
		push_statment($('#textbox').val())
		get_resp($('#textbox').val()+"|SILENT")
		document.getElementById('textbox').value = ''
		return false
	    }
	})

});
