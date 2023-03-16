#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pyngsi.ngsi import DataModel
from pyngsi.sink import SinkStdout, SinkOrion

import pika
import json
import requests
import os
import sys

from constants import *


def sendNotification(notificationType, messageText, messageSended):

	try:

		print('Method that sends notification to MongoDB. Could be successful or an error.')

		# RANDOM_ID is a unique identifier that allow notifications to be linked to the container they belong to
		random_ID = os.getenv("RANDOM_ID", RANDOM_ID)
		# print('RANDOM_ID', random_ID)

		time_interval = os.getenv("TIME_INTERVAL", TIME_INTERVAL)
		unit = os.getenv("TIME_UNIT", TIME_UNIT)

		filter = {
			"random_id": random_ID,
			"time_interval": time_interval,
			"time_unit": unit
		}

		# print('FILTER OBJECT', filter)

		# ------------------- STARTS OLD VERSION ---------------------------------
		# Next line is for Linux deployment
		# query_info = requests.get("http://172.17.0.1:3000/info/" + random_ID)

		# Next line is working locally
		# query_info = requests.get("http://127.0.0.1:3000/info/" + random_ID)

		# Next line is for Windows deployment
		# query_info = requests.get("http://host.docker.internal:3000/info/" + random_ID)
		# print('answer', query_info.text)

		# ------------------- ENDS OLD VERSION ---------------------------------

		# ---- new query that links random_id, cotainer and some parameters
		# Linux Deployment
		query_info = requests.post(
			"http://172.17.0.1:3000/info/filtered", data=filter)
		# Next line is working locally
		# query_info = requests.post("http://127.0.0.1:3000/info/filtered", data = filter)
		# Next line is for Windows deployment
		# query_info = requests.post("http://host.docker.internal:3000/info/filtered", data = filter)
		# print('RESPUESTA A SI EXISTE UN OBJETO CON ESTAS CARACTERISTICAS')
		print('answer: ', query_info.text)

		response_dict = json.loads(query_info.text)
		# print('----------------------------')
		# print(response_dict)
		# print('----------------------------')
		message = response_dict['message'][0]
		# print('----------------------------')
		# print(message)
		# print('----------------------------')

		container_name = message['container_name']

		data = {
			"id": container_name,
			"type": notificationType,
			"message": messageText,
			"register": messageSended
		}

		# Next line is for Linux deployment
		query = requests.post("http://172.17.0.1:3000/notification", data=data)

		# Next line is for Windows deployment
		# query = requests.post("http://http://127.0.0.1:3000/notification", data = data)

		# Local Deployment
		# query = requests.post("http://host.docker.internal:3000/notification", data = data)

		# extracting response text
		response = query.text
		print('response: ', response)

	except Exception as ex:
		print('ERROR: ', ex.args)


def build_dataModel(json_msg) -> DataModel:
	try:

		portAuthorityCode = json_msg['port_authority']['code']
		portCode = json_msg['port']['code']

		id_DataModel = 'urn:ngsi-ld:Posidonia:' + \
			str(portAuthorityCode) + ':' + \
			portCode + ':' + str(json_msg['date'])

		m = DataModel(id=id_DataModel, type="Posidonia")

		${pythonTemplate.data.dataModelProperties}

	except Exception as ex:
		print('ERROR: ', ex.args)
		sendNotification('ERROR', ex.args, '')

	return m


def queue1_callback(ch, method, properties, body):

	try:
		json_msg = json.loads(body)
		# Filtering by the exchange and the properties related to VPF
		if method.exchange == 'topic_aisEvent' and json_msg['autPor'] == 63 and json_msg['codPor'] == "V":
			sink = SinkOrion("127.0.0.1", 1026)
			# sink = SinkStdout()

			sendNotification('SUCCESS', 'Agent execution begins.', '')

			dataModel = build_dataModel(json_msg)
			sink.write(dataModel.json())

			query = requests.post(
				"http://dataports.prodevelop.es:1880/notification_vpf", data=dataModel.json())
			# response = query.text
			print('--------------- RESPONSE TO NODE-RED ------------------')
			# print('response: ', response)
			print('response: ', query)

			sendNotification(
				'SUCCESS', 'Agent execution ends.', dataModel.json())
	except Exception as ex:
		print('ERROR: ', ex.args)
		sendNotification('ERROR', ex.args, '')


def on_channel_open(channel):

	try:

		print('Channel consuming queue')
		# Queue for VPF
		channel.basic_consume('${pythonTemplate.data.mqtt_queue}',
							  queue1_callback, auto_ack=True)
		# channel.basic_consume('ais_palma', queue2_callback, auto_ack = True)

	except Exception as ex:
		print('ERROR: ', ex.args)
		sendNotification('ERROR', ex.args, '')


def on_open(connection):

	try:

		print('Method on_open')

		connection.channel(on_open_callback=on_channel_open)
		# connection.channel(on_channel_open)

	except Exception as ex:
		print('ERROR: ', ex.args)
		sendNotification('ERROR', ex.args, '')


def main():

	try:

		print('Establish connection to the RabbitMQ Server')

		credentials = pika.PlainCredentials('${pythonTemplate.data.mqtt_user}', '${pythonTemplate.data.mqtt_password}')
		parameters = pika.ConnectionParameters(
			'${pythonTemplate.data.mqtt_host}', ${pythonTemplate.data.mqtt_port}, '/', credentials)
		connection = pika.SelectConnection(
			parameters=parameters, on_open_callback=on_open)

		connection.ioloop.start()

	except KeyboardInterrupt as ex:
		print('ERROR: ', ex.args)
		sendNotification('ERROR', ex.args, '')
		print('CLOSE THE CONNECTION')
		connection.close()
		print('START A NEW CONNECTION')
		connection.ioloop.start()
	except Exception as ex:
		print('ERROR: ', ex.args)
		sendNotification('ERROR', ex.args, '')


if __name__ == '__main__':
	# ---  EXECUTE THE MAIN FUNCTION ---
	main()
