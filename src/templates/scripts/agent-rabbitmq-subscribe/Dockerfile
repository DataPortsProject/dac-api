FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="publish-subscribe"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration='parameter_dataModelSerialized'
LABEL MAINTAINER jclemente@prodevelop.es

WORKDIR /agent

ADD . /agent

RUN pip install pika

RUN pip install requests

#environmental variables. In the publish-subscribe at least time_interval and time_unit are mandatories
ENV RANDOM_ID=parameter_random

CMD ["python", "-u", "/agent/script.py"]