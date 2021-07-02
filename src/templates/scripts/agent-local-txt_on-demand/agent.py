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

#Class defined to map the objects to be read from the txt file.
#As many properties as necessary will be defined, indicating the type of each one of them.
class TxtClass:
  property_1: int = 0
  property_2: int = 0

  def from_txt(line, delimiter=' '):
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

    return cls

def build_entity(row: Row) -> DataModel:
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

  return m

def main():
  print("Let's read the local file")
  src = Source.from_file("parameter_filePath")

  arrayJson = []

  #There are two options for sending data to the callback url.

  #1st send all data in one post request (lines 75 to 80)
  #2nd send data after each iteration of the data source (lines 83 to 85)
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