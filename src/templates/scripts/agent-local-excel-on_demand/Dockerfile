FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="on_demand"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration='parameter_dataModelSerialized'
LABEL MAINTAINER jclemente@prodevelop.es

WORKDIR /agent

ADD . /agent

#next lines are for the different packages needed to run the scripts
RUN pip install pandas

RUN pip install numpy==1.19.3

RUN pip install xlrd

RUN pip install openpyxl

RUN pip install python-dateutil==2.8.1

RUN pip install pyngsi

RUN pip install deprecated

RUN pip install jsonschema

#environmental variables. In the publish-subscribe at least time_interval and time_unit are mandatories

ENV CALLBACK_URL=parameter_CallbackURL
ENV RANDOM_ID=parameter_random

CMD ["python", "-u", "/agent/script.py"]