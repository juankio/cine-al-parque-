<template>
  <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    <Motion
      v-for="i in 6"
      :key="i"
      tag="div"
      :initial="{ opacity: 0, y: 16 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }"
    >
      <UCard class="rounded-2xl border border-default/60 p-4">
        <div class="flex flex-col gap-3">
          <div class="flex items-start justify-between gap-2">
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-5 w-12 rounded-full" />
          </div>
          <USkeleton class="h-6 w-20" />
          <div class="flex gap-2">
            <USkeleton class="h-5 w-12" />
            <USkeleton class="h-5 w-16" />
          </div>
        </div>
      </UCard>
    </Motion>
  </div>
</template>
