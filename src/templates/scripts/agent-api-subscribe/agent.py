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

from pyngsi.scheduler import Scheduler, UNIT

from constants import *

import os
import sys

def DataModel_response(register):

    #property register will contain all the fields returned by the API
    # the developer must analyse the data in order to fulfill the Data Model

    #id of the Data Model must follow this pattern: 'urn:ngsi-ld:DataSource:' and the name of DataModel.
    m = DataModel(id='urn:ngsi-ld:DataSource:parameter_TypeDataModel', type='parameter_TypeDataModel')
    #Property dataProvider must be a string witht the provider of the data
    m.add("dataProvider", 'parameter_dataProvider')
    #Add as much property as were necessary following the following syntax
    parameter_dataModel

    return m

def build_entity(row: Row) -> DataModel:
    register = row.record

    model = DataModel_response(register)

    return model

def executeQuery():
    # Example of API URL. Next line it's only an example of how to do it
    #response = requests.get("https://api.openweathermap.org/data/2.5/weather?id=255274&appid=" + APIKEY_OPEN_WEATHER + "&units=metric").json()
    response = requests.get("parameter_urlAPI").json()

    return response

def main():
    print('Process the data')

    print('Call the method responsible for make the query to the API')

    response = executeQuery()

    print('Create the source')
    # provider must be the name of the third-party API or a string to identify the API
    src = SourceJson(response, provider='parameter_dataProvider')
    # if you want to see the data in development time use the next line
    #sink = SinkStdout()
    # Change the IP of the ORION and its port
    sink = SinkOrion("parameter_urlORION", parameter_orionPORT)
    
    agent = NgsiAgent.create_agent(src, sink, process=build_entity)

    print('Frequency is:', unit)

    with switch(unit) as s:
        if s.case('SECONDS', True):
            scheduler = Scheduler(agent, interval=int(time_interval), unit=UNIT.seconds)
        if s.case('MINUTES', True):
            scheduler = Scheduler(agent, interval=int(time_interval), unit=UNIT.minutes)
        if s.case('HOURS', True):
            scheduler = Scheduler(agent, interval=int(time_interval), unit=UNIT.hours)
        if s.case('DAYS', True):
            scheduler = Scheduler(agent, interval=int(time_interval), unit=UNIT.days)
        if s.default():
            scheduler = Scheduler(agent, interval=int(time_interval), unit=UNIT.minutes)

    scheduler.run()

if __name__ == '__main__':
    #---  LOAD THE ENVIRONMENTAL VARIABLES ---
    
    lon = len(sys.argv)#Length of input variables
    
    #print(lon)
    #print(sys.argv[0])#we start counting from position 0

    #----- SELECT TIME INTERVAL -------
    if lon > 1:
        print('lon > 1')
        time_interval = sys.argv[1]
    else:
        print('lon <= 1')
        time_interval = os.getenv("TIME_INTERVAL", TIME_INTERVAL)

    #----- SELECT TIME UNIT -------
    if lon > 2:
        print('lon > 2')
        unit = sys.argv[2]
    else:
        print('lon <= 2')
        unit = os.getenv("TIME_UNIT", TIME_UNIT)

    #-- copy the above code if you want to add more environmental variables.
    #-- these variables must be written with upper case and also in the constants.py. (See TIME_INTERVAL and TIME_UNIT).
    
    #---  EXECUTE THE MAIN FUNCTION ---
    main()
