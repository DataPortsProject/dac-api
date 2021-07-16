#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime as dt

from pyngsi.sources.source import Row, Source
from pyngsi.sink import SinkStdout, SinkOrion
from pyngsi.ngsi import DataModel

from pyngsi.agent import NgsiAgent

from constants import *

import requests

import os
import sys
import json

#Class defined to map the objects to be read from the txt file.
#As many properties as necessary will be defined, indicating the type of each one of them.
class TxtClass:
  property_1: int = 0
  property_2: int = 0

  def from_txt(line, delimiter=' '):

    try:

      cls = TxtClass()

      if line[0] == delimiter:
        print('First line incorrect')
      fields = line.rstrip().split(delimiter)

      length = len(fields)
      i = 0
      strings = []

      while i <= length - 1:
        if fields[i] != '':
          strings.append(fields[i])
        i += 1
      
      #We assign the values we read from the txt to each of the properties of our class
      #The following lines are just an example of how the properties of the class should be filled in.
      cls.property_1 = float(strings[8])
      cls.property_2 = float(strings[9])
    
    except Exception as ex:
      print('ERROR: ',ex.args)
      sendNotification('error', ex.args)

    return cls

def build_entity(row: Row) -> DataModel:

  try:

    #print('Row',row)
    #print('Record',row.record)

    #properties variable shall contain all mapped fields of the txt file
    properties: TxtClass = TxtClass.from_txt(row.record)

    #id of the Data Model must follow this pattern: 'urn:ngsi-ld:DataSource:' and the name of DataModel.
    m = DataModel(id='urn:ngsi-ld:DataSource:parameter_TypeDataModel', type='parameter_TypeDataModel')
    #Property dataProvider must be a string witht the provider of the data
    m.add("dataProvider", 'parameter_dataProvider')

    #Add as much property as were necessary following the following syntax
    #m.add("property_1", properties.property_1) --> this is an example
    parameter_dataModel

  except Exception as ex:
    print('ERROR: ',ex.args)
    sendNotification('error', ex.args)

  return m

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

    print("Let's read the local file")
    src = Source.from_file("parameter_filePath")

    arrayJson = []

    #There are two options for sending data to the callback url.

    #1st send all data in one post request (lines 140 to 146)
    #2nd send data after each iteration of the data source (lines 148 to 152)
    #Choose one of them and comment the other one

    for row in src:
      dataModel = build_entity(row)
      #append dataModel object to the arrayJson variable
      arrayJson.append(dataModel)

    #SEND DATA TO CALLBACK URL IN JSON FORMAT
    requests.post(callback_url, json=arrayJson)

    for row in src:
      #build data model
      dataModel = build_entity(row)
      #Send data in json format
      requests.post(callback_url, json=dataModel)
    
    sendNotification('success', 'Agent execution ends.')

  except Exception as ex:
    print('ERROR: ',ex.args)
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