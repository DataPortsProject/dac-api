FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="publish-subscribe"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration='{"id": "urn:ngsi-ld:DataSource:Posidonia","type": "DataSource","attributes": {},"dataProvided": {"type": "StructuredValue","value": {"id": "string","PortAuthority": "object","Port": "object","PortZone": "object","Posidonia": "object","AisAntena": "object","type": "PosidoniaEvent"},"metadata": {}},"description": {"type": "Text","value": "Posidonia data source","metadata": {}},"onChain": {"type": "Boolean","value": false,"metadata": {}},"dataModels": {"type": "Text","value": "Posidonia/PosidoniaEvent/schema.json","metadata": {}}}'
LABEL MAINTAINER jclemente@prodevelop.es

#RUN apt-get update && \
#    apt-get upgrade -y && \
#    apt-get install -y git

WORKDIR /agent

ADD . /agent

run pip install pyngsi
run pip install deprecated
RUN pip install requests

RUN pip install -r requirements.txt

#environmental variables. In the publish-subscribe at least time_interval and time_unit are mandatories
ENV RANDOM_ID="E]L8P0ZBFE/1`PS08}@W#2G?E'{^OTB5[_4_:'@}ID1K1J)@8W*|%[72J^!C{]"
ENV CALLBACK_URL="https://putsreq.com/vKaAca4J7qOEZ0Pq4TcA"
ENV TIME_INTERVAL=1
ENV TIME_UNIT=MINUTES

CMD ["python", "-u", "/agent/script.py"]