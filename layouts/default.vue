<script setup>
import Navbar from "~/components/Navbar.vue"
import FooterBar from "~/components/FooterBar.vue"
</script>

<template>
  <div class="min-h-dvh grid grid-rows-[auto,1fr,auto]">
    <Navbar />

    <main class="max-w-6xl mx-auto w-full px-6 py-8">
      <slot />
    </main>

    <FooterBar />
  </div>
</template>
