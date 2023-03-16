#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime as dt
from datetime import timezone

from pyngsi.sink import SinkOrion
from pyngsi.ngsi import DataModel

from pyngsi.utils.iso8601 import datetime_to_iso8601

import requests
import time

import schedule

from constants import API_URL, BASE_URL, LINK_PRIVATE_REPOSITORY, PRIVATE_REPOSITORY, PROJECT_NAME_PRIVATE_REPOSITORY, \
    URL_PUBLIC_REPOSITORY, RANDOM_ID, TIME_INTERVAL, TIME_UNIT, switch

import os
import sys
import json

import jsonschema
from jsonschema import validate

import logging
import urllib.parse
import traceback
logging.basicConfig(level="INFO",
                    format='%(asctime)s.%(msecs)03d %(levelname)s %(module)s - %(funcName)s: %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S',
                    )
# TODO: define the agentName that will be displayed in logs
logger = logging.getLogger(f'agentName')
sink = SinkOrion(BASE_URL, 1026)


def validate_json_schema(json_data):
    """ Function that validates data against a jsonSchema """

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


def build_entity(item) -> DataModel:
    """
    Function that receives an input object and returns a DataModel with mapped fields
    If an error occurs mapping data, None should be returned
    """
    try:

        # TODO: adjust the id pattern here
        m = DataModel(id='urn:ngsi-ld:parameter_TypeDataModel',
                      type='parameter_TypeDataModel')
        # Property dataProvider must be a string witht the provider of the data
        m.add("dataProvider", 'parameter_dataProvider')
        # Add as much property as were necessary following the following syntax
        # TODO: verify these mappings are correct
        parameter_dataModel
        return m

    except Exception as ex:
        error = f'Failed mapping row with data {json.dumps(item)}'
        logger.exception(error)
        send_notification(
            'ERROR', error, json.dumps({"error": str(ex), "stack": traceback.format_exc(), "row": item}))

    return None


def execute_query():
    """
    Method that calls the external API and returns an array with data
    """

    # Example of API URL. Next line it's only an example of how to do it
    # response = requests.get("https://api.openweathermap.org/data/2.5/weather?id=255274&appid=" + APIKEY_OPEN_WEATHER + "&units=metric").json()
    # TODO: if the expternal API requires query params or special headers, add here
    response = requests.get("parameter_urlAPI")
    values = []
    if response.text != None:
        decoded_data = response.text.encode().decode('utf-8-sig')
        # TODO: if endpoint already returns an array, adjust the following line
        values.append(json.loads(decoded_data))
    return values


def send_notification(notification_type, message_text, message_sent):
    """
    Helper function that sends a notification to the DAC.
    """

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


def push_orion(entity):
    """ Method that writes data to Orion broker"""
    sink.write(entity.json())


def create_ps_entities():
    """ Method that is executed periodically to gather data from the remote API"""
    try:

        send_notification(
            'SUCCESS', 'Agent execution begins.', '')

        json_response = execute_query()
        if json_response == None or len(json_response) == 0:
            logger.warning('No data received')
        else:
            logger.info(f'Received {len(json_response)} elements')

            sent = 0
            failed = 0
            for item in json_response:
                entity = build_entity(item)
                if entity is not None:
                    push_orion(entity)
                    sent += 1
                else:
                    failed += 1
            send_notification(
                'SUCCESS', f'Agent execution ended successfully. {sent} registries imported, {failed} registries failed', '')

    except Exception as ex:
        logger.exception('The agent finished with error')
        send_notification('ERROR', 'Agent execution failed',
                          json.dumps({"error": str(ex), "stack": traceback.format_exc()}))


def main():
    try:
        with switch(unit) as s:
            if s.case('SECONDS', True):
                schedule.every(int(time_interval)).seconds.do(
                    create_ps_entities)
            if s.case('MINUTES', True):
                schedule.every(int(time_interval)).minutes.do(
                    create_ps_entities)
            if s.case('HOURS', True):
                schedule.every(int(time_interval)).hours.do(create_ps_entities)
            if s.case('DAYS', True):
                schedule.every(int(time_interval)).days.do(create_ps_entities)
            if s.default():
                schedule.every(int(time_interval)).days.do(create_ps_entities)

        while True:
            schedule.run_pending()
            time.sleep(1)

    except Exception as ex:
        error = 'The agent failed on its execution'
        logger.exception(error)
        send_notification('ERROR', error,
                          json.dumps({"error": str(ex), "stack": traceback.format_exc()}))


if __name__ == '__main__':
    # ---  LOAD THE ENVIRONMENTAL VARIABLES ---

    lon = len(sys.argv)  # Length of input variables

    # ----- SELECT TIME INTERVAL -------
    if lon > 1:
        time_interval = sys.argv[1]
    else:
        time_interval = os.getenv("TIME_INTERVAL", TIME_INTERVAL)

    # ----- SELECT TIME UNIT -------
    if lon > 2:
        unit = sys.argv[2]
    else:
        unit = os.getenv("TIME_UNIT", TIME_UNIT)

    # -- copy the above code if you want to add more environmental variables.
    # -- these variables must be written with upper case and also in the constants.py. (See TIME_INTERVAL and TIME_UNIT).

    # ---  EXECUTE THE MAIN FUNCTION ---
    main()
