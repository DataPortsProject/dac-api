#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime as dt
from datetime import timezone

from pyngsi.agent import NgsiAgent
from pyngsi.sources.source import Row, Source
from pyngsi.sources.source_json import SourceJson

from pyngsi.sink import SinkOrion, SinkStdout
from pyngsi.ngsi import DataModel

from pyngsi.utils.iso8601 import datetime_to_iso8601

import requests
import time

from constants import *

import os
import sys
import json

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
        print('TOTAL DE ERRORES', errors)
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

#Old implementation before to use Cygnus
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

        #is_valid, msg = ValidateJsonSchema(m)

    except Exception as ex:
        print('ERROR: ',ex.args)
        sendNotification('ERROR', ex.args, '')
    
    return m

def build_entity_cygnus(row):

  try:
    
    # Returns a datetime object containing the local date and time
    dateTimeObj = dt.now()
    currentTime = dateTimeObj.timestamp()

    #We have to read the row object. Next line is an example
    #coord = row['coord']

    #next line is an example of id of the data model
    id_DataModel = 'urn:ngsi-ld:DataSource:parameter_TypeDataModel:' + str(coord['lat']) + ':' + str(coord['lon'])

    #next lines are example of how to work with OpenWeather as third-party API
    main = row['main']
    pressure = main['pressure']
    humidity = main['humidity']
    temp_min = main['temp_min']
    temp_max = main['temp_max']
    
    data = {
      "id": id_DataModel,
      "type": 'parameter_TypeDataModel'
      #Commented lines are an example of how to fulfill the object that will be sended to Cygnus
      #"dateObserved": "2016-11-30T07:00:00.00Z",
      #"pressure": {
      #    "type": "number",
      #    "metadata": {},
      #    "value": pressure
      #},
      #"humidity": {
      #    "type": "number",
      #    "metadata": {},
      #    "value": humidity
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

def executeQuery():

    try:

        # Example of API URL. Next line it's only an example of how to do it
        #response = requests.get("https://api.openweathermap.org/data/2.5/weather?id=255274&appid=" + APIKEY_OPEN_WEATHER + "&units=metric").json()
        response = requests.get("parameter_urlAPI").json()

    except Exception as ex:
        print('ERROR: ',ex.args)
        sendNotification('ERROR', ex.args, '')

    return response

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
    
def main():

    try:

        container_name = ''

        container_name = sendNotification('SUCCESS', 'Agent execution begins.', '')

        arrayJson = []

        head = {"Content-Type": "application/json", "Accept": "application/json"}

        response = executeQuery()
        print(response)
        #dataModel = build_entity(response)
        dataModel = build_entity_cygnus(response)
        #append dataModel object to the arrayJson variable
        arrayJson.append(dataModel)
        
        #SEND DATA TO CYGNUS URL IN JSON FORMAT
        print('-----------------------------------------------------------')
        print('data', arrayJson)
        print('-----------------------------------------------------------')
        #Next line is for Windows deployment
        #query_result = requests.post('http://host.docker.internal:3000/cygnus', json= arrayJson, headers=head)

        #Next line is for Linux deployment
        query_result = requests.post('http://172.17.0.1:3000/cygnus', json= arrayJson, headers=head)
        print('---- Envio ----', query_result.text)

        #-------- SEND INFORMATION ABOUT THE COLLECTION ON CYGNUS --------
        cygnus_id = dataModel['id']
        cygnus_type = dataModel['type']
        name_cygnus_collection = 'col_/_' + cygnus_id + '_' + cygnus_type
        data_Cygnus = {
            "id": cygnus_id,
            "type": cygnus_type,
            "cygnus_collection": name_cygnus_collection,
            "cygnus_database": "db_default",
            "total": 1
        }

        #INFO about cygnus for ICCS API
        #Next line is for Windows deployment
        #query_infoToCygnus = requests.post('http://host.docker.internal:3000/cygnusInformation', data = data_Cygnus)

        #Next line is for Linux deployment
        query_infoToCygnus = requests.post("http://172.17.0.1:3000/cygnusInformation", data = data_Cygnus)
        print('---- Envio Info To Cygnus ----', query_infoToCygnus.text)


        container_name = sendNotification('SUCCESS', 'Agent execution ends.', arrayJson)
        print('NOMBRE CONTENEDOR', container_name)

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
        #query_stop_on_demand = requests.patch("http://host.docker.internal:3000/notification/manageOnDemandContainers/" + container_name)

        #Next line is for Linux deployment
        query_stop_on_demand = requests.patch("http://172.17.0.1:3000/notification/manageOnDemandContainers/" + container_name)
        print('---- Contenedor parado ----', query_stop_on_demand.text)
    
    except Exception as ex:
        print('ERROR: ',ex.args)
        #print(type(ex))
        #print(ex)
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
