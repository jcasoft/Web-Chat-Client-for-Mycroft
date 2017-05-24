#!/usr/bin/env python
#-*- coding:utf-8 -*-
# Copyright 2016 Mycroft AI, Inc.
#
# This file is part of Mycroft Core.
#
# Mycroft Core is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Mycroft Core is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Mycroft Core.  If not, see <http://www.gnu.org/licenses/>.

from mycroft.configuration import ConfigurationManager
from mycroft.messagebus.service.ws import WebsocketEventHandler
from mycroft.util import validate_param, create_signal
#from mycroft.lock import Lock  # creates/supports PID locking file


__author__ = 'seanfitz', 'jdorleans', 'jcasoft'


# --------------------------------------
#__co-author__ = 'jcasoft'		# Only for Web Client 	
from mycroft.util import kill, play_wav, resolve_resource_file, create_signal
from mycroft.messagebus.client.ws import WebsocketClient
from mycroft.messagebus.message import Message
from threading import Thread

ws = None

import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.options
import os.path
from tornado.options import define, options
import multiprocessing
import json
import time
import os
from subprocess import check_output

global ip
ip = check_output(['hostname', '--all-ip-addresses']).replace(" \n","")

clients = [] 


input_queue = multiprocessing.Queue()
output_queue = multiprocessing.Queue()

        
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html',ip=ip,  port=port)

class StaticFileHandler(tornado.web.RequestHandler):
	def get(self):
		self.render('js/app.js')
 
class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        clients.append(self)
        self.write_message("Welcome to Mycroft")
 
    def on_message(self, message):
	utterance = json.dumps(message)
	print("*****Utterance : ",utterance)


	if utterance:
	    if utterance == '"mic_on"':
		create_signal('startListening')
	    else:
		if "|SILENT" in utterance:
			utterance = utterance.split("|")
			utterance = utterance[0]
			data = {"lang": lang, "session": "", "utterances": [utterance], "isSpeak":False, "client":"WebCaht"}
			ws.emit(Message('chat_response', data))
			ws.emit(Message('recognizer_loop:utterance', data))
		else:
			data = {"lang": lang, "session": "", "utterances": [utterance], "isSpeak":True, "client":"WebCaht"}
			ws.emit(Message('recognizer_loop:utterance', data))

	        t = Thread(target = self.newThread)
	        t.start()

    def newThread(self):
	global wait_response
	global skill_response
        timeout = 0
        while wait_response:
	    wait_response = True
            time.sleep(1)
	    timeout = timeout + 1


	time.sleep(1)
	#skill_response = skill_response.replace("Checking for Updates","")
	#skill_response = skill_response.replace("Skills Updated. Mycroft is ready","")

	time.sleep(1)
	print("*****Response : ",skill_response)

	if len(skill_response) > 0:
		self.write_message(skill_response)

	skill_response = ""
	wait_response = True

        timeout = 0
        while timeout < 5 or wait_response:
            time.sleep(1)
	    timeout = timeout + 1
	     

	if len(skill_response) > 0:
		self.write_message(skill_response)


	wait_response = True
	skill_response = ""

 
    def on_close(self):
        clients.remove(self)


def connect():
    ws.run_forever()


def handle_speak(event):
    response = event.data['utterance']
    global skill_response, wait_response
    skill_response = ""
    wait_response = False
    skill_response = response


def main():
    global skill_response, wait_response, port, lang
    wait_response = True
    skill_response = ""

    global ws
    ws = WebsocketClient()
    event_thread = Thread(target=connect)
    event_thread.setDaemon(True)
    event_thread.start()

    ws.on('speak', handle_speak)

    import tornado.options

    tornado.options.parse_command_line()
    config = ConfigurationManager.get().get("websocket")
    lang = ConfigurationManager.get().get("lang")

    host = config.get("host")
    port = config.get("port")
    route = config.get("route")
    validate_param(host, "websocket.host")
    validate_param(port, "websocket.port")
    validate_param(route, "websocket.route")


    url = "http://" + str(ip)+":"+str(port)
    print "*********************************************************"
    print "*   Access from web browser " + url
    print "*********************************************************"

    routes = [
        (route, WebsocketEventHandler),
	tornado.web.url(r"/", MainHandler, name="main"),
	tornado.web.url(r"/static/(.*)", tornado.web.StaticFileHandler, {'path':  './'}),
	tornado.web.url(r"/ws", WebSocketHandler)
    ]

    settings = {
        "debug": True,
        "template_path": os.path.join(os.path.dirname(__file__), "templates"),
        "static_path": os.path.join(os.path.dirname(__file__), "static"),
    }
    

    application = tornado.web.Application(routes, **settings)
    httpServer = tornado.httpserver.HTTPServer(application)
    tornado.options.parse_command_line()
    httpServer.listen(port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()

