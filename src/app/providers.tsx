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

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: [baseSepoliaNetwork],
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
