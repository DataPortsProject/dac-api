#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime as dt
from datetime import timezone

from pyngsi.agent import NgsiAgent
from pyngsi.sources.source import Row
from pyngsi.sources.source_mqtt import SourceMqtt
from pyngsi.sink import SinkStdout, SinkOrion
from pyngsi.ngsi import DataModel

from pyngsi.utils.iso8601 import datetime_to_iso8601

import requests

from constants import *

import os
import sys
import json

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

def build_entity(row: Row) -> DataModel:

    try:

        msg = row.record
        #input record will be a JSON
        payload = json.loads(msg)
        #print(payload)

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
    
    return m

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

        # IP --> 127.0.0.1 out of the platform (debug time)
        #query_info = requests.post("http://127.0.0.1:3000/info/filtered", data = filter)

        #Next line is for Windows deployment
        #query_info = requests.post("http://host.docker.internal:3000/info/filtered", data = filter)

        #Next line is for Linux deployment
        query_info = requests.post("http://172.17.0.1:3000/info/filtered", data = filter)
        
        print('answer', query_info.text)
        response_dict = json.loads(query_info.text)
        message = response_dict['message'][0]

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
    
def main():

    try:

        print('Establish connection to the MQTT Server')

        src = SourceMqtt(host="parameter_mqttHost",port=int(parameter_mqttPort),topic="parameter_mqttTopic")

        # if you want to see the data in development time use the next line
        sink = SinkStdout()
        # Change the IP of the ORION and its port
        #sink = SinkOrion("parameter_urlORION", parameter_orionPORT)

        agent = NgsiAgent.create_agent(src, sink, process=build_entity)
        agent.run()
        agent.close()

    except Exception as ex:
        print('ERROR: ',ex.args)
        #print(type(ex))
        #print(ex)
        sendNotification('ERROR', ex.args, '')

if __name__ == '__main__':
    #---  EXECUTE THE MAIN FUNCTION ---
    main()
