FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="publish-subscribe"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration='parameter_dataModelSerialized'
LABEL MAINTAINER jclemente@prodevelop.es

WORKDIR /agent

ADD . /agent

#next lines are for the different packages needed to run the scripts
RUN pip install pyngsi

RUN pip install deprecated

RUN pip install python-dateutil>=2.8.0

RUN pip install requests

RUN pip install Flask==1.1.2

RUN pip install jsonschema

EXPOSE 5000

#environmental variables. In the publish-subscribe at least time_interval and time_unit are mandatories (except listeners)
ENV RANDOM_ID=parameter_random

CMD ["python", "-u", "/agent/script.py"]