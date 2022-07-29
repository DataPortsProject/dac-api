#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pika

import json

import codecs

import requests

import os

from constants import *

def queue_callback(ch, method, properties, body):

  try:

    #print(" [x] Received queue 1: %r" % body)
    sendNotification('SUCCESS', 'Agent execution begins.', '')

    print(" Received queue : %r" % body)

  except Exception as ex:
    print('ERROR: ', ex.args)
    sendNotification('ERROR', ex.args, '')

def on_open(connection):

  try:

    print('Establish the connection')

    connection.channel(on_open_callback = on_channel_open)

  except Exception as ex:
    print('ERROR: ', ex.args)
    sendNotification('ERROR', ex.args, '')


def on_channel_open(channel):

  try:

    print('Connect to the channel')

    channel.basic_consume('parameter_rabbit_queue', queue_callback, auto_ack = True)
    #Add the above line calling a new function if the agent want to consume more than one queue.

  except Exception as ex:
    print('ERROR: ', ex.args)
    sendNotification('ERROR', ex.args, '')

def sendNotification(notificationType, messageText, messageSended):

  try:

    print('Method that sends notification to MongoDB. Could be successful or an error.')

    #RANDOM_ID is a unique identifier that allow notifications to be linked to the container they belong to
    random_ID = os.getenv("RANDOM_ID", RANDOM_ID)

    time_interval = os.getenv("TIME_INTERVAL", TIME_INTERVAL)
    unit = os.getenv("TIME_UNIT", TIME_UNIT)

    filter = {
      "random_id": random_ID,
      "time_interval": time_interval,
      "time_unit": unit
    }
    
    #---- new query that links random_id, cotainer and some parameters
    # Linux Deployment
    query_info = requests.post("http://172.17.0.1:3000/info/filtered", data = filter)
    #Next line is working locally
    #query_info = requests.post("http://127.0.0.1:3000/info/filtered", data = filter)
    #Next line is for Windows deployment
    #query_info = requests.post("http://host.docker.internal:3000/info/filtered", data = filter)
    #print('RESPUESTA A SI EXISTE UN OBJETO CON ESTAS CARACTERISTICAS')
    print('answer: ', query_info.text)
        
    response_dict = json.loads(query_info.text)
    #print('----------------------------')
    #print(response_dict)
    #print('----------------------------')
    message = response_dict['message'][0]
    #print('----------------------------')
    #print(message)
    #print('----------------------------')

    container_name = message['container_name']

    data = {
      "id": container_name,
      "type": notificationType,
      "message": messageText,
      "register": messageSended
    }
        
    #Next line is for Linux deployment
    query = requests.post("http://172.17.0.1:3000/notification", data = data)

    #Next line is for Windows deployment
    #query = requests.post("http://http://127.0.0.1:3000/notification", data = data)

    #Local Deployment
    #query = requests.post("http://host.docker.internal:3000/notification", data = data)

    #extracting response text
    response = query.text
    print('response: ', response)

  except Exception as ex:
    print('ERROR: ',ex.args)

def main():

  try:

    print('Agent establishes the parameters')

    credentials = pika.PlainCredentials('parameter_rabbit_user', 'parameter_rabbit_password')
    parameters = pika.ConnectionParameters('parameter_rabbit_server', parameter_rabbit_port, '/', credentials)
    connection = pika.SelectConnection(parameters = parameters, on_open_callback = on_open)

    connection.ioloop.start()

  except KeyboardInterrupt as ex:
    print('ERROR: ',ex.args)
    sendNotification('ERROR', ex.args, '')
    print('CLOSE THE CONNECTION')
    connection.close()
    print('START A NEW CONNECTION')
    connection.ioloop.start()

if __name__ == '__main__':
  #---  EXECUTE THE MAIN FUNCTION ---
  main()
