import CustomError from '../utils/CustomError';
import { getAgents, deleteAgentByID } from '../api/docker_API';
import { constructAgentsObj } from '../utils/Mapping';
import { deleteEntities } from '../api/orion';

async function checkContainers() {
	const date = new Date().toLocaleString();

	console.log(`${date} - Checking stopped containers...`);

	let agents;
	try {
		await getAgents().then(response => {
			agents = constructAgentsObj(response);
		});
		agents.forEach(async agent => {
			if (agent.AgentType === 'on_demand' && agent.StatusCode === 'exited') {
				await deleteAgentByID(agent.Id).then(
					async () => {
						console.log(`Container ${agent.Id} deleted`);

						await deleteEntities(`urn:ngsi-ld:AgentImage:${agent.ImageID}`).then(
							() => {
								console.log(
									`Entity urn:ngsi-ld:AgentImage:${agent.ImageID} deleted`
								);
							},
							error => {
								console.log(
									'An error occured while deleting an orion entity...',
									error
								);
							}
						);
					},
					error => {
						console.log('An error occured while deleting the container...', error);
					}
				);
			}
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
}

module.exports = checkContainers;
