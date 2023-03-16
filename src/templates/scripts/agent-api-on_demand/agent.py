#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime as dt
from datetime import timezone

from pyngsi.ngsi import DataModel

from pyngsi.utils.iso8601 import datetime_to_iso8601

import requests

from constants import API_URL, RANDOM_ID, PRIVATE_REPOSITORY, PROJECT_NAME_PRIVATE_REPOSITORY, LINK_PRIVATE_REPOSITORY, URL_PUBLIC_REPOSITORY, CALLBACK_URL

import os
import sys
import json

import jsonschema
from jsonschema import validate

import logging
import traceback
import urllib.parse
logging.basicConfig(level="INFO",
                    format='%(asctime)s.%(msecs)03d %(levelname)s %(module)s - %(funcName)s: %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S',
                    )
# TODO: adjust agentName that will be displayed in logs
logger = logging.getLogger('agentName')


def validate_json_schema(json_data):

    try:

        is_private_repository = PRIVATE_REPOSITORY

        if is_private_repository:
            # PRIVATE REPOSITORY. GIT
            is_valid, msg = validate_json_schema_from_private_repository(
                json_data)
        else:
            # PUBLIC REPOSITORY. FIWARE
            is_valid, msg = validate_json_schema_from_public_repository(
                json_data)
        return is_valid, msg

    except Exception as ex:
        error = f'An error ocurred while validating the schema'
        logger.exception(error)
        send_notification('ERROR', error, json.dumps(
            {"error": str(ex), "stack": traceback.format_exc()}))


def validate_json_schema_from_private_repository(json_data):

    try:

        # BUILD JSON OBJECT TO OBTAIN JSON SCHEMA
        data = {
            'projectName': PROJECT_NAME_PRIVATE_REPOSITORY,
            'link': LINK_PRIVATE_REPOSITORY
        }

        json_schema = requests.post(
            f"{API_URL}/dataModel/getSchema", data=data)

        validate(instance=json_data, schema=json_schema)

    except jsonschema.exceptions.SchemaError as e:
        error = f'here is an error with the schema'
        logger.exception(error)
    except jsonschema.exceptions.ValidationError as err:
        error = "Given JSON data is invalid." + str(err)
        logger.exception(error)
        return False, err
    except Exception as ex:
        error = f'An error ocurred while validating the schema'
        logger.exception(error)
        send_notification('ERROR', error, json.dumps(
            {"error": str(ex), "stack": traceback.format_exc()}))

    message = "Given JSON data is valid"
    return True, message


def validate_json_schema_from_public_repository(json_data):

    try:

        schema_not_valid = True
        url_public_repository = URL_PUBLIC_REPOSITORY

        json_schema = requests.get(url_public_repository).json()

        validator = jsonschema.Draft7Validator(json_schema)
        errors = validator.iter_errors(json_data)  # get all validation errors
        for error in errors:
            schema_not_valid = False
            logger.error(error)

    except jsonschema.exceptions.SchemaError:
        error = f'here is an error with the schema'
        logger.exception(error)
    except jsonschema.exceptions.ValidationError as err:
        error = "Given JSON data is invalid." + str(err)
        logger.exception(error)
        return False, err
    except Exception as ex:
        error = f'An error ocurred while validating the schema'
        logger.exception(error)
        send_notification('ERROR', error, json.dumps(
            {"error": str(ex), "stack": traceback.format_exc()}))

    message = "Given JSON data is valid"
    return schema_not_valid, message


def convert_to_iso8601(date_object):
    """ Function to convert dateTime to string in format date-time ISO8601 """

    year = date_object.year
    month = date_object.month
    day = date_object.day
    hour = date_object.hour
    minute = date_object.minute
    second = date_object.second

    date_utc = dt(year, month, day, hour, minute, second, tzinfo=timezone.utc)

    return datetime_to_iso8601(date_utc)

# Old implementation before to use Cygnus


def build_entity(register):

    try:

        # property register will contain all the fields returned by the API
        # the developer must analyse the data in order to fulfill the Data Model

        # id of the Data Model must follow this pattern: 'urn:ngsi-ld:DataSource:' and the name of DataModel.
        m = DataModel(id='urn:ngsi-ld:DataSource:parameter_TypeDataModel',
                      type='parameter_TypeDataModel')
        # Property dataProvider must be a string witht the provider of the data
        m.add("dataProvider", 'parameter_dataProvider')
        # Add as much property as were necessary following the following syntax
        parameter_dataModel

        return m

    except Exception as ex:
        error = f'Error building entity'
        logger.exception(error)
        send_notification('ERROR', error, json.dumps(
            {"error": str(ex), "stack": traceback.format_exc(), "data": register}))

    return None


def build_entity_cygnus(row):

    try:

        # Returns a datetime object containing the local date and time
        date_time_obj = dt.now()
        current_time = date_time_obj.timestamp()

        # We have to read the row object. Next line is an example
        # coord = row['coord']

        # next line is an example of id of the data model
        id_data_model = 'urn:ngsi-ld:parameter_TypeDataModel:' + \
            str(coord['lat']) + ':' + str(coord['lon'])

        # next lines are example of how to work with OpenWeather as third-party API
        main = row['main']
        pressure = main['pressure']
        humidity = main['humidity']
        temp_min = main['temp_min']
        temp_max = main['temp_max']

        return {
            "id": id_data_model,
            "type": 'parameter_TypeDataModel'
            # Commented lines are an example of how to fulfill the object that will be sended to Cygnus
            # "dateObserved": "2016-11-30T07:00:00.00Z",
            # "pressure": {
            #    "type": "number",
            #    "metadata": {},
            #    "value": pressure
            # },
            # "humidity": {
            #    "type": "number",
            #    "metadata": {},
            #    "value": humidity
            # }
        }

    except Exception as ex:
        error = f'Error building entity'
        logger.exception(error)
        send_notification('ERROR', error, json.dumps(
            {"error": str(ex), "stack": traceback.format_exc(), "data": row}))

    return None


def execute_query():
    """ Method that requests data to an external URL and returns it. If the call fails, None is returned"""

    # Example of API URL. Next line it's only an example of how to do it
    # response = requests.get("https://api.openweathermap.org/data/2.5/weather?id=255274&appid=" + APIKEY_OPEN_WEATHER + "&units=metric").json()
    response = requests.get("parameter_urlAPI")
    if response.text != None:
        decoded_data = response.text.encode().decode('utf-8-sig')
        return json.loads(decoded_data)
    else:
        return None


def send_notification(notification_type, message_text, message_sent):

    try:
        # RANDOM_ID is a unique identifier that allow notifications to be linked to the container they belong to
        random_id = urllib.parse.quote(
            os.getenv("RANDOM_ID", RANDOM_ID), safe='')

        query_info = requests.get(f"{API_URL}/info/{random_id}")

        logger.debug(f'answer from /info: {query_info.text}')

        response_dict = json.loads(query_info.text)
        message = response_dict['message']

        container_name = message['container_name']

        data = {
            "id": container_name,
            "type": notification_type,
            "message": message_text,
            "register": message_sent
        }
        # Next line is for Windows deployment
        query = requests.post(f'{API_URL}/notification', data=data)

        # extracting response text
        response = query.text
        logger.debug(f'response from /notification: {response}')
        return container_name
    except Exception:
        logger.exception(
            f'Could not send notification with payload:\ntype="{notification_type}"\nmessage="{message_text}"\ndata={message_sent}"')


def main():
    """ Method that runs the import logic"""

    try:

        send_notification(
            'SUCCESS', 'Agent execution begins.', '')

        array_json = []

        head = {"Content-Type": "application/json",
                "Accept": "application/json"}

        response = execute_query()
        data_model = build_entity_cygnus(response)

        if data_model != None:
            total_count = 0
            counter = 0

            # === on-demand
            array_json = []
            for item in data_model:
                entity = build_entity_cygnus(item)
                if entity == None:
                    # None indicates that the registry could not be mapped
                    continue
                array_json.append(entity)
                counter += 1
                total_count += 1

                # fargment the data in batches of N elements when sending to Cygnus
                if counter >= 25:
                    requests.post(
                        f'{API_URL}/cygnus', json=array_json, headers=head)
                    logger.debug('Block of 25 messages sent')
                    counter = 0
                    array_json = []

            if counter != 0:
                # -- FOR SENDING THE LAST BLOCK --
                response = requests.post(
                    f'{API_URL}/cygnus', json=array_json, headers=head)

                logger.debug(f'Block of {len(array_json)} messages sent.')

        # append dataModel object to the arrayJson variable
        array_json.append(data_model)

        # Next line is for Linux deployment
        requests.post(
            f'{API_URL}/cygnus', json=array_json, headers=head)

        # -------- SEND INFORMATION ABOUT THE COLLECTION ON CYGNUS --------
        cygnus_id = data_model['id']
        cygnus_type = data_model['type']
        name_cygnus_collection = 'col_/_' + cygnus_id + '_' + cygnus_type
        data_cygnus = {
            "id": cygnus_id,
            "type": cygnus_type,
            "cygnus_collection": name_cygnus_collection,
            "cygnus_database": "db_default",
            "total": total_count
        }

        # INFO about cygnus for ICCS API
        query_info_to_cygnus = requests.post(
            f'{API_URL}/cygnusInformation', data=data_cygnus)
        send_notification(
            'SUCCESS', f'Imported {len(array_json)} records', '')
        logger.debug(
            f'Data send to cygnus returned {query_info_to_cygnus.status_code} and answered {query_info_to_cygnus.text}')

        send_notification(
            'SUCCESS', 'Agent execution ends.', array_json)

        stop_container_execution()

    except Exception as ex:
        error = f'An error ocurred while processing importing data'
        logger.exception(error)
        send_notification('ERROR', error, json.dumps(
            {"error": str(ex), "stack": traceback.format_exc()}))


def stop_container_execution():

    container_name = send_notification('SUCCESS', 'Agent execution ends.', '')
    logger.info(f'Stopping container {container_name}')

    # DELETE THE REGISTER THAT ASSOCIATES RANDOM_ID WITH THE NAME OF THE CONTAINER
    # RANDOM_ID is a unique identifier that allow notifications to be linked to the container they belong to
    random_id = os.getenv("RANDOM_ID", RANDOM_ID)

    # Next line is for Linux deployment
    query_delete_info = requests.delete(
        f'{API_URL}/info/{urllib.parse.quote(random_id, safe="")}')
    logger.info(
        f'Removed association of container {container_name} to id {random_id}. Response: {query_delete_info.text}')

    logger.info(f'Managing on-demand container {container_name}')
    query_stop_on_demand = requests.patch(
        f'{API_URL}/notification/manageOnDemandContainers/{container_name}')
    logger.info(f'Container stopped with result {query_stop_on_demand.text}')


if __name__ == '__main__':
    lon = len(sys.argv)  # Length of input variables

    # ----- SELECT CALLBACK URL -------
    if lon > 1:
        callback_url = sys.argv[1]
    else:
        callback_url = os.getenv("CALLBACK_URL", CALLBACK_URL)

    main()
