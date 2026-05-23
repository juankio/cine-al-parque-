<script setup lang="ts">
import { animate, createTimeline, stagger } from 'animejs'
import { onMounted, ref } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()

const isClient = typeof window !== 'undefined'

onMounted(() => {
  if (isClient) {
    // Líneas de luz del fondo animadas
    animate('.glow-line', {
      translateX: ['-100%', '100%'],
      duration: 6000,
      ease: 'linear',
      loop: true,
      delay: stagger(2000)
    })

    // Timeline de entrada tipo cine
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    tl.add('.hero-bg', {
      opacity: [0, 0.4],
      scale: [1.1, 1],
      duration: 2000,
    })
    .add('.hero-el', {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 1200,
      delay: stagger(150),
    }, '-=1500')
    .add('.hero-float', {
      opacity: [0, 1],
      translateY: [60, 0],
      rotateZ: (el: any, i: number) => i === 0 ? [10, 6] : [-10, -3],
      duration: 1500,
      ease: 'outBack'
    }, '-=1000')
  }
})

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <section class="relative w-full h-[85vh] min-h-[700px] flex items-center justify-center overflow-hidden border-b border-white/5 bg-[#050505]">
    <!-- Fondo Cinemático -->
    <div class="absolute inset-0 z-0 bg-black">
      <img 
        src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2670&auto=format&fit=crop" 
        alt="Cinema Background" 
        class="hero-bg w-full h-full object-cover opacity-0 mix-blend-screen"
      />
    </div>

    <!-- Grid / Líneas Técnicas -->
    <div class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>
    
    <!-- Luces Láser (Pro Lines) -->
    <div class="absolute top-1/4 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30"></div>
    <div class="absolute top-3/4 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-30"></div>

    <!-- Superposiciones de Degradado para profundidad -->
    <div class="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
    <div class="absolute inset-0 z-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>

    <UContainer class="relative z-10 w-full mt-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Texto & Buscador (Izquierda) -->
        <div class="lg:col-span-7 space-y-8 text-left z-20">
          <div class="hero-el inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <span class="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-white/90">La Experiencia Definitiva</span>
          </div>
          
          <h1 class="hero-el text-6xl sm:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter leading-[1.05]">
            Cine al <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-br from-primary via-rose-400 to-orange-400">Parque</span>
          </h1>
          
          <p class="hero-el text-lg sm:text-xl text-white/60 font-light max-w-xl leading-relaxed">
            Reserva tu asiento, pre-ordena combos gourmet y vive la magia del séptimo arte con un servicio impecable y sin interrupciones.
          </p>

          <!-- Buscador Estilo Glassmorphism Pro -->
          <div class="hero-el relative max-w-xl group pt-4">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary/30 to-rose-500/30 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition duration-700"></div>
            <div class="relative flex items-center bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-2xl transition-colors focus-within:border-primary/50 focus-within:bg-[#151515]/90">
              <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-white/40 ml-4 shrink-0" />
              <input 
                :value="props.modelValue"
                @input="onUpdate(($event.target as HTMLInputElement).value)"
                type="text" 
                placeholder="Busca tu película favorita..." 
                class="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/30 px-4 py-3 text-lg outline-none w-full"
              />
              <UButton color="primary" size="lg" class="rounded-xl px-8 py-3.5 font-bold shadow-lg shadow-primary/20 shrink-0 text-sm tracking-wide uppercase">
                Explorar
              </UButton>
            </div>
          </div>
        </div>

        <!-- Composición Fotográfica Flotante (Derecha) -->
        <div class="hidden lg:block lg:col-span-5 relative h-[600px] w-full perspective-[1000px]">
           <!-- Glow background para las imagenes -->
           <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>

           <!-- Tarjeta Principal (Estrenos) -->
           <div class="hero-float absolute right-4 top-12 w-[280px] h-[400px] rounded-2xl border border-white/10 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-10 bg-black">
             <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105" />
             <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-6">
               <div class="space-y-1">
                 <div class="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-primary text-white mb-2">Estreno</div>
                 <div class="text-white font-bold text-xl leading-tight">La Magia del Cine</div>
                 <div class="text-white/50 text-xs font-medium uppercase tracking-widest">Sala 1 • 20:00</div>
               </div>
             </div>
           </div>

           <!-- Tarjeta Secundaria (Atras) -->
           <div class="hero-float absolute right-[180px] top-32 w-[220px] h-[320px] rounded-2xl border border-white/5 overflow-hidden shadow-2xl z-20 bg-[#111] backdrop-blur-md">
             <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover opacity-60 grayscale-[30%] transition-transform duration-700 hover:scale-105" />
             <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
               4K Dolby
             </div>
           </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
