var app = {
	username: '<anonymous>',
	server: 'https://api.parse.com/1/classes/chatterbox',
	friendsList: {},
	lastGetMsgTime: "",
	defaultChatRoom: "lobby",

	init: function() {
		//initialize function to start timers, get initial messages
		app.fetch();
		setInterval(app.fetch, 3000);
		app.$chatRoom = $('#roomname');
	},

	send: function(message) {
		// Send an AJAX Post request.
		postMessage(message);
	},

	fetch: function() {
		// Send an AJAX get request.
		var dataConstraints = {};
		dataConstraints['order'] = '-createdAt';
		if (app.lastGetMsgTime) {
			dataConstraints['where'] = {
				'updatedAt': {'$gt': app.lastGetMsgTime},
				'roomname': app.$chatRoom.val() || app.defaultChatRoom
			};
		};
		getMessages(dataConstraints);
	},

	clearMessages: function(numToDelete) {
		// Remove all or a specified number of children from #chats.
		if (numToDelete === undefined){
			numToDelete = $('#chats').children().length;
		}
		for (var i = 0; i < numToDelete; i++){
		  $('#chats').children(':first').remove();
		}
	},

	addMessage: function(message) {
		//append HTML element to chats
		$('#chats').append(message);
	},

	addRoom: function(roomName) {
		$('#roomSelect').append('<div class=roomTitle>' + roomName + '</div>');
	}
};

var createMessage = function() {
	app.username = $("#username").val() || '<anonymous>';
	var msg = {
		'text': $('.messageInputText').val(),
		'username': app.username,
		'roomname': app.$chatRoom.val() || app.defaultChatRoom
	};
	app.send(msg);
	$('.messageInputText').val("");
};

var postMessage = function(message) {
	// post a message (as an object) to the server
	$.ajax({
	  url: app.server, // This is the url you should use to communicate with the parse API server.
	  type: 'POST', // POST to create a new resource
	  data: JSON.stringify(message), // message contents passed in as an object
	  contentType: 'application/json',
	  success: function (data) {
	    app.fetch();
	  },
	  error: function (data) {
	    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
	    console.error('chatterbox: Failed to send message');
	  }
	});
};

var getMessages = function(dataConstraints) {
	//send AJAX request to get messages from the server
	  //on success, add to the document message area
	$.ajax({
	  url: app.server,
	  type: 'GET', // GET to create a new resource
	  data: dataConstraints,
	  success: function (data) {
	    console.log(data);
	    // Iterate over all of data results.
	    // To prevent a blink, we should cache the messages on screen and only update the newest msgs.
	      // Store the last time a GET request was done.  Only read the message that have appeared since then.
			if (data.results.length > 0)
				app.lastGetMsgTime = data.results[0].updatedAt;

	    for(var i=Math.min(data.results.length - 1,20); i>=0; i--) {
	    	var $message = $('<div class=messageOutput><div>');
	    	var $username = $('<a href="#"></a>').text(data.results[i].username).addClass('user');
	    	var $messageText = $('<span class="messageText"></span>').text(data.results[i].text);
	    	if (app.friendsList[data.results[i].username] === true) {
	    		$username.addClass('friend'); // if friend, set class to "user friend"
	    	}
        // On username click, add that user to the friends list
        $username.on('click',function(event) {
          app.friendsList[this.text] = true;
          // bold username of all friends in the current chat window
          $('#chats').children().each( function(index, element) {
          	var curr = $(this).find('a:first');
          	if( app.friendsList[curr.text()] ) {
          		curr.addClass("friend");
          	}
          });
          // prevent default behavior
          return false;
        });

        $message.append($username);
        $message.append($messageText);
	    	app.addMessage($message);
	    }

      var toDelete = $('#chats').children().length > 20 ? $('#chats').children().length - 20 : 0;
      app.clearMessages(toDelete);
	  },
	});
};

//initialize the app
$(function(){app.init()});

