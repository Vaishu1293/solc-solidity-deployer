const fs = require("fs").promises;
const solc = require("solc");
const path = require("path");

async function main() {
  // Load the contract source code
  const sourceCode = await fs.readFile("MyToken.sol", "utf8");

  // Compile the source code and retrieve the ABI and Bytecode
  const { abi, bytecode } = compile(sourceCode, "MyToken");

  // Store the ABI and Bytecode into a JSON file
  const artifact = JSON.stringify({ abi, bytecode }, null, 2);
  await fs.writeFile("MyToken.json", artifact);
}

function compile(sourceCode, contractName) {
  // Create the Solidity Compiler Standard Input and Output JSON
  const input = {
    language: "Solidity",
    sources: {
      "MyToken.sol": { content: sourceCode }
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"]
        }
      }
    }
  };

  // Compile with a custom import callback to resolve external imports
  const output = JSON.parse(
    solc.compile(JSON.stringify(input), { import: findImports })
  );

  // Handle possible compilation errors
  if (output.errors) {
    output.errors.forEach((err) => {
      console.error(err.formattedMessage);
    });
    throw new Error("Compilation failed");
  }

  const contractOutput = output.contracts["MyToken.sol"][contractName];
  return {
    abi: contractOutput.abi,
    bytecode: contractOutput.evm.bytecode.object,
  };
}

// Custom import callback to resolve OpenZeppelin imports
function findImports(importPath) {
  if (importPath.startsWith("@openzeppelin")) {
    const openZeppelinPath = path.resolve(__dirname, "node_modules", importPath);
    try {
      const content = require("fs").readFileSync(openZeppelinPath, "utf8");
      return { contents: content };
    } catch (err) {
      return { error: "File not found" };
    }
  }
  return { error: "File not found" };
}

main();
