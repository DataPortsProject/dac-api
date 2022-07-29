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

import base64

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

        schema_not_valid = True
        urlPublicRepository = URL_PUBLIC_REPOSITORY

        jsonSchema = requests.get(urlPublicRepository).json()
        #schemaObtained = json.load(jsonSchema)

        #validate(instance=json_data, schema=jsonSchema)
        validator = jsonschema.Draft7Validator(jsonSchema)
        errors = validator.iter_errors(json_data) #get all validation errors
        print('--------------------------------------------------------------------------------------------------------------')
        print('TOTAL ERRORS', errors)
        print('--------------------------------------------------------------------------------------------------------------')
        for error in errors:
          schema_not_valid = False
          print('-------')
          print(error)
          print('-------')

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
    return schema_not_valid, message

#Class defined to map the objects to be read from the txt file
#As many properties as necessary will be defined, indicating the type of each one of them
class ExcelProperties:
  property_1: str = ''
  property_2: str = ''

  def from_excel(line, delimiter=';'):

    try:

      cls = ExcelProperties()

      if line[0] == delimiter:
        print('First line incorrect')
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

#function to build the data model (old implementation before to use Cygnus)
def build_entity(row):

  try:

    sendNotification('SUCCESS', 'Agent execution begins.', '')

    container_name = ''

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
  
  container_name = sendNotification('SUCCESS', 'Agent execution ends.', m.json())

  #Lines responsible for deleting on-demand containers
  #Next line is for Windows deployment
  #query_stop_on_demand = requests.patch("http://host.docker.internal:3000/notification/manageOnDemandContainers/" + container_name)

  #Next line is for Linux deployment
  query_stop_on_demand = requests.patch("http://172.17.0.1:3000/notification/manageOnDemandContainers/" + container_name)

  return m

#new method for sending data to Cygnus
def build_entity_cygnus(row):

  try:

    #print('Row',row)
    #print('Record',row.record)
    
    # Returns a datetime object containing the local date and time
    dateTimeObj = dt.now()
    currentTime = dateTimeObj.timestamp()

    ExcelPropertiesObject: ExcelProperties = ExcelProperties.from_excel(row.record)
    #Example of recover properties from the excel file
    #Vessel_property = ExcelPropertiesObject.vessel
    #Status_property = ExcelPropertiesObject.status


    data = {
      "id": 'urn:ngsi-ld:DataSource:parameter_TypeDataModel',
      "type": 'parameter_TypeDataModel'#,
      #properties follow this structure (will be completed by the developer)
      #"precipitation": {
      #    "type": "number",
      #    "metadata": {},
      #    "value": ExcelPropertiesObject.property_1
      #}
    }

    #is_valid, msg = ValidateJsonSchema(data)
    #print('--- Validate JSON Schema ---')
    #print(is_valid)
    #print(msg)

  except Exception as ex:
    print('ERROR: ',ex.args)
    sendNotification('ERROR', ex.args, '')

  return data

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
            "message": messageText,
            "register": messageSended
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

    return container_name

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

    container_name = ''
    container_name = sendNotification('SUCCESS', 'Agent execution begins.', '')

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

    arrayJson = []

    head = {"Content-Type": "application/json", "Accept": "application/json"}

    count = 0
    aux_dataModel = ''
    iterator = 0

    for row in src:
      #print(row)
      #dataModel = build_entity(row)
      dataModel = build_entity_cygnus(row)
      aux_dataModel = dataModel
      #append dataModel object to the arrayJson variable
      arrayJson.append(dataModel)
      iterator +=1
      count +=1
      res = count % 100

      if res == 0:
        #requests.post(callback_url, json=arrayJson, headers=head)
        print('-----------------------------------------------------------')
        print('data', arrayJson)
        print('-----------------------------------------------------------')
        #Next line is for Windows deployment
        #query_result = requests.post('http://host.docker.internal:3000/cygnus', json= arrayJson, headers=head)

        query_result = requests.post('http://172.17.0.1:3000/cygnus', json= arrayJson, headers=head)
        print('---- Envio ----', query_result.text)
        container_name = sendNotification('SUCCESS', 'Block of ' + str(len(arrayJson)) + ' messages sent.', json.dumps(arrayJson))
        count = 0
        arrayJson = []

    if count != 0:
      print('-----------------------------------------------------------')
      res = {  "data": arrayJson }
      print(res)
      print('-----------------------------------------------------------')
      #Para enviar el último bloque
      #Next line is for Windows deployment
      #query_result = requests.post('http://host.docker.internal:3000/cygnus', json= arrayJson, headers=head)
      query_result = requests.post('http://172.17.0.1:3000/cygnus', json= arrayJson, headers=head)
      print('---- Envio ----', query_result.text)
      container_name = sendNotification('SUCCESS', 'Block of ' + str(len(arrayJson)) + ' messages sent.', json.dumps(arrayJson))
    
    #-------- SEND INFORMATION ABOUT THE COLLECTION ON CYGNUS --------
    #print('analyse dataModel')
    #print(aux_dataModel)
    cygnus_id = aux_dataModel['id']
    cygnus_type = aux_dataModel['type']
    name_cygnus_collection = 'col_/_' + cygnus_id + '_' + cygnus_type
    data_Cygnus = {
      "id": cygnus_id,
      "type": cygnus_type,
      "cygnus_collection": name_cygnus_collection,
      "cygnus_database": "db_default",
      "total": iterator
    }

    #INFO about cygnus for ICCS API
    #Next line is for Windows deployment
    #query_infoToCygnus = requests.post('http://host.docker.internal:3000/cygnusInformation', data = data_Cygnus)

    query_infoToCygnus = requests.post("http://172.17.0.1:3000/cygnusInformation", data = data_Cygnus)
    print('---- Envio Info To Cygnus ----', query_infoToCygnus.text)

    os.remove('./' + fileNameModified)

    container_name = sendNotification('SUCCESS', 'Agent execution ends.', '')
    print(container_name)

    #DELETE THE REGISTER THAT ASSOCIATES RANDOM_ID WITH THE NAME OF THE CONTAINER
    #RANDOM_ID is a unique identifier that allow notifications to be linked to the container they belong to
    random_ID = os.getenv("RANDOM_ID", RANDOM_ID)
    #Next line is for Windows deployment
    #query_deleteInfo = requests.delete("http://host.docker.internal:3000/info/" + random_ID)
    #Next line is for Linux deployment
    query_deleteInfo = requests.delete("http://172.17.0.1:3000/info/" + random_ID)
    print('---- Remove association container to random_id ----', query_deleteInfo.text)

    #Lines responsible for deleting on-demand containers
    print('--------------------------------------------------------------------------------------------------------------')
    print("------------------------------------ LET'S MANAGE THE ON-DEMAND CONTAINER ------------------------------------")
    #Next line is for Windows deployment
    #query_stop_on_demand = requests.patch("http://host.docker.internal:3000/notification/manageOnDemandContainers/" + random_ID)
    query_stop_on_demand = requests.patch("http://172.17.0.1:3000/notification/manageOnDemandContainers/" + container_name)
    print('---- Contenedor parado ----', query_stop_on_demand.text)

  except Exception as ex:
    print('ERROR: ',ex.args)
    sendNotification('ERROR', ex.args, '')

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