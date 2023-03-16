#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
#-- Environmental variables
TIME_INTERVAL = os.getenv('TIME_INTERVAL')
TIME_UNIT = os.getenv('TIME_UNIT')
RANDOM_ID = os.getenv('RANDOM_ID')
PRIVATE_REPOSITORY = parameter_isPrivateRepository
URL_PUBLIC_REPOSITORY = parameter_urlPublicRepository
PROJECT_NAME_PRIVATE_REPOSITORY = parameter_projectNamePrivateRepository
LINK_PRIVATE_REPOSITORY = parameter_linkPrivateRepository


# Use this if run the API as a local service (non-docker)
# BASE_URL = '127.0.0.1'
# Use this if run the API as a local service with docker in a Windows Computer
# BASE_URL = 'host.docker.internal'
# Use this if run the API as a local service with docker in a Linux Computer
BASE_URL = '172.17.0.1'


API_URL = f'http://{BASE_URL}:3000'
HOST = '0.0.0.0'

class switch:

  def __init__(self, variable, comparator=None, strict=False):
    self.variable = variable
    self.matched = False
    self.matching = False
    if comparator:
      self.comparator = comparator
    else:
      self.comparator = lambda x, y: x == y
    self.strict = strict

  def __enter__(self):
    return self

  def __exit__(self, exc_type, exc_val, exc_tb):
    pass

  def case(self, expr, break_=False):
    if self.strict and self.matched:
        return False
    if self.matching or self.comparator(self.variable, expr):
      if not break_:
        self.matching = True
      else:
        self.matched = True
        self.matching = False
      return True
    else:
      return False

  def default(self):
    return not self.matched and not self.matching
