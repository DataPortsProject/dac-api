FROM python:3.8.3-slim-buster

LABEL ngsiagent.project="dataports"
#next label is to indicate the agent type
LABEL ngsiagent.type="publish-subscribe"
#next label is the DataSource file serialized to string
LABEL ngsiagent.datasource_configuration=parameter_dataModelSerialized
LABEL MAINTAINER jclemente@prodevelop.es

WORKDIR /agent

ADD . /agent

#next lines are for the different packages needed to run the scripts
run pip install pandas

run pip install numpy==1.19.3

run pip install xlrd

run pip install openpyxl

run pip install python-dateutil==2.8.1

run pip install pyngsi==2.0.0

run pip install deprecated

#environmental variables. In the publish-subscribe at least time_interval and time_unit are mandatories

ENV TIME_INTERVAL=parameter_timeInterval
ENV TIME_UNIT=parameter_timeUnit
ENV RANDOM_ID=parameter_random

CMD ["python", "-u", "/agent/script.py"]