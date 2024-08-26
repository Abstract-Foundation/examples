import { deployContract } from "./utils";

export default async function () {
  const contractArtifactName = "BasicAccount";
  await deployContract(contractArtifactName, "createAccount");
}
