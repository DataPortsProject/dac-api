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

def build_entity(register):

    #property register will contain all the fields returned by the API
    # the developer must analyse the data in order to fulfill the Data Model

    #id of the Data Model must follow this pattern: 'urn:ngsi-ld:DataSource:' and the name of DataModel.
    m = DataModel(id='urn:ngsi-ld:DataSource:parameter_TypeDataModel', type='parameter_TypeDataModel')
    #Property dataProvider must be a string witht the provider of the data
    m.add("dataProvider", 'parameter_dataProvider')
    #Add as much property as were necessary following the following syntax
    parameter_dataModel
    
    return m

def executeQuery():
    # Example of API URL. Next line it's only an example of how to do it
    #response = requests.get("https://api.openweathermap.org/data/2.5/weather?id=255274&appid=" + APIKEY_OPEN_WEATHER + "&units=metric").json()
    response = requests.get("parameter_urlAPI").json()

    return response

def main():
    #SEND DATA TO CALLBACK URL
    # sink = SinkStdout()
    arrayJson = []
    for i in [0, 1]:
        response = executeQuery()
        print(response)
        dataModel = build_entity(response)
        arrayJson.append(dataModel)
        
    #SEND DATA TO CALLBACK URL IN JSON FORMAT
    requests.post(callback_url, json=arrayJson)

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
