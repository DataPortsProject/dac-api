#!/usr/bin/env python3
# -*- coding: utf-8 -*-

#-- Environmental variables
TIME_INTERVAL = parameter_timeInterval
TIME_UNIT = parameter_timeUnit
RANDOM_ID = parameter_random
PRIVATE_REPOSITORY = parameter_isPrivateRepository
URL_PUBLIC_REPOSITORY = parameter_urlPublicRepository
PROJECT_NAME_PRIVATE_REPOSITORY = parameter_projectNamePrivateRepository
LINK_PRIVATE_REPOSITORY = parameter_linkPrivateRepository

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
    if self.strict:
      if self.matched:
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
