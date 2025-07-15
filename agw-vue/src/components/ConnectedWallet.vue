<template>
  <div v-if="address" class="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full max-w-sm">
    <div class="flex flex-col items-center gap-4">
      <!-- Wallet Status -->
      <div class="text-center">
        <p class="text-sm sm:text-base font-medium mb-1" style="font-family: var(--font-roobert)">
          Connected to Abstract Global Wallet
        </p>
        <p class="text-xs text-gray-400 font-mono break-all">{{ address }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col w-full gap-4">
        <div class="flex flex-col gap-2 w-full">
          <button
            class="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 hover:cursor-pointer text-sm px-5 w-full h-10 py-2"
            style="font-family: var(--font-roobert)"
            @click="handleDisconnect"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Disconnect
          </button>
          <SendTransaction />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../composables/useWallet'
import SendTransaction from './SendTransaction.vue'

const { address, disconnect } = useWallet()

const handleDisconnect = async () => {
  await disconnect()
}
</script>