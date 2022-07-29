#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime as dt
from datetime import timezone

import pandas as pd

import xlrd
import openpyxl

from pyngsi.agent import NgsiAgent
from pyngsi.sources.source import Row, Source
from pyngsi.sink import SinkOrion, SinkStdout
from pyngsi.ngsi import DataModel

from pyngsi.utils.iso8601 import datetime_to_iso8601

from pyngsi.sources.more_sources import SourceMicrosoftExcel
from pyngsi.scheduler import Scheduler, UNIT

from constants import *

import os
import sys
import shutil
import threading
import requests
import csv
import json

import time

import jsonschema
from jsonschema import validate

def ValidateJsonSchema(json_data):

    try:

        isPrivateRepository = PRIVATE_REPOSITORY

        if isPrivateRepository:
            # PRIVATE REPOSITORY. GIT
            print('private repository')
            is_valid, msg = ValidateJsonSchema_PrivateRepository(json_data)
        else:
            # PUBLIC REPOSITORY. FIWARE
            is_valid, msg = ValidateJsonSchema_PublicRepository(json_data)

    except Exception as ex:
        print('ERROR: ',ex.args)
        sendNotification('ERROR', ex.args, '')

    print('IS VALID', is_valid)
    return is_valid, msg

def ValidateJsonSchema_PrivateRepository(json_data):

    try:

        #BUILD JSON OBJECT TO OBTAIN JSON SCHEMA
        data = {
          'projectName': PROJECT_NAME_PRIVATE_REPOSITORY,
          'link': LINK_PRIVATE_REPOSITORY
        }

        #Next line is for Windows deployment
        #query = requests.post("http://host.docker.internal:3000/dataModel/getSchema", data = data)

        #Next line is for Linux deployment
        jsonSchema = requests.post("http://172.17.0.1:3000/dataModel/getSchema", data = data)

        validate(instance=json_data, schema=jsonSchema)

    except jsonschema.exceptions.SchemaError as e:
        print(e)
        print('There is an error with the schema')
    except jsonschema.exceptions.ValidationError as err:
        print(err)
        #print('----------------')
        #print(err.absolute_path)
        #print('----------------')
        #print(err.absolute_schema_path)
        errmsg = "Given JSON data is invalid." + str(err)
        return False, err
    except Exception as ex:
        print('ERROR: ',ex.args)
        sendNotification('ERROR', ex.args, '')

    message = "Given JSON data is valid"
    return True, message

def ValidateJsonSchema_PublicRepository(json_data):

    try:

        urlPublicRepository = URL_PUBLIC_REPOSITORY

        jsonSchema = requests.get(urlPublicRepository).json()
        #schemaObtained = json.load(jsonSchema)

        validate(instance=json_data, schema=jsonSchema)

    except jsonschema.exceptions.SchemaError as e:
        print(e)
        print('There is an error with the schema')
    except jsonschema.exceptions.ValidationError as err:
        print(err)
        #print('----------------')
        #print(err.absolute_path)
        #print('----------------')
        #print(err.absolute_schema_path)
        errmsg = "Given JSON data is invalid." + str(err)
        return False, err
    except Exception as ex:
        print('ERROR: ',ex.args)
        sendNotification('ERROR', ex.args, '')

    message = "Given JSON data is valid"
    return True, message

#Class defined to map the objects to be read from the txt file
#As many properties as necessary will be defined, indicating the type of each one of them
class ExcelProperties:
  property_1: str = ''
  property_2: str = ''

  def from_excel(line, delimiter=';'):

    try:

      cls = ExcelProperties()

      if line[0] == delimiter:
        print('Primera linea incorrecta')
      fields = line.rstrip().split(delimiter)

      #property_1
      prop_1 = fields[0]
      cls.property_1 = removeCharacters(prop_1)

      #property_2
      prop_2 = str(fields[1])
      cls.property_2 = prop_2

    except Exception as ex:
      print('ERROR: ',ex.args)
      sendNotification('ERROR', ex.args, '')

    return cls

#function to build the data model
def build_entity(row:Row) -> DataModel:

  try:

    sendNotification('SUCCESS', 'Agent execution begins.', '')

    ExcelPropertiesObject: ExcelProperties = ExcelProperties.from_excel(row.record)

    #id of the Data Model must follow this pattern: 'urn:ngsi-ld:DataSource:' and the name of DataModel. Next line is an example
    m = DataModel(id='urn:ngsi-ld:DataSource:parameter_TypeDataModel', type='parameter_TypeDataModel')
    #Property dataProvider must be a string witht the provider of the data
    m.add("dataProvider", 'parameter_dataProvider')
    #Add as much property as were necessary following the following syntax
    parameter_dataModel

    #is_valid, msg = ValidateJsonSchema(m)

  except Exception as ex:
    print('ERROR: ',ex.args)
    sendNotification('ERROR', ex.args, '')
  
  sendNotification('SUCCESS', 'Agent execution ends.', m.json())

  return m

#Function to remove forbidden characters
def removeCharacters(data):

  try:

    forbiddenCharacters = ['<', '>', '"', "'", '=', ';', '(', ')']
    formattedData = ""
    for char in forbiddenCharacters:
      if isinstance(data, str):
        formattedData = data.replace(char, "")

  except Exception as ex:
    print('ERROR: ',ex.args)
    sendNotification('ERROR', ex.args, '')

  return formattedData

def sendNotification(notificationType, messageText, messageSended):

    try:

        #print('Method that sends notification to MongoDB. Could be successful or an error.')

        #RANDOM_ID is a unique identifier that allow notifications to be linked to the container they belong to
        random_ID = os.getenv("RANDOM_ID", RANDOM_ID)

        filter = {
            "random_id": random_ID,
            "time_interval": time_interval,
            "time_unit": unit
        }

        #------------------- STARTS OLD VERSION ---------------------------------
        #Next line is for Linux deployment
        #query_info = requests.get("http://172.17.0.1:3000/info/" + random_ID)
               
        #Next line is working locally
        #query_info = requests.get("http://127.0.0.1:3000/info/" + random_ID)
        
        #Next line is for Windows deployment
        #query_info = requests.get("http://host.docker.internal:3000/info/" + random_ID)
        #print('answer', query_info.text)
        
        #------------------- ENDS OLD VERSION ---------------------------------

        #---- new query that links random_id, cotainer and some parameters
        # Linux Deployment
        query_info = requests.post("http://172.17.0.1:3000/info/filtered", data = filter)
        #Next line is working locally
        #query_info = requests.post("http://127.0.0.1:3000/info/filtered", data = filter)
        #Next line is for Windows deployment
        #query_info = requests.post("http://host.docker.internal:3000/info/filtered", data = filter)
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

#Function to convert dateTime to string in format date-time ISO8601
def convertTo_ISO8601(dateObject):

    year = dateObject.year
    month = dateObject.month
    day = dateObject.day
    hour = dateObject.hour
    minute = dateObject.minute
    second = dateObject.second

    date_UTC = dt(year, month, day, hour, minute, second, tzinfo=timezone.utc)

    return datetime_to_iso8601(date_UTC)
    
#Function to recover the data from the Excel file
def main():

  try:

    print('Convert the excel file from csv to xlsx')
    path= 'parameter_filePath'

    arrPath = path.split('/')

    fileName = arrPath[1]
    arrfileName = fileName.split('.')

    fileNameModified = arrfileName[0] + '_processed.xlsx'

    # Convert csv to xlsx
    #Skiprows is the number of rows that are ommitted at the beggining of the document. Change this value!!
    df = pd.read_excel(path, skiprows=3)
    df.to_excel(fileNameModified, index=False)

    #Change the name of the sheet
    Source.register_extension('xlsx', SourceMicrosoftExcel, sheetname='Sheet1', ignore=3)

    src = SourceMicrosoftExcel('./' + fileNameModified)
    src = src.skip_header()

    # if you want to see the data in development time use the next line
    sink = SinkStdout()
    # Change the IP of the ORION and its port
    #sink = SinkOrion("parameter_urlORION", parameter_orionPORT)

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

    os.remove('./' + fileNameModified)

  except Exception as ex:
    print('ERROR: ',ex.args)
    sendNotification('ERROR', ex.args, '')

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
