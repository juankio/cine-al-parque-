<script setup lang="ts">
import { animate, createTimeline, stagger } from 'animejs'
import { onMounted, ref, onBeforeUnmount } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()

const isClient = typeof window !== 'undefined'
const heroRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)

const heroPosters = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop'
]

const handleMouseMove = (e: MouseEvent) => {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  // Normalizar coordenadas entre -1 y 1 para el parallax
  mouseX.value = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouseY.value = ((e.clientY - rect.top) / rect.height) * 2 - 1
}

onMounted(() => {
  if (isClient) {
    // Cinematic Intro Timeline
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    
    tl.add('.hero-el', {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 1200,
      delay: stagger(100),
    })
    .add('.hero-float-card', {
      opacity: [0, 1],
      translateX: [100, 0],
      translateY: (el: any, i: number) => i === 1 ? [100, 20] : [100, 0],
      rotateZ: (el: any, i: number) => {
        if(i === 0) return [15, 6];
        if(i === 1) return [-15, -4];
        return [20, 10];
      },
      duration: 1600,
      delay: stagger(150),
      ease: 'outBack'
    }, '-=1000')
  }
})

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <section 
    ref="heroRef"
    @mousemove="handleMouseMove"
    class="relative w-full h-[85vh] min-h-[750px] flex items-center justify-center bg-transparent"
  >

    <UContainer class="relative z-10 w-full mt-12 lg:mt-24">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        <!-- Typography & Input (Left) -->
        <div class="lg:col-span-6 space-y-10 text-left z-20">
          
          <h1 class="hero-el text-6xl sm:text-7xl lg:text-[6rem] font-black text-foreground tracking-tighter leading-[1]">
            Cine al <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-br from-primary via-rose-500 to-orange-400 drop-shadow-[0_0_30px_rgba(225,29,72,0.3)]">Parque</span>
          </h1>
          
          <p class="hero-el text-lg sm:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
            Reserva tu asiento VIP, pre-ordena combos gourmet y vive la magia del séptimo arte con una plataforma sin interrupciones.
          </p>

          <!-- Search Bar -->
          <div class="hero-el relative max-w-xl group pt-4">
            <div class="absolute -inset-1.5 bg-gradient-to-r from-primary/40 to-rose-500/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition duration-1000 dark:group-hover:opacity-70"></div>
            <div class="relative flex items-center bg-background/80 backdrop-blur-3xl border border-border rounded-2xl p-2.5 shadow-2xl transition-colors focus-within:border-primary/50 focus-within:bg-muted/80">
              <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-muted-foreground ml-4 shrink-0" />
              <input 
                :value="props.modelValue"
                @input="onUpdate(($event.target as HTMLInputElement).value)"
                type="text" 
                placeholder="Busca tu película favorita..." 
                class="flex-1 bg-transparent border-none focus:ring-0 text-foreground placeholder-muted-foreground px-4 py-3.5 text-lg font-medium outline-none w-full"
              />
              <UButton color="primary" size="xl" class="rounded-xl px-8 py-3.5 font-black shadow-lg shadow-primary/25 shrink-0 text-sm tracking-widest uppercase transition-transform hover:scale-105">
                Explorar
              </UButton>
            </div>
          </div>
        </div>

        <!-- Cinematic Poster Composition (Right) -->
        <div class="hidden lg:block lg:col-span-6 relative h-[600px] w-full perspective-[1200px]" style="transform-style: preserve-3d;">
           
           <!-- Back Poster (Left) -->
           <div 
             class="hero-float-card absolute left-4 top-24 w-[220px] h-[320px] rounded-2xl border border-border/50 overflow-hidden shadow-2xl z-10 bg-black opacity-0 transition-transform duration-300 ease-out"
             :style="{ transform: `translate3d(${mouseX * -15}px, ${mouseY * -15}px, -50px) rotateY(${mouseX * 10}deg) rotateX(${mouseY * -10}deg)` }"
           >
             <div class="absolute inset-0 bg-black/60 dark:bg-black/40 z-10 transition-opacity hover:opacity-0"></div>
             <img :src="heroPosters[1]" class="w-full h-full object-cover grayscale-[40%] transition-transform duration-1000 hover:scale-110" />
           </div>

           <!-- Back Poster (Right) -->
           <div 
             class="hero-float-card absolute right-0 top-16 w-[200px] h-[280px] rounded-2xl border border-border/50 overflow-hidden shadow-2xl z-10 bg-black opacity-0 transition-transform duration-300 ease-out"
             :style="{ transform: `translate3d(${mouseX * -25}px, ${mouseY * -25}px, -100px) rotateY(${mouseX * -15}deg) rotateX(${mouseY * 15}deg)` }"
           >
             <div class="absolute inset-0 bg-black/70 dark:bg-black/60 z-10 transition-opacity hover:opacity-0"></div>
             <img :src="heroPosters[2]" class="w-full h-full object-cover grayscale-[60%] transition-transform duration-1000 hover:scale-110" />
           </div>

           <!-- Main Front Poster -->
           <div 
             class="hero-float-card absolute left-1/2 -translate-x-1/2 top-4 w-[300px] h-[440px] rounded-2xl border border-border/50 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] z-30 bg-black opacity-0 ring-1 ring-primary/20 transition-transform duration-200 ease-out"
             :style="{ transform: `translate3d(${mouseX * 20}px, ${mouseY * 20}px, 50px) rotateY(${mouseX * 15}deg) rotateX(${mouseY * -15}deg)` }"
           >
             <img :src="heroPosters[0]" class="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105" />
             <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-6">
               <div class="space-y-2 w-full">
                 <div class="flex justify-between items-center w-full">
                   <div class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary text-white">4K Atmos</div>
                   <div class="text-white/90 text-[10px] font-bold tracking-widest uppercase"><UIcon name="i-heroicons-star-solid" class="w-3 h-3 text-yellow-500 inline -mt-1"/> 9.8</div>
                 </div>
                 <div class="text-white font-black text-2xl leading-tight drop-shadow-md">La Magia del Cine</div>
                 <div class="text-white/70 text-xs font-bold uppercase tracking-widest">Estreno Mundial</div>
               </div>
             </div>
           </div>

        </div>
      </div>
    </UContainer>
  </section>
</template>
