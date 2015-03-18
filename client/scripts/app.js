var lastGetMsgTime = "";

var app = {
	username: '<anonymous>',
	server: 'https://api.parse.com/1/classes/chatterbox',
	friendsList: {},
	init: function() {
		//initialize function to start timers, get initial messages
		// fix:  $('#username').text(app.username);
		app.fetch();
		setInterval(app.fetch, 3000);
	},
	send: function(message) {
		// Send an AJAX Post request.
		postMessage(message);
	},
	fetch: function() {
		// Send an AJAX get request.

		var dataConstraints = {};
		dataConstraints['order'] = '-createdAt';
		if (lastGetMsgTime) {
			dataConstraints['where'] = {'updatedAt': {'$gt': lastGetMsgTime}};
		};
		console.log(dataConstraints);
	  //  // {'roomname': 'lobby', 'username': 'matt_david'}

		getMessages(dataConstraints);
	},
	clearMessages: function(numToDelete) {
		// Remove all children from #chats.
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
		// formatting
	},
	addRoom: function(roomName) {
		$('#roomSelect').append('<div class=roomTitle>' + roomName + '</div>');
		// formatting
	}
};

var createMessage = function() {
	app.username = $("#username").val() || '<anonymous>';
	var msg = {
		'text': $('.messageInputText').val(),
		'username': app.username
	};
	console.log("msg = ", msg);
	app.send(msg);
	$('.messageInputText').val("");
}

// $("#messageInput").on("submit", function(event) {
// 	event.preventDefault();

// })

var postMessage = function(message) {
	// post a message (as an object) to the server
	$.ajax({
	  // This is the url you should use to communicate with the parse API server.
	  url: app.server,
	  type: 'POST', // to create a new resource
	  data: JSON.stringify(message),
	  contentType: 'application/json',
	  success: function (data) {
	    console.log('chatterbox: Message sent');
	    console.log('post data:');
	    console.log(data);
	    // getMessages(data);
	    app.fetch();
	  	// call update method to update the display
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
	  // This is the url you should use to communicate with the parse API server.
	  url: app.server,
	  type: 'GET', // to create a new resource
	  data: dataConstraints,
	  success: function (data) {
	    console.log(data);
	    // Interate over all of data results.
	    // To prevent a blink, we should cache the messages on screen and only update the newest msgs.
	      // Store the last time a get request was done.  Only read the message that have appeared since then.

			if (data.results.length > 0)
				lastGetMsgTime = data.results[0].updatedAt;

	    // to fix: ordering of messages
	    for(var i=Math.min(data.results.length - 1,20); i>=0; i--) {
	    	var $message = $('<div class=messageOutput><div>');
	    	var $username = $('<a href="#"></a>').text(data.results[i].username);
	    	var $messageText = $('<span class="messageText"></span>');
        $messageText.append(document.createTextNode(data.results[i].text));        
        $username.addClass('user');
	    	if (app.friendsList[data.results[i].username] === true) {
	    		$username.addClass('friend'); // if friend, class="user friend"
	    	}
        // add user to friends list
        $username.on('click',function(event) {
          console.log(this.text);
          app.friendsList[this.text] = true;
          console.log(app.friendsList);

          $('#chats').children().each( function(index, element) {
          	var curr = $(this).find('a:first');
          	if( app.friendsList[curr.text()] ) {
          		curr.addClass("friend");
          	}
          });

          return false;
        });

        $message.append($username);
        $message.append($messageText);
	    	
	    	app.addMessage($message);
	    }

      var toDelete = $('#chats').children().length > 20 ? $('#chats').children().length - 20 : 0;
      app.clearMessages(toDelete);
	  },
	  // error: function (data) {
	  //   // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
	  //   console.error('chatterbox: Failed to send message');
	  // }
	});
};

//periodic message refreshing via getMessages function
app.init();

