import { ref, computed } from 'vue'
import { type Hash, parseAbi, createPublicClient, http } from 'viem'
import { abstractTestnet } from 'viem/chains'
import { getGeneralPaymasterInput } from 'viem/zksync'
import { useWallet } from './useWallet'

export function useTransaction() {
  const { walletClient, address } = useWallet()
  
  const transactionHash = ref<Hash | null>(null)
  const transactionReceipt = ref<any | null>(null)
  const isPending = ref(false)
  const error = ref<string | null>(null)

  const isLoading = computed(() => isPending.value)
  const isSuccess = computed(() => !!transactionReceipt.value)
  const hasTransaction = computed(() => !!transactionReceipt.value)

  const sendSponsoredTransaction = async () => {
    if (!walletClient.value || !address.value) {
      error.value = 'Wallet not connected'
      return
    }

    try {
      isPending.value = true
      error.value = null
      transactionHash.value = null
      transactionReceipt.value = null

      // Send sponsored transaction to mint NFT (same as Next.js example)
      const hash = await walletClient.value.writeContract({
        abi: parseAbi(['function mint(address,uint256) external']),
        address: '0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA', // Contract address from Next.js example
        functionName: 'mint',
        args: [address.value, BigInt(1)],
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391', // Paymaster address from Next.js example
        paymasterInput: getGeneralPaymasterInput({
          innerInput: '0x'
        })
      })

      transactionHash.value = hash

      // Create public client to wait for transaction receipt
      const publicClient = createPublicClient({
        chain: abstractTestnet,
        transport: http()
      })

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60_000 // 60 seconds timeout
      })

      transactionReceipt.value = receipt

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Transaction failed'
      console.error('Transaction error:', err)
    } finally {
      isPending.value = false
    }
  }

  const reset = () => {
    transactionHash.value = null
    transactionReceipt.value = null
    isPending.value = false
    error.value = null
  }

  return {
    // State
    transactionHash: computed(() => transactionHash.value),
    transactionReceipt: computed(() => transactionReceipt.value),
    isLoading,
    isSuccess,
    hasTransaction,
    error: computed(() => error.value),
    
    // Actions
    sendSponsoredTransaction,
    reset
  }
}