import { defineChain } from "viem"

// Custom chain configuration for your rollup
export const customChain = defineChain({
  id: 88888,
  name: 'Custom Rollup B',
  network: 'custom-rollup-b',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://57.129.73.144:31133/'],
    },
    public: {
      http: ['http://57.129.73.144:31133/'],
    },
  },
})

// Your deployed contract addresses - ORIGINAL WORKING CONTRACTS
export const CONTRACTS = {
  ENTRY_POINT: '0x896bf9511c65b8C5486C6E8E9FEED88d93ef9188' as const, // SimpleEntryPoint
  ECDSA_VALIDATOR: '0x478d05A775e1E65415B3aaa96F0aF5CB012899A4' as const, // ECDSAValidator
  SIMPLE_KERNEL: '0x16D4A6c03276f47D3E16F9774D51F1500FC8daCe' as const, // SimpleKernel
  KERNEL_FACTORY: '0x931FE526cB2e869A230455578E1f9cEeBa14DB87' as const, // KernelFactory
  FACTORY_STAKER: '0xd4a2D5b3d18c1367b11f32182990cFEbE5dC62f9' as const, // FactoryStaker
}

// RPC configuration
export const RPC_CONFIG = {
  URL: 'http://57.129.73.144:31133/',
  BUNDLER_URL: 'http://localhost:14337/rpc', // UPDATE this to our new zerodev bundler URL
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
}

// Kernel configuration
export const KERNEL_CONFIG = {
  VERSION: '3.1' as const,
  ENTRY_POINT_VERSION: '0.7' as const,
}
