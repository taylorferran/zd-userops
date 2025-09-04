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


Current script outout:

bash
```
taylorferran@Taylors-MBP zerodev % npm start

> zerodev@1.0.0 start
> npx ts-node index.ts

🚀 Starting ZeroDev custom chain integration with Direct Factory...
✅ Signer created: 0x4da9f34f83d608cAB03868662e93c96Bc9793495
✅ Public client created for rollup
✅ Connected to rollup. Current block: 28590
🔧 Testing bundler connectivity...
✅ Bundler connected. Chain ID: 88888
🔧 Creating account using factory directly...
📍 Predicted account address: 0xa6d7e0d4e9bDCef8938c912Bcf548EfdCa28De5A
🔍 Checking if account already exists...
   Address: 0xa6d7e0d4e9bDCef8938c912Bcf548EfdCa28De5A
   Has code: Yes
✅ Account already exists at predicted address
🎉 Account ready: 0xa6d7e0d4e9bDCef8938c912Bcf548EfdCa28De5A
🔑 Owner address: 0x4da9f34f83d608cAB03868662e93c96Bc9793495

🧪 Testing manual account address calculation...
📝 Manual calculated account address: 0x2e77C142cF8597a153E9c42AF0f7D24cFC11b7Cf
⚠️  Manual calculation doesn't match factory address

🔍 Verifying account...
✅ Account has code
📏 Code size: 61 bytes
🔍 Account entryPoint: 0x896bf9511c65b8C5486C6E8E9FEED88d93ef9188
🔍 Expected entryPoint: 0x896bf9511c65b8C5486C6E8E9FEED88d93ef9188
✅ Account entryPoint matches expected address!

📋 Contract addresses used:
  - EntryPoint: 0x896bf9511c65b8C5486C6E8E9FEED88d93ef9188
  - ECDSAValidator: 0x478d05A775e1E65415B3aaa96F0aF5CB012899A4
  - SimpleKernel: 0x16D4A6c03276f47D3E16F9774D51F1500FC8daCe
  - KernelFactory: 0x931FE526cB2e869A230455578E1f9cEeBa14DB87

🎉 Smart account is ready for user operations!
📝 Account address: 0xa6d7e0d4e9bDCef8938c912Bcf548EfdCa28De5A
🔑 Owner address: 0x4da9f34f83d608cAB03868662e93c96Bc9793495
📡 Using bundler at: http://localhost:14337/rpc

🔧 Creating kernel client...
✅ ECDSA validator created
✅ Kernel account created
✅ Kernel client created successfully!

🚀 Testing user operation using Viem API...
❌ User operation failed: MethodNotFoundRpcError: The method "zd_getUserOperationGasPrice" does not exist / is not available.

URL: http://localhost:14337/rpc
Request body: {"method":"zd_getUserOperationGasPrice","params":[]}

Details: Method zd_getUserOperationGasPrice is not supported
Version: viem@2.37.2
    at delay.count.count (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/buildRequest.ts:164:25)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async attemptRetry (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/promise/withRetry.ts:44:22) {
  details: 'Method zd_getUserOperationGasPrice is not supported',
  docsPath: undefined,
  metaMessages: [
    'URL: http://localhost:14337/rpc',
    'Request body: {"method":"zd_getUserOperationGasPrice","params":[]}'
  ],
  shortMessage: 'The method "zd_getUserOperationGasPrice" does not exist / is not available.',
  version: '2.37.2',
  code: -32601,
  [cause]: RpcRequestError: RPC Request failed.
  
  URL: http://localhost:14337/rpc
  Request body: {"method":"zd_getUserOperationGasPrice","params":[]}
  
  Details: Method zd_getUserOperationGasPrice is not supported
  Version: viem@2.37.2
      at request (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/clients/transports/http.ts:157:19)
      at processTicksAndRejections (node:internal/process/task_queues:105:5)
      at async delay.count.count (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/buildRequest.ts:150:22)
      at async attemptRetry (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/promise/withRetry.ts:44:22) {
    details: 'Method zd_getUserOperationGasPrice is not supported',
    docsPath: undefined,
    metaMessages: [
      'URL: http://localhost:14337/rpc',
      'Request body: {"method":"zd_getUserOperationGasPrice","params":[]}'
    ],
    shortMessage: 'RPC Request failed.',
    version: '2.37.2',
    code: -32601,
    data: undefined,
    [cause]: {
      message: 'Method zd_getUserOperationGasPrice is not supported',
      code: -32601
    }
  }
}

🔄 Trying raw user operation approach...
❌ Raw user operation also failed: MethodNotFoundRpcError: The method "zd_getUserOperationGasPrice" does not exist / is not available.

URL: http://localhost:14337/rpc
Request body: {"method":"zd_getUserOperationGasPrice","params":[]}

Details: Method zd_getUserOperationGasPrice is not supported
Version: viem@2.37.2
    at delay.count.count (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/buildRequest.ts:164:25)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async attemptRetry (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/promise/withRetry.ts:44:22) {
  details: 'Method zd_getUserOperationGasPrice is not supported',
  docsPath: undefined,
  metaMessages: [
    'URL: http://localhost:14337/rpc',
    'Request body: {"method":"zd_getUserOperationGasPrice","params":[]}'
  ],
  shortMessage: 'The method "zd_getUserOperationGasPrice" does not exist / is not available.',
  version: '2.37.2',
  code: -32601,
  [cause]: RpcRequestError: RPC Request failed.
  
  URL: http://localhost:14337/rpc
  Request body: {"method":"zd_getUserOperationGasPrice","params":[]}
  
  Details: Method zd_getUserOperationGasPrice is not supported
  Version: viem@2.37.2
      at request (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/clients/transports/http.ts:157:19)
      at processTicksAndRejections (node:internal/process/task_queues:105:5)
      at async delay.count.count (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/buildRequest.ts:150:22)
      at async attemptRetry (/Users/taylorferran/Desktop/rollups/zerodev/zerodev/node_modules/viem/utils/promise/withRetry.ts:44:22) {
    details: 'Method zd_getUserOperationGasPrice is not supported',
    docsPath: undefined,
    metaMessages: [
      'URL: http://localhost:14337/rpc',
      'Request body: {"method":"zd_getUserOperationGasPrice","params":[]}'
    ],
    shortMessage: 'RPC Request failed.',
    version: '2.37.2',
    code: -32601,
    data: undefined,
    [cause]: {
      message: 'Method zd_getUserOperationGasPrice is not supported',
      code: -32601
    }
  }
}
```
