FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="on_demand"
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

#next lines are for the different packages needed to run the scripts
RUN pip install --no-cache-dir --upgrade -r requirements.txt && pip install pyngsi  deprecated  python-dateutil>=2.8.0 jsonschema

ADD . /agent

#environmental variables.

ENV CALLBACK_URL=parameter_CallbackURL
ENV RANDOM_ID=parameter_random

CMD ["python", "-u", "/agent/script.py"]