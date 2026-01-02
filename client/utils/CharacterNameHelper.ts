import { Suspect } from "../components/console/Suspect";

export const prettifyName = (name) => {
  return Suspect[name];
};

export const unprettifyName = (name) => {
  let unprettifiedName = "";
  switch (name) {
    case "Dr. Nova":
      unprettifiedName = "dr_nova";
      break;
    case "Engineer Orion":
      unprettifiedName = "engineer_orion";
      break;
    case "Commander Sirius":
      unprettifiedName = "commander_sirius";
      break;
    case "Agent Vega":
      unprettifiedName = "agent_vega";
      break;
    case "Pilot Altair":
      unprettifiedName = "pilot_altair";
      break;
    case "Tech Cassini":
      unprettifiedName = "tech_cassini";
      break;
    default:
      break;
  }
  return unprettifiedName;
};
