# ZeroDev Smart Account Integration

##  Current Status
**Working Components:**
- Smart account creation via KernelFactory
- Account verification and validation
- ZeroDev SDK integration
- Factory-based account deployment

Can see the current output in output.log


**Known Issue:**
- User operations fail due to bundler compatibility
- Current bundler doesn't support ZeroDev-specific RPC methods

## Quick Start

1. **Navigate to the project:**
```bash
cd zerodev
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# create .env file with
# PRIVATE_KEY=your_private_key_here
```

4. **Run the smart account system:**
```bash
npm start
```

## What Works

The system successfully:
- Creates smart accounts using the KernelFactory
- Verifies account deployment and configuration
- Establishes ZeroDev SDK integration
- Connects to the rollup and bundler

## What's Blocked

User operations fail because the current bundler (`im running Skandha locally but any bundler that isnt zerodev will fail`) doesn't support ZeroDev's specific RPC methods like `zd_getUserOperationGasPrice`.

##  Next Steps

To complete the integration, you need to:

1. **Deploy a ZeroDev-compatible bundler** that supports:
   - `zd_getUserOperationGasPrice`
   - Other ZeroDev-specific RPC methods

2. **Or use a standard ERC-4337 bundler** with manual user operation construction (create and send via viem)
maybe not possible for our overall use case

## Contract Addresses

The system uses these deployed contracts:
- **EntryPoint**: `0x896bf9511c65b8C5486C6E8E9FEED88d93ef9188`
- **SimpleKernel**: `0x16D4A6c03276f47D3E16F9774D51F1500FC8daCe`
- **KernelFactory**: `0x931FE526cB2e869A230455578E1f9cEeBa14DB87`
- **ECDSAValidator**: `0x478d05A775e1E65415B3aaa96F0aF5CB012899A4`
