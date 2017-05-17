**Web Chat Client for Mycroft**
===================

For Mycroft with new API (https://home.mycroft.ai) Version 8.10 or higher
See on Youtube (https://www.youtube.com/watch?v=J8NGy9UwkPI)


How to install
-------------
Step 1  Download this repo to your download folder

    cd mycroft-core/mycroft/messagebus/service

    Rename main.py  	(Rename original main.py for backup)
    mv main.py main_ORG.py

    copy on "mycroft-core/mycroft/messagebus/service" all files and directory downloaded on Step 1

    If you want to use the normal version without making changes, just rename main_1.py to main.py


    If you want to use the version that allows you to select if you want the answer only in the chat, or if you want to play it with audio, rename main_2.py to main.py
    and, for this you have to modify the following files:



	mycroft-core/mycroft/skills/intent_service.py
	--> find this section

	    def handle_utterance(self, message):
		# Get language of the utterance
		lang = message.data.get('lang', None)
		if not lang:
		    lang = "en-us"

		utterances = message.data.get('utterances', '')
		#**************************************
		speak_response = message.data.get('isSpeak', True)			# <-------------- Add this line 
		#**************************************

		best_intent = None
		for utterance in utterances:
		    try:
		        # normalize() changes "it's a boy" to "it is boy", etc.
		        best_intent = next(self.engine.determine_intent(
		            normalize(utterance, lang, speak_response), 100))

		        # TODO - Should Adapt handle this?
		        best_intent['utterance'] = utterance
			#**************************************	
			best_intent['isSpeak'] = speak_response				# <-------------- Add this line 
			#**************************************
		    except StopIteration, e:
		        logger.exception(e)
		        continue



	mycroft-core/mycroft/skills/core.py
	--> find this section

	    def register_intent(self, intent_parser, handler):
		name = intent_parser.name
		intent_parser.name = self.name + ':' + intent_parser.name
		self.emitter.emit(Message("register_intent", intent_parser.__dict__))
		self.registered_intents.append((name, intent_parser))

		#**************************************
		def handle_chat_response(event):					# <-------------- Add this line 
		    global chat_response						# <-------------- Add this line 
		    chat_response = str(event.data)					# <-------------- Add this line 
		#**************************************


		def receive_handler(message):
		    #**************************************
		    global isSpeak							# <-------------- Add this line 
		    isSpeak = message.data["isSpeak"]					# <-------------- Add this line 
		    #**************************************
		    try:
		        handler(message)
		    except:
		        # TODO: Localize
		        self.speak(
		            "An error occurred while processing a request in " +
		            self.name)
		        logger.error(
		            "An error occurred while processing a request in " +
		            self.name, exc_info=True)

		if handler:
		    self.emitter.on(intent_parser.name, receive_handler)
		    self.events.append((intent_parser.name, receive_handler))
		    #**************************************
		    self.emitter.on('chat_response', handle_chat_response)		# <-------------- Add this line 
		    #**************************************

	
	--> find this section

	    def speak(self, utterance, expect_response=False):
		#**************************************
		data = {'utterance': utterance,
		        'expect_response': expect_response, 'isSpeak':isSpeak}		# <-------------- Modify this line 
		#**************************************
		self.emitter.emit(Message("speak", data))



	mycroft-core/mycroft/client/speech/main.py
	--> find this section

	    def handle_speak(event):
		global _last_stop_signal

		utterance = event.data['utterance']
		expect_response = event.data.get('expect_response', False)
		#**************************************
		isSpeak = event.data.get('isSpeak', True)					# <-------------- Add this line 
		#**************************************

		# This is a bit of a hack for Picroft.  The analog audio on a Pi blocks
		# for 30 seconds fairly often, so we don't want to break on periods
		# (decreasing the chance of encountering the block).  But we will
		# keep the split for non-Picroft installs since it give user feedback
		# faster on longer phrases.
		#
		# TODO: Remove or make an option?  This is really a hack, anyway,
		# so we likely will want to get rid of this when not running on Mimic

		#**************************************
		if isSpeak:									# <-------------- Add this line  and 
		#**************************************
		  if not config.get('enclosure', {}).get('platform') == "picroft":		# <-------------- Add two sapces before if not....
			start = time.time()
			chunks = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s',
				          utterance)
			for chunk in chunks:
			    try:
				mute_and_speak(chunk)
			    except:
				logger.error('Error in mute_and_speak', exc_info=True)
			    if _last_stop_signal > start or check_for_signal('buttonPress'):
				break
		  else:									# <-------------- Add two sapces before else....
			mute_and_speak(utterance)


Step 2	Restar Mycroft

    ./start.sh service
    ./start.sh skills
    ./start.sh voice


Setp 3
    Open you browser on http://MYCROFT_IP_ADRESS:8181/   (Not localhost) 
    or
    Open you browser on http://MYCROFT_HOST_NAME:8181/   (Point to IP Address) 

    if you press <ENTER> key only receive a Chat response
    if you press <SEND> button receive a Chat and Speak response

    If you request something from Mycroft microphone and you have open a Chat session, you will also receive the answer in the Web Chat Client.

**Enjoy !**
--------

