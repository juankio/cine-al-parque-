<template>
  <UApp>
    <div class="min-h-screen grid place-items-center bg-surface text-foreground transition-colors duration-300">
      <UContainer class="w-full max-w-md p-6">
        <UCard class="p-6 shadow-lg">
          <slot />
        </UCard>
      </UContainer>
    </div>
  </UApp>
</template>
