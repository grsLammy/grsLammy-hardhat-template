import "@nomicfoundation/hardhat-toolbox";
import "@primitivefi/hardhat-dodoc";
import "hardhat-contract-sizer";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";

import "./tasks/accounts";
import "./tasks/lock";

// Run 'npx hardhat vars setup' to see the list of variables that need to be set
const polygonScanApiKey: string = vars.get("POLYGONSCAN_API_KEY");
const mnemonic: string = vars.get("MNEMONIC");
const infuraApiKey: string = vars.get("INFURA_API_KEY");
const coinMarketCapApiKey: string = vars.get("CMC_API_KEY");

const chainIds = {
  hardhat: 31337,
  "polygon-mainnet": 137,
  "polygon-mumbai": 80001,
  // add more chain ids
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "polygon-mainnet":
      jsonRpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${infuraApiKey}`;
      break;
    case `polygon-mumbai`:
      jsonRpcUrl = `https://polygon-mumbai.g.alchemy.com/v2/${infuraApiKey}`;
      break;
    default:
      jsonRpcUrl = `https://eth-${chain}.alchemyapi.io/v2/${infuraApiKey}`;
  }
  return {
    accounts: {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      polygon: polygonScanApiKey,
      polygonMumbai: polygonScanApiKey,
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: coinMarketCapApiKey,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    "polygon-mainnet": getChainConfig("polygon-mainnet"),
    "polygon-mumbai": getChainConfig("polygon-mumbai"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.20",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
  dodoc: {
    outputDir: process.env.DOC_GEN_LOCAL_PATH,
    runOnCompile: false,
    debugMode: false,
    keepFileStructure: false,
    freshOutput: false,
    include: ["contracts"],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
};

export default config;
