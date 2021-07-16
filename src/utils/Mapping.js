import Image from '../models/Image.model';
import Template from '../models/Template.model';
import AgentTemplate from '../models/AgentTemplate.model';
import Agent from '../models/Agent.model';
import InspectAgentModel from '../models/InspectAgent.model';
import PythonTemplate from '../models/PythonTemplate.model';
import ImagesFromExternalRepositoryTemplate from '../models/ImagesFromExternalRepositoryTemplate.model';
import DataModelObject from '../models/DataModelObject.model';
import Notification from '../models/Notification.model';
import InfoModel from '../models/Info.model';
import variables from '../utils/variables';

module.exports.createImagesObj = function createImagesObj(dockerImage_data) {
	const images = [];

	dockerImage_data.forEach(element => {
		let repoTag = element.RepoTags;
		if (repoTag && repoTag.length > 0) {
			if (repoTag != '<none>:<none>' & repoTag.toString().length > 15) {
				//if (element.Labels && element.Labels.ngsiagent) {
					const img = new Image(element);

					let repo = [];
					repo = repoTag[0].split(':');
					if (repo.length >= 3) {
						img.name = repo[0] + ':' + repo[1];
						img.tag = repo[2];
					} else {
						img.name = repo[0];
						img.tag = repo[1];
					}
					img.type = element.Labels['ngsiagent.type'] ? element.Labels['ngsiagent.type'] : '';

					images.push(img);
				//}
			}
		}
	});
	return images;
};

module.exports.createDataSourceObject = function createDataSourceObject(imageData) {
	const dataSourceObj = {
		Id: imageData.Id,
		image: imageData.RepoTags[0],
		dataSource: imageData.Config.Labels.['ngsiagent.datasource_configuration'],
		agentType: imageData.Config.Labels.['ngsiagent.type']
	};

	return dataSourceObj;

}

module.exports.createTemplateObj = function createTemplateObj(imageData) {
	const template = new Template();

	template.Id = imageData.Id;
	template.image = imageData.RepoTags[0];
	template.environment = [];

	imageData.Config.Env.forEach(env => {
		var error = false;
		variables.ENV_VARIABLES_NOT_ALLOWED.forEach(vNot => {
			if (env.includes(vNot)) {
				error = true;
			}
		});

		if (!error) {
			var dict = env.split('=');
			var item = {
				key: dict[0],
				value: dict[1]
			};
			template.environment.push(item);
		}
	});

	return template;
};

module.exports.requestContainerObj = function requestContainerObj(body) {
	const query = {};

	query.Hostname = '';
	query.Domainname = '';
	query.User = '';
	query.Entrypoint = null;

	if (body.image) {
		query.Image = body.image;
	}

	if (body.environment) {
		query.Env = [];
		body.environment.forEach(env => {
			var ev = env.key + '=' + env.value;
			query.Env.push(ev);
		});
	}

	//Si type == on_demand
	//debe existir la propiedad "callBack_url": "" --> (sera obligatoria en este caso)

	return query;
};

module.exports.responseContainerObject = function responseContainerObject(container) {
	const query = {};

	if (container.Id) {
		query.ID_Container = container.Id;
	}

	if (container.Warnings) {
		query.Warnings = [];
		container.Warnings.forEach(warn => {
			var wa = warn;
			query.Warnings.push(wa);
		});
	}

	if (container.message) {
		query.message = container.message;
	}

	return query;
};

module.exports.constructAgentTemplate = function constructAgentTemplate(body) {
	const agentTemplate = new AgentTemplate();
	agentTemplate.ContainerName = body.ContainerName;
	agentTemplate.Hostname = body.Hostname;
	agentTemplate.Domainname = body.Domainname;
	agentTemplate.User = body.User;
	agentTemplate.Image = body.Image;
	agentTemplate.Env = [];

	body.Env.forEach(element => {
		agentTemplate.Env.push(element);
	});

	return agentTemplate;
};

// Funcion para crear el objeto de retorno al listar los agentes
module.exports.constructAgentsObj = function constructAgentsObj(data) {
	const agents = [];

	data.forEach(element => {
		const agent = new Agent();
		agent.ContainerName = element.ContainerName;
		agent.Id = element.Id;
		element.Names.forEach(name => {
			agent.Names.push(name);
		});
		agent.Image = element.Image;
		agent.ImageID = element.ImageID;
		agent.AgentType = element.Labels['ngsiagent.type'] ? element.Labels['ngsiagent.type'] : '';
		agent.Status = element.Status;
		agent.StatusCode = element.Status.split(" ")[0].toLowerCase();

		agents.push(agent);
	});
	return agents;
};

// Funcion que transforma los datos devolvidos por el inspect de docker a un objeto de tipo InspectAgent
module.exports.constructInspectAgentObj = function constructInspectAgentObj(data) {
	const agent = new InspectAgentModel();
	agent.Id = data.Id;
	agent.Image = data.Config.Image;
	agent.Status = data.State.Status;
	data.Config.Env.forEach(env => {
		const aux = env.split('=');
		const obj = {
			key: aux[0],
			value: aux[1]
		};

		agent.Environment.push(obj);
	});

	return agent;
};

module.exports.constructImagesFromExternalRepositoryTemplate = function constructImagesFromExternalRepositoryTemplate(data) {
	const template = new ImagesFromExternalRepositoryTemplate();
	template.url = data.url;
	template.usr = data.usr;
	template.pass = data.pass;
	template.privateRepository = data.privateRepository;

	return template;
};



module.exports.constructPythonTemplate = function constructPythonTemplate(data) {
	const pythonTemplateModel = new PythonTemplate();
	pythonTemplateModel.source = data.source;
	pythonTemplateModel.type = data.type;
	pythonTemplateModel.datamodel = data.datamodel;
	pythonTemplateModel.template = data.template;
	pythonTemplateModel.constants = data.constants;
	pythonTemplateModel.dockerFile = data.dockerFile;
	pythonTemplateModel.script = data.script;

	return pythonTemplateModel;

}

module.exports.updateTemplate = function updateTemplate(data) {
	//Cuando se hace el update, no se debe hacer un new del Modelo.
	//Si no, da error!!
	const pythonTemplateModel = {};
	pythonTemplateModel.source = data.source;
	pythonTemplateModel.type = data.type;
	pythonTemplateModel.datamodel = data.datamodel;
	pythonTemplateModel.template = data.template;
	pythonTemplateModel.constants = data.constants;
	pythonTemplateModel.dockerFile = data.dockerFile;
	pythonTemplateModel.script = data.script;

	return pythonTemplateModel;

}

module.exports.constructDataModelObj = function constructDataModelObj(data) {
	const dataModel = new DataModelObject();
	dataModel.name = data.name;
	dataModel.description = data.description;
	dataModel.link = data.link;
	dataModel.privateRepository = data.privateRepository;
	dataModel.projectName = data.projectName;

	return dataModel;

}

module.exports.updateDataModelObj = function updateDataModelObj(data) {
	//Cuando se hace el update, no se debe hacer un new del Modelo.
	//Si no, da error!!
	const dataModel = {};
	dataModel.name = data.name;
	dataModel.description = data.description;
	dataModel.link = data.link;
	dataModel.privateRepository = data.privateRepository;
	dataModel.projectName = data.projectName;

	return dataModel;

}

module.exports.constructNotification = function constructNotification(data) {
	const notif = new Notification();
	notif.id = data.id;
	notif.type = data.type;
	notif.message = data.message;

	return notif;

}

module.exports.constructInfoObject = function constructInfoObject(data) {
	const info = new InfoModel();
	info.random_id = data.random_id;
	info.container_name = data.container_name;

	return info;

}