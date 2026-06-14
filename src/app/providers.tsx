"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? "";

// Register Base Sepolia explicitly so the embedded wallet can transact on it
// even before/without enabling it in the Dynamic dashboard.
// (The dashboard toggle is the primary switch; this is belt-and-suspenders.)
const baseSepoliaNetwork = {
  blockExplorerUrls: ["https://sepolia.basescan.org/"],
  chainId: 84532,
  chainName: "Base Sepolia",
  iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
  name: "Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
    iconUrl: "https://app.dynamic.xyz/assets/networks/eth.svg",
  },
  networkId: 84532,
  rpcUrls: ["https://sepolia.base.org"],
  vanityName: "Base Sepolia",
};

// Arc Testnet (Circle's L1). USDC is the NATIVE token — gas and value are both
// USDC (6 decimals). Donations are plain native transfers here.
const arcTestnetNetwork = {
  blockExplorerUrls: ["https://testnet.arcscan.app/"],
  chainId: 5042002,
  chainName: "Arc Testnet",
  iconUrls: ["https://app.dynamic.xyz/assets/networks/usdc.svg"],
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "USD Coin",
    symbol: "USDC",
    iconUrl: "https://app.dynamic.xyz/assets/networks/usdc.svg",
  },
  networkId: 5042002,
  rpcUrls: ["https://rpc.testnet.arc.network"],
  vanityName: "Arc Testnet",
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: [baseSepoliaNetwork, arcTestnetNetwork],
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
