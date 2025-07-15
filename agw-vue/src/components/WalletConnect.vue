<template>
  <button
    class="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-100 hover:cursor-pointer text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    style="font-family: var(--font-roobert)"
    @click="handleConnect"
    :disabled="isConnecting"
  >
    <div v-if="isConnecting" class="animate-spin">
      <img src="/abs.svg" alt="Loading" width="20" height="20" style="filter: brightness(0)" />
    </div>
    <img
      v-else
      src="/abs.svg"
      alt="Abstract logomark"
      width="20"
      height="20"
      style="filter: brightness(0)"
    />
    <span>{{ isConnecting ? 'Connecting...' : 'Sign in with Abstract' }}</span>
  </button>
  
  <div v-if="error" class="mt-2 text-red-500 text-sm">
    {{ error }}
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../composables/useWallet'

const { connect, isConnecting, error } = useWallet()

const handleConnect = async () => {
  await connect()
}
</script>