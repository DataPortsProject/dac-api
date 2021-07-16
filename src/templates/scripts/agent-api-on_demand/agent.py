#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime as dt

from pyngsi.agent import NgsiAgent
from pyngsi.sources.source import Row, Source
from pyngsi.sources.source_json import SourceJson

from pyngsi.sink import SinkOrion, SinkStdout
from pyngsi.ngsi import DataModel

import requests
import time

from constants import *

import os
import sys
import json

def build_entity(register):

    try:

        #property register will contain all the fields returned by the API
        # the developer must analyse the data in order to fulfill the Data Model

        #id of the Data Model must follow this pattern: 'urn:ngsi-ld:DataSource:' and the name of DataModel.
        m = DataModel(id='urn:ngsi-ld:DataSource:parameter_TypeDataModel', type='parameter_TypeDataModel')
        #Property dataProvider must be a string witht the provider of the data
        m.add("dataProvider", 'parameter_dataProvider')
        #Add as much property as were necessary following the following syntax
        parameter_dataModel

    except Exception as ex:
        print('ERROR: ',ex.args)
        sendNotification('error', ex.args)
    
    return m

def executeQuery():

    try:

        # Example of API URL. Next line it's only an example of how to do it
        #response = requests.get("https://api.openweathermap.org/data/2.5/weather?id=255274&appid=" + APIKEY_OPEN_WEATHER + "&units=metric").json()
        response = requests.get("parameter_urlAPI").json()

    except Exception as ex:
        print('ERROR: ',ex.args)
        sendNotification('error', ex.args)

    return response

def sendNotification(notificationType, messageText):

    try:

        #print('Method that sends notification to MongoDB. Could be successful or an error.')

        #RANDOM_ID is a unique identifier that allow notifications to be linked to the container they belong to
        random_ID = os.getenv("RANDOM_ID", RANDOM_ID)
        #print('random_ID', random_ID)
        # IP --> 127.0.0.1 out of the platform (debug time)
        #query_info = requests.get("http://127.0.0.1:3000/info/" + random_ID)

        #Next line is for Windows deployment
        #query_info = requests.get("http://host.docker.internal:3000/info/" + random_ID)

        #Next line is for Linux deployment
        query_info = requests.get("http://172.17.0.1:3000/info/" + random_ID)

        #print('answer', query_info.text)
        response_dict = json.loads(query_info.text)
        message = response_dict['message']

        container_name = message['container_name']

        data = {
            "id": container_name,
            "type": notificationType,
            "message": messageText
            }
        
        #Next line is for Windows deployment
        #query = requests.post("http://host.docker.internal:3000/notification", data = data)

        #Next line is for Linux deployment
        query = requests.post("http://172.17.0.1:3000/notification", data = data)

        #extracting response text
        response = query.text
        print('response: ', response)

    except Exception as ex:
        print('ERROR: ',ex.args)

def main():

    try:

        sendNotification('success', 'Agent execution begins.')

        arrayJson = []

        #There are two options for sending data to the callback url.

        #1st send all data in one request (lines 113 to 120)
        #2nd send data after each iteration of the data source (lines 122 to 126)
        #Choose one of them and comment the other one
        
        for i in [0, 1]:
            response = executeQuery()
            print(response)
            dataModel = build_entity(response)
            arrayJson.append(dataModel)

        #SEND DATA TO CALLBACK URL IN JSON FORMAT
        requests.post(callback_url, json=arrayJson)

        for i in [0, 1]:
            response = executeQuery()
            print(response)
            dataModel = build_entity(response)
            requests.post(callback_url, json=dataModel)

        sendNotification('success', 'Agent execution ends.')
    
    except Exception as ex:
        print('ERROR: ',ex.args)
        #print(type(ex))
        #print(ex)
        sendNotification('error', ex.args)

if __name__ == '__main__':
    lon = len(sys.argv)#Length of input variables
    
    #print(lon)
    print(sys.argv[0])#we start counting from position 0

    #----- SELECT CALLBACK URL -------
    if lon > 1:
        #print('lon > 1')
        callback_url = sys.argv[1]
    else:
        #print('lon <= 1')
        callback_url = os.getenv("CALLBACK_URL", CALLBACK_URL)

    main()
