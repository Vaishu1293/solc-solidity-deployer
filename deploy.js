const { Web3 } = require("web3");
const fs = require("fs");
const { abi, bytecode } = JSON.parse(fs.readFileSync("MyToken.json"));

async function main() {
  // Configuring the connection to an Ethereum node
  const network = process.env.ETHEREUM_NETWORK;
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
    )
  );

  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);

  // Deploying the ERC20 token contract with an initial supply
  const contract = new web3.eth.Contract(abi);
  const initialSupply = web3.utils.toWei("1000000", "ether"); // 1 million tokens
  contract.options.data = bytecode;

  const deployTx = contract.deploy({ arguments: [initialSupply] });
  const deployedContract = await deployTx
    .send({
      from: signer.address,
      gas: await deployTx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining deployment transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });

  // The contract is now deployed on-chain!
  console.log(`Contract deployed at ${deployedContract.options.address}`);
  console.log(
    `Add TOKEN_CONTRACT to the .env file to store the contract address: ${deployedContract.options.address}`
  );
}

require("dotenv").config();
main();
