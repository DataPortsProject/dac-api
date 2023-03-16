FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="publish-subscribe"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration='parameter_dataModelSerialized'
# The api version is used to differentiate variations on the external API used to retrieve data
LABEL ngsiagent.api_version='1.0'
# This label defines the kind of data source used by this agent
LABEL ngsiagent.api_type='api-requester'
# Use this label to briefly describe what this agent does
LABEL ngisagent.api_description='This agent ...'
# Use this label to credit the agent's developer
LABEL MAINTAINER jclemente@prodevelop.es

WORKDIR /agent

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt && pip install pyngsi  deprecated  python-dateutil>=2.8.0 jsonschema

ADD . /agent

#environmental variables. In the publish-subscribe at least time_interval and time_unit are mandatories

ENV TIME_INTERVAL=parameter_timeInterval
ENV TIME_UNIT=parameter_timeUnit
ENV RANDOM_ID=parameter_random

CMD ["python", "-u", "/agent/script.py"]