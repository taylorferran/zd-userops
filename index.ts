import { http, createPublicClient, createWalletClient, parseAbi, encodeFunctionData, type Address, keccak256, encodePacked, getAddress } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { customChain, CONTRACTS, RPC_CONFIG, KERNEL_CONFIG } from "./config"

const chain = customChain

// ABI for the factory contract
const FACTORY_ABI = parseAbi([
  "function createAccount(bytes calldata data, bytes32 salt) external payable returns (address)",
  "function getAddress(bytes calldata data, bytes32 salt) external view returns (address)",
  "function implementation() external view returns (address)"
]);

// ABI for SimpleKernel
const SIMPLE_KERNEL_ABI = parseAbi([
  "function entryPoint() external view returns (address)",
  "function execute(address target, uint256 value, bytes calldata data) external",
  "function executeBatch(address[] calldata targets, uint256[] calldata values, bytes[] calldata datas) external"
]);

// Manual account address calculation using CREATE2 formula
function calculateAccountAddress(owner: `0x${string}`, salt: bigint): `0x${string}` {
  try {
    // Encode the owner and salt
    const ownerSaltHash = keccak256(
      encodePacked(['address', 'uint256'], [owner, salt])
    )
    
    // Get the implementation address (SimpleKernel)
    const implementation = CONTRACTS.SIMPLE_KERNEL
    
    // Calculate the final address using CREATE2 formula
    const address = keccak256(
      encodePacked(
        ['bytes1', 'address', 'bytes32', 'bytes32'],
        ['0xff', CONTRACTS.KERNEL_FACTORY, ownerSaltHash, keccak256(implementation)]
      )
    )
    
    // Convert to checksummed address (last 20 bytes)
    const accountAddress = getAddress('0x' + address.slice(-40))
    return accountAddress
  } catch (error) {
    console.error("❌ Failed to calculate account address:", error)
    throw error
  }
}

const main = async () => {
  try {
    console.log("🚀 Starting ZeroDev custom chain integration with Direct Factory...")
    
    // Construct a signer
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable is required");
    }
    const signer = privateKeyToAccount(privateKey as `0x${string}`);
    console.log("✅ Signer created:", signer.address)

    // Construct a public client for the rollup
    const publicClient = createPublicClient({
      transport: http(RPC_CONFIG.URL),
      chain
    })
    console.log("✅ Public client created for rollup")

    // Construct a wallet client for transactions
    const walletClient = createWalletClient({
      transport: http(RPC_CONFIG.URL),
      chain,
      account: signer
    })

    // Test basic RPC connectivity to rollup
    try {
      const blockNumber = await publicClient.getBlockNumber()
      console.log("✅ Connected to rollup. Current block:", blockNumber.toString())
    } catch (error) {
      console.log("❌ Failed to connect to rollup:", error)
      return
    }

    // Test bundler connectivity
    console.log("🔧 Testing bundler connectivity...")
    try {
      const bundlerClient = createPublicClient({
        transport: http(RPC_CONFIG.BUNDLER_URL),
        chain
      })
      
      // Try to get chain ID from bundler
      const bundlerChainId = await bundlerClient.getChainId()
      console.log("✅ Bundler connected. Chain ID:", bundlerChainId.toString())
    } catch (error) {
      console.log("❌ Failed to connect to bundler:", error)
      console.log("   Make sure your bundler is running at:", RPC_CONFIG.BUNDLER_URL)
      return
    }

    // Create account using factory directly
    console.log("🔧 Creating account using factory directly...")
    
    // Generate a salt for deterministic deployment
    const salt = BigInt(0); // Use 0 for first account
    const saltBytes = `0x${salt.toString(16).padStart(64, '0')}` as `0x${string}`;
    
    // For SimpleKernel, we don't need initialization data since it's not a proxy
    const emptyData = "0x";
    
    // Get predicted address
    const predictedAddress = await publicClient.readContract({
      address: CONTRACTS.KERNEL_FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getAddress',
      args: [emptyData, saltBytes]
    });
    console.log("📍 Predicted account address:", predictedAddress);
    
    // Check if account already exists
    const existingCode = await publicClient.getBytecode({ address: predictedAddress });
    let accountAddress: Address;
    
    console.log("🔍 Checking if account already exists...");
    console.log("   Address:", predictedAddress);
    console.log("   Has code:", existingCode && existingCode !== '0x' ? 'Yes' : 'No');
    
    if (existingCode && existingCode !== '0x') {
      console.log("✅ Account already exists at predicted address");
      accountAddress = predictedAddress;
    } else {
      console.log("📦 Creating new account...");
      
      // Create the account using the factory
      const hash = await walletClient.writeContract({
        address: CONTRACTS.KERNEL_FACTORY,
        abi: FACTORY_ABI,
        functionName: 'createAccount',
        args: [emptyData, saltBytes],
        gas: BigInt(3000000)
      });
      console.log("📝 Account creation transaction hash:", hash);
      
      // Wait for confirmation with longer timeout
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 300000 // 5 minutes timeout
      });
      console.log("✅ Account created successfully!");
      console.log("   Gas used:", receipt.gasUsed.toString());
      console.log("   Block number:", receipt.blockNumber.toString());
      
      accountAddress = predictedAddress;
    }
    
    console.log("🎉 Account ready:", accountAddress);
    console.log("🔑 Owner address:", signer.address);
    
    // Test manual account address calculation
    console.log("\n🧪 Testing manual account address calculation...")
    const manualAccountAddress = calculateAccountAddress(signer.address, salt)
    console.log("📝 Manual calculated account address:", manualAccountAddress)
    
    if (manualAccountAddress === accountAddress) {
      console.log("✅ Manual calculation matches factory address!")
    } else {
      console.log("⚠️  Manual calculation doesn't match factory address");
    }
    
    // Verify the account is working
    console.log("\n🔍 Verifying account...")
    try {
      const accountCode = await publicClient.getBytecode({ address: accountAddress });
      if (accountCode && accountCode !== '0x') {
        console.log("✅ Account has code");
        console.log("📏 Code size:", (accountCode.length - 2) / 2, "bytes");
      } else {
        console.log("❌ Account has no code");
        return;
      }
      
      // Check entryPoint
      const entryPoint = await publicClient.readContract({
        address: accountAddress,
        abi: SIMPLE_KERNEL_ABI,
        functionName: 'entryPoint'
      });
      console.log("🔍 Account entryPoint:", entryPoint);
      console.log("🔍 Expected entryPoint:", CONTRACTS.ENTRY_POINT);
      
      if (entryPoint === CONTRACTS.ENTRY_POINT) {
        console.log("✅ Account entryPoint matches expected address!");
      } else {
        console.log("⚠️  Account entryPoint doesn't match expected address");
        return;
      }
      
    } catch (error) {
      console.log("❌ Failed to verify account:", error);
      return;
    }
    
    console.log("\n📋 Contract addresses used:")
    console.log("  - EntryPoint:", CONTRACTS.ENTRY_POINT)
    console.log("  - ECDSAValidator:", CONTRACTS.ECDSA_VALIDATOR)
    console.log("  - SimpleKernel:", CONTRACTS.SIMPLE_KERNEL)
    console.log("  - KernelFactory:", CONTRACTS.KERNEL_FACTORY)
    
    console.log("\n🎉 Smart account is ready for user operations!")
    console.log("📝 Account address:", accountAddress);
    console.log("🔑 Owner address:", signer.address);
    console.log("📡 Using bundler at:", RPC_CONFIG.BUNDLER_URL);
    
    // Create kernel client for user operations
    console.log("\n🔧 Creating kernel client...");
    
    const entryPoint = getEntryPoint(KERNEL_CONFIG.ENTRY_POINT_VERSION);
    const kernelVersion = KERNEL_V3_1;
    
    // Create ECDSA validator
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
      kernelVersion,
      validatorAddress: CONTRACTS.ECDSA_VALIDATOR
    });
    console.log("✅ ECDSA validator created");
    
    // Create kernel account
    const kernelAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
      factoryAddress: CONTRACTS.KERNEL_FACTORY
    });
    console.log("✅ Kernel account created");
    
    // Create kernel client
    const kernelClient = createKernelAccountClient({
      account: kernelAccount,
      chain,
      bundlerTransport: http(RPC_CONFIG.BUNDLER_URL),
      client: publicClient,
    });
    console.log("✅ Kernel client created successfully!");
    
    // Test user operation using Viem API (more compatible)
    console.log("\n🚀 Testing user operation using Viem API...");
    
    try {
      // Send a simple transaction using Viem's sendTransaction method
      const txnHash = await kernelClient.sendTransaction({
        to: accountAddress, // Send to ourselves
        value: BigInt(0),   // 0 ETH
        data: "0x",         // No data
      });
      
      console.log("📝 Transaction hash:", txnHash);
      console.log("✅ User operation completed successfully!");
      console.log("   Transaction hash:", txnHash);
      
    } catch (error) {
      console.log("❌ User operation failed:", error);
      
      // Try alternative approach - send raw user operation
      console.log("\n🔄 Trying raw user operation approach...");
      try {
        const userOpHash = await kernelClient.sendUserOperation({
          callData: await kernelClient.account.encodeCalls([{
            to: accountAddress, // Send to ourselves
            value: BigInt(0),   // 0 ETH
            data: "0x",         // No data
          }]),
        });
        
        console.log("📝 User operation hash:", userOpHash);
        console.log("✅ Raw user operation sent successfully!");
        
      } catch (rawError) {
        console.log("❌ Raw user operation also failed:", rawError);
      }
    }
    
    console.log("\n🎉 Smart account integration complete!");

  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

main()
