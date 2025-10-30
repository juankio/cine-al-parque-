<template>
  <UContainer class="py-8 space-y-4">
    <h1 class="text-2xl font-semibold">KPI</h1>
    <UAlert color="gray" variant="soft" title="En construcción"
            description="Crea tus tarjetas y gráficos aquí o elimina el enlace que apunta a /admin/kpi."/>
  </UContainer>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>