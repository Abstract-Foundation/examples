import { ref, readonly, onMounted } from 'vue'
import { createStore } from 'mipd'
import { custom, type Address, createWalletClient } from 'viem'
import { abstractTestnet } from 'viem/chains'
import { eip712WalletActions } from 'viem/zksync'
import type { EIP1193Provider } from 'viem'

// Global singleton state
const isConnected = ref(false)
const address = ref<Address | null>(null)
const isConnecting = ref(false)
const error = ref<string | null>(null)
const walletClient = ref<any | null>(null)
const provider = ref<EIP1193Provider | null>(null)

// Create MIPD store for provider discovery
const store = createStore()

let initialized = false

export function useWallet() {

  const connect = async () => {
    try {
      isConnecting.value = true
      error.value = null

      // Initialize AGW web provider first
      await initializeAGW()

      // Wait a bit for provider to be announced
      await new Promise(resolve => setTimeout(resolve, 200))

      // Get available providers after initialization
      const providers = store.getProviders()
      
      // Look for Abstract Global Wallet provider
      const agwProvider = providers.find(p => 
        p.info.name.includes('Abstract') || 
        p.info.rdns === 'foundation.abstract.agw'
      )

      if (!agwProvider) {
        throw new Error('Abstract Global Wallet not available. Please try again.')
      }

      provider.value = agwProvider.provider

      // Request account access - this should trigger AGW popup
      console.log('Requesting accounts from AGW provider...')
      let accounts = await provider.value.request({
        method: 'eth_requestAccounts'
      }) as Address[]

      console.log('Initial accounts response:', accounts)

      // If no accounts found initially, wait and retry a few times
      if (!accounts || accounts.length === 0) {
        console.log('No accounts found initially, retrying...')
        let retries = 0
        const maxRetries = 10 // Increased retries
        
        while ((!accounts || accounts.length === 0) && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Increased wait time
          
          accounts = await provider.value.request({
            method: 'eth_accounts'
          }) as Address[]
          
          console.log(`Retry ${retries + 1}:`, accounts)
          retries++
        }
      }

      console.log('Final accounts:', accounts)

      if (!accounts || accounts.length === 0) {
        throw new Error('Connection approved but no accounts found. Please try refreshing the page.')
      }

      // Create wallet client with EIP-712 support
      console.log('Creating wallet client for account:', accounts[0])
      try {
        walletClient.value = createWalletClient({
          account: accounts[0],
          chain: abstractTestnet,
          transport: custom(provider.value)
        }).extend(eip712WalletActions())
        console.log('Wallet client created successfully')
      } catch (walletError) {
        console.error('Failed to create wallet client:', walletError)
        throw walletError
      }

      console.log('Setting connected state...')
      address.value = accounts[0]
      isConnected.value = true
      console.log('State updated:', { address: address.value, isConnected: isConnected.value })
      
      // Add a small delay to ensure state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log('Final state check:', { address: address.value, isConnected: isConnected.value })
      
    } catch (err) {
      console.error('Connection failed, resetting state:', err)
      error.value = err instanceof Error ? err.message : 'Connection failed'
      isConnected.value = false
      address.value = null
      walletClient.value = null
      console.error('Wallet connection error:', err)
    } finally {
      console.log('Connection process finished, setting isConnecting to false')
      isConnecting.value = false
    }
  }

  // Initialize AGW web provider
  const initializeAGW = async () => {
    try {
      // Import AGW web testnet - this automatically announces the provider
      await import('@abstract-foundation/agw-web/testnet')
    } catch (err) {
      console.error('Failed to initialize AGW:', err)
      throw new Error('Failed to load Abstract Global Wallet')
    }
  }

  const disconnect = async () => {
    try {
      isConnected.value = false
      address.value = null
      walletClient.value = null
      provider.value = null
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Disconnect failed'
    }
  }

  const switchToAbstractTestnet = async () => {
    if (!provider.value) return

    try {
      await provider.value.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${abstractTestnet.id.toString(16)}` }]
      })
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        await provider.value.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${abstractTestnet.id.toString(16)}`,
            chainName: abstractTestnet.name,
            nativeCurrency: abstractTestnet.nativeCurrency,
            rpcUrls: [abstractTestnet.rpcUrls.default.http[0]],
            blockExplorerUrls: abstractTestnet.blockExplorers?.default ? [abstractTestnet.blockExplorers.default.url] : undefined
          }]
        })
      } else {
        throw error
      }
    }
  }

  // Initialize AGW on mount (only once)
  if (!initialized) {
    initialized = true
    onMounted(async () => {
      try {
        // Initialize AGW provider
        await initializeAGW()
        
        // Wait for provider to be announced
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Check if already connected
        const providers = store.getProviders()
        const agwProvider = providers.find(p => 
          p.info.name.includes('Abstract') || 
          p.info.rdns === 'foundation.abstract.agw'
        )

        if (agwProvider) {
          provider.value = agwProvider.provider
          
          // Check if already connected
          const accounts = await provider.value.request({
            method: 'eth_accounts'
          }) as Address[]

          if (accounts && accounts.length > 0) {
            // Create wallet client with EIP-712 support
            walletClient.value = createWalletClient({
              account: accounts[0],
              chain: abstractTestnet,
              transport: custom(provider.value)
            }).extend(eip712WalletActions())
              
            address.value = accounts[0]
            isConnected.value = true
          }
        }
      } catch (err) {
        console.error('Auto-connect error:', err)
      }
    })
  }

  return {
    // State
    isConnected: readonly(isConnected),
    address: readonly(address),
    isConnecting: readonly(isConnecting),
    error: readonly(error),
    walletClient: readonly(walletClient),
    provider: readonly(provider),
    
    // Actions
    connect,
    disconnect,
    switchToAbstractTestnet
  }
}