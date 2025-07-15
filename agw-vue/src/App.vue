<script setup lang="ts">
import { useWallet } from './composables/useWallet'
import WalletConnect from './components/WalletConnect.vue'
import ConnectedWallet from './components/ConnectedWallet.vue'
import BackgroundEffects from './components/BackgroundEffects.vue'
import ResourceCards from './components/ResourceCards.vue'

const { address } = useWallet()
</script>

<template>
  <div class="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 sm:p-20 bg-black overflow-hidden" style="font-family: var(--font-avenue-mono)">
    <BackgroundEffects />

    <main class="relative flex flex-col items-center justify-center z-10 text-white text-center">
      <div class="flex flex-col items-center gap-8">
        <img
          src="/abstract.svg"
          alt="Abstract logo"
          width="240"
          height="32"
          class="quality-100 priority"
        />
        <p class="text-md" style="font-family: var(--font-roobert)">
          Get started by editing 
          <code class="bg-white/[.06] px-1 py-0.5 rounded font-semibold">
            src/App.vue
          </code>
          .
        </p>

        <ConnectedWallet v-if="address" />
        <WalletConnect v-else />
      </div>
    </main>

    <ResourceCards />
  </div>
</template>
