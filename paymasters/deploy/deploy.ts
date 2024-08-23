import { deployContract } from "./utils";

export default async function () {
  await deployContract("MyPaymaster");
}
