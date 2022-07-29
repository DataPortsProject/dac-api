FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="publish-subscribe"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration='parameter_dataModelSerialized'
LABEL MAINTAINER jclemente@prodevelop.es

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

WORKDIR /agent

ADD . /agent

RUN pip install -r requirements.txt

#next lines are for the different packages (extra packages not included in requirements.txt) needed to run the scripts
RUN pip install jsonschema

#environmental variables. In the publish-subscribe at least time_interval and time_unit are mandatories
ENV RANDOM_ID=parameter_random

CMD ["python", "-u", "/agent/script.py"]