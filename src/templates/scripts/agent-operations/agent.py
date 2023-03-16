#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pyngsi.ngsi import DataModel
from pyngsi.sink import SinkOrion
from datetime import datetime as dt

import pika
import json
import requests
import os

from constants import RANDOM_ID, API_URL, BASE_URL, VESSEL_TYPE_0_TO_9, VESSEL_TYPE_52, VESSEL_TYPE_74, EVENT_TYPES, RABBIT_TOPIC_NAME

import logging
import urllib.parse
import traceback
logging.basicConfig(level="INFO",
                    format='%(asctime)s.%(msecs)03d %(levelname)s %(module)s - %(funcName)s: %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S',
                    )
logger = logging.getLogger(f'bpa_operations')

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


def get_vessel_type_description(vessel_type):
    if vessel_type in range(0, 10):
        return VESSEL_TYPE_0_TO_9
    if vessel_type == 52:
        return VESSEL_TYPE_52
    if vessel_type == 74:
        return VESSEL_TYPE_74

    return "NO_DESCRIPTION"


def get_event_type_description(event_type):
    try:
        return EVENT_TYPES[int(event_type)-1]
    except Exception:
        return f'UNKNOWN event {event_type}'


def build_data_model(json_msg) -> DataModel:
    try:

        port_authority_code = json_msg['autPor']
        port_code = json_msg['codPor']

        id_data_model = f'urn:ngsi-ld:Posidonia:OPE:{str(port_authority_code)}:{port_code}:{str(json_msg["aisSentence"]["mmsi"])}'

        m = DataModel(id=id_data_model, type="Posidonia")

        ${pythonTemplate.data.dataModelProperties}

        return m

    except Exception as ex:
        error = f'Failed creating the entity from the received data'
        logger.exception(error)
        send_notification(
            'ERROR', error, json.dumps({"error": str(ex), "stack": traceback.format_exc(), "data": json_msg}))

    return None


def queue1_callback(ch, method, properties, body):

    try:
        json_msg = json.loads(body)
        # Filtering by the exchange and the properties related to APB
        if method.exchange == 'topic_aisEventJson':
            sink = SinkOrion(BASE_URL, 1026)

            data_model = build_data_model(json_msg)
            if data_model != None:
                sink.write(data_model.json())

                requests.post(
                    "http://dataports.prodevelop.es:1880/notification_apb", data=data_model.json())

    except Exception as ex:
        error = f'Failed invoking "queue1_callback"'
        logger.exception(error)
        send_notification(
            'ERROR', error, json.dumps({"error": str(ex), "stack": traceback.format_exc()}))


def on_channel_open(channel):
    try:

        print('Channel consuming queue')
        # Queue for APB
        channel.basic_consume(RABBIT_TOPIC_NAME,
                              queue1_callback, auto_ack=True)

    except Exception as ex:
        error = f'"on_channel_open" callback failed for channel {channel}'
        logger.exception(error)
        send_notification(
            'ERROR', error, json.dumps({"error": str(ex), "stack": traceback.format_exc(), "data": {"channel": channel}}))


def on_open(connection):

    try:
        logger.debug('Invoking "on_open" callback')
        connection.channel(on_open_callback=on_channel_open)
    except Exception as ex:
        error = f'"on_open" callback failed'
        logger.exception(error)
        send_notification(
            'ERROR', error, json.dumps({"error": str(ex), "stack": traceback.format_exc()}))


def main():

    try:

        logger.info('Establishing connection to the RabbitMQ Server')

        credentials = pika.PlainCredentials('${pythonTemplate.data.mqtt_user}', '${pythonTemplate.data.mqtt_password}')
        parameters = pika.ConnectionParameters(
            '${pythonTemplate.data.mqtt_host}', ${pythonTemplate.data.mqtt_port}, '/', credentials)
        connection = pika.SelectConnection(
            parameters=parameters, on_open_callback=on_open)

        connection.ioloop.start()

    except KeyboardInterrupt as ex:
        error = f'Agent execution stopped manually'
        logger.exception(error)
        send_notification(
            'ERROR', error, json.dumps({"error": str(ex), "stack": traceback.format_exc()}))
        logger.debug('closing the connection')
        connection.close()
        logger.debug('starting a new connection')
        connection.ioloop.start()
    except Exception as ex:
        error = f'Agent execution finished with error'
        logger.exception(error)
        send_notification(
            'ERROR', error, json.dumps({"error": str(ex), "stack": traceback.format_exc()}))


if __name__ == '__main__':
    # ---  EXECUTE THE MAIN FUNCTION ---
    send_notification('SUCCESS', 'Agent execution starts', '')
    main()
