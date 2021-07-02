Before to execute the python script the following points:
	- Read all comments on the generated files. In addition to indicating what is being done, some contain comments on how to complete code snippets, comment out or uncomment some code snippets.
	- That all the parameters have been replaced by the values indicated in the last step of the Wizard.
	- Complete in the DataModel_response function the properties of the data source that map to the selected properties of the output Data Model.
	- Add to the Dockerfile all the additional packages / libraries needed for the execution of the script.
	- On-demand agents, are designed to retrieved large amounts of data. Therefore, in its call it is possible to indicate which property can be filtered.
	These properties will be indicated in the attributes property of the DataSource.json file.
	Below is an example of the attributes property where no properties to be filtered are indicated and then an example of an on-demand agent type agent in which it is filtered by latitude and longitude.
		"attributes": {}

		"attributes": {
			"LATITUDE": "float",
			"LONGITUDE": "float"
		}
	
	- Go to page (for all the agents): https://tools.knowledgewalls.com/jsontostring. Select the content of file DataSource.json and paste the JSON in the page. Convert the JSON to String. Copy the output and paste the content on the label datasource_configuration in Dockerfile. 
	Changing the string parameter_dataModelSerialized for the content of the JSON serialized to String.


The command you must execute (in the directory of the zip file once unpacked) to have the image available on the platform (after having made the above changes):
	* Get-Content Dockerfile | docker build . -t [imageName]:[version]
	[imageName]: must have the following pattern --> 'dataportsh2020/' + name of the agent (without spaces, lower case and without special characters)
	This is an example of imageName: dataportsh2020/agent-api_publish-subscribe:1.0