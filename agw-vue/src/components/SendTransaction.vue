<template>
  <div class="flex flex-col w-full border-solid">
    <button
      :class="buttonClasses"
      @click="handleSendTransaction"
      :disabled="!address || isLoading || hasTransaction"
    >
      <svg
        class="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span class="w-full text-center">Submit tx</span>
    </button>

    <div v-if="transactionHash" class="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-center w-full">
      <div class="flex flex-col items-center gap-2">
        <p class="text-sm sm:text-base font-medium" style="font-family: var(--font-roobert)">
          <template v-if="transactionReceipt">
            Transaction Success
            <span class="ml-1 text-green-500">✅</span>
          </template>
          <template v-else>
            Transaction Pending
            <span class="ml-1 text-yellow-500">⏳</span>
          </template>
        </p>

        <a
          :href="explorerUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          View on Explorer
        </a>
      </div>
    </div>

    <div v-if="error" class="mt-2 text-red-500 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWallet } from '../composables/useWallet'
import { useTransaction } from '../composables/useTransaction'

const { address } = useWallet()
const { 
  sendSponsoredTransaction, 
  transactionHash, 
  transactionReceipt, 
  isLoading, 
  hasTransaction, 
  error 
} = useTransaction()

const buttonClasses = computed(() => {
  const baseClasses = 'rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 w-full'
  
  if (isLoading.value || hasTransaction.value) {
    return `${baseClasses} bg-gray-500 cursor-not-allowed opacity-50`
  }
  
  return `${baseClasses} bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:cursor-pointer border-transparent`
})

const explorerUrl = computed(() => {
  return transactionReceipt.value 
    ? `https://sepolia.abscan.org/tx/${transactionReceipt.value.transactionHash}`
    : `https://sepolia.abscan.org/tx/${transactionHash.value}`
})

const handleSendTransaction = async () => {
  await sendSponsoredTransaction()
}
</script>

<style scoped>
button {
  font-family: var(--font-roobert);
}
</style>