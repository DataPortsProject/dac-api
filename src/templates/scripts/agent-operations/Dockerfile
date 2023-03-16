FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="publish-subscribe"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration='{"id": "urn:ngsi-ld:DataSource:Posidonia","type": "DataSource","attributes": {},"dataProvided": {"type": "StructuredValue","value": {"id": "string","PortAuthority": "object","Port": "object","PortZone": "object","Posidonia": "object","AisAntena": "object","type": "PosidoniaEvent"},"metadata": {}},"description": {"type": "Text","value": "Posidonia data source","metadata": {}},"onChain": {"type": "Boolean","value": false,"metadata": {}},"dataModels": {"type": "Text","value": "Posidonia/PosidoniaEvent/schema.json","metadata": {}}}'
LABEL MAINTAINER jclemente@prodevelop.es


RUN pip install pyngsi deprecated requests

RUN pip install -r requirements.txt

WORKDIR /agent
ADD . /agent

ENV RANDOM_ID="9[2!H.]%).5-5@5U3U|[(#.+Dp%IS(F@_O+_I0<B\$WE]{'Q*3<A:|E3.['2?N^Z&"

CMD ["python", "-u", "/agent/script.py"]