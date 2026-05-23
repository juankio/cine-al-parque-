<script setup lang="ts">
import { animate, createTimeline, stagger, random } from 'animejs'
import { onMounted, ref } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()

const isClient = typeof window !== 'undefined'

const heroPosters = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop'
]

onMounted(() => {
  if (isClient) {
    // Light rays effect
    animate('.glow-line', {
      translateX: ['-100%', '100%'],
      duration: 8000,
      ease: 'linear',
      loop: true,
      delay: stagger(3000)
    })

    // Cinematic Intro Timeline
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    
    tl.add('.hero-bg-overlay', {
      opacity: [0, 0.5],
      scale: [1.1, 1],
      duration: 2500,
    })
    .add('.hero-el', {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 1200,
      delay: stagger(100),
    }, '-=2000')
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
    }, '-=1400')
  }
})

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <section class="relative w-full h-[85vh] min-h-[750px] flex items-center justify-center overflow-hidden bg-[#020202]">
    
    <!-- Deep Space Cinematic Background -->
    <div class="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop" 
        alt="Cinema Space" 
        class="hero-bg-overlay w-full h-full object-cover opacity-0 mix-blend-lighten"
      />
    </div>

    <!-- Theatrical Grid Pattern -->
    <div class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
    
    <!-- Moving Light Beams -->
    <div class="glow-line absolute top-1/3 left-0 w-[200%] h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent -translate-x-full"></div>
    <div class="glow-line absolute top-2/3 left-0 w-[200%] h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent -translate-x-full" style="animation-delay: 2s"></div>

    <!-- Gradient Vignette -->
    <div class="absolute inset-0 z-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent"></div>
    <div class="absolute inset-0 z-0 bg-gradient-to-r from-[#020202] via-[#020202]/70 to-transparent lg:via-[#020202]/80"></div>

    <UContainer class="relative z-10 w-full mt-12 lg:mt-24">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        <!-- Typography & Input (Left) -->
        <div class="lg:col-span-6 space-y-10 text-left z-20">
          <div class="hero-el inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span class="text-[11px] font-black uppercase tracking-[0.25em] text-white/90">La Experiencia Definitiva</span>
          </div>
          
          <h1 class="hero-el text-6xl sm:text-7xl lg:text-[6rem] font-black text-white tracking-tighter leading-[1]">
            Cine al <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-br from-primary via-rose-500 to-orange-400 drop-shadow-[0_0_30px_rgba(225,29,72,0.3)]">Parque</span>
          </h1>
          
          <p class="hero-el text-lg sm:text-xl text-white/70 font-medium max-w-xl leading-relaxed">
            Reserva tu asiento VIP, pre-ordena combos gourmet y vive la magia del séptimo arte con una plataforma sin interrupciones.
          </p>

          <!-- Search Bar -->
          <div class="hero-el relative max-w-xl group pt-4">
            <div class="absolute -inset-1.5 bg-gradient-to-r from-primary/40 to-rose-500/40 rounded-3xl blur-xl opacity-30 group-hover:opacity-70 transition duration-1000"></div>
            <div class="relative flex items-center bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-2.5 shadow-2xl transition-colors focus-within:border-primary/50 focus-within:bg-[#111]/80">
              <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-white/50 ml-4 shrink-0" />
              <input 
                :value="props.modelValue"
                @input="onUpdate(($event.target as HTMLInputElement).value)"
                type="text" 
                placeholder="Busca tu película favorita..." 
                class="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/30 px-4 py-3.5 text-lg font-medium outline-none w-full"
              />
              <UButton color="primary" size="xl" class="rounded-xl px-8 py-3.5 font-black shadow-lg shadow-primary/25 shrink-0 text-sm tracking-widest uppercase transition-transform hover:scale-105">
                Explorar
              </UButton>
            </div>
          </div>
        </div>

        <!-- Cinematic Poster Composition (Right) -->
        <div class="hidden lg:block lg:col-span-6 relative h-[600px] w-full perspective-[1200px]">
           <!-- Central Core Glow -->
           <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

           <!-- Back Poster (Left) -->
           <div class="hero-float-card absolute left-4 top-24 w-[220px] h-[320px] rounded-2xl border border-white/5 overflow-hidden shadow-2xl z-10 bg-black/80 backdrop-blur-md opacity-0">
             <div class="absolute inset-0 bg-black/40 z-10 transition-opacity hover:opacity-0"></div>
             <img :src="heroPosters[1]" class="w-full h-full object-cover grayscale-[40%] transition-transform duration-1000 hover:scale-110" />
           </div>

           <!-- Back Poster (Right) -->
           <div class="hero-float-card absolute right-0 top-16 w-[200px] h-[280px] rounded-2xl border border-white/5 overflow-hidden shadow-2xl z-10 bg-black/80 backdrop-blur-md opacity-0">
             <div class="absolute inset-0 bg-black/60 z-10 transition-opacity hover:opacity-0"></div>
             <img :src="heroPosters[2]" class="w-full h-full object-cover grayscale-[60%] transition-transform duration-1000 hover:scale-110" />
           </div>

           <!-- Main Front Poster -->
           <div class="hero-float-card absolute left-1/2 -translate-x-1/2 top-4 w-[300px] h-[440px] rounded-2xl border border-white/20 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] z-30 bg-black opacity-0 ring-1 ring-primary/20">
             <img :src="heroPosters[0]" class="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105" />
             <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-6">
               <div class="space-y-2 w-full">
                 <div class="flex justify-between items-center w-full">
                   <div class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary text-white">4K Atmos</div>
                   <div class="text-white/80 text-[10px] font-bold tracking-widest uppercase"><UIcon name="i-heroicons-star-solid" class="w-3 h-3 text-yellow-500 inline -mt-1"/> 9.8</div>
                 </div>
                 <div class="text-white font-black text-2xl leading-tight drop-shadow-md">La Magia del Cine</div>
                 <div class="text-white/60 text-xs font-bold uppercase tracking-widest">Estreno Mundial</div>
               </div>
             </div>
           </div>

        </div>
      </div>
    </UContainer>
  </section>
</template>
