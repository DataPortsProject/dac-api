#!/usr/bin/env python3
# -*- coding: utf-8 -*-

#-- Environmental variables
RANDOM_ID = "E]L8P0ZBFE/1`PS08}@W#2G?E'{^OTB5[_4_:'@}ID1K1J)@8W*|%[72J^!C{]"
PRIVATE_REPOSITORY = True
URL_PUBLIC_REPOSITORY = ""
PROJECT_NAME_PRIVATE_REPOSITORY = "datamodel"
LINK_PRIVATE_REPOSITORY = "Posidonia/PosidoniaEvent/schema.json"
CALLBACK_URL="https://putsreq.com/vKaAca4J7qOEZ0Pq4TcA"

#-- for filter
TIME_INTERVAL = 1
TIME_UNIT = "MINUTES"

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
