export function useCartelera () {
  const movies = ref([])
  const loading = ref(true)
  const q = ref('')

  const filtered = computed(() => {
    const text = q.value.trim().toLowerCase()
    if (!text) return movies.value
    return movies.value.filter(m =>
      m.titulo.toLowerCase().includes(text) || m.id.toLowerCase().includes(text)
    )
  })

  async function load () {
    loading.value = true
    try {
      const data = await $fetch('/data/movies.json') // <-- desde /public
      movies.value = Array.isArray(data) ? data : []
      // console.log('Cartelera cargada', movies.value) // útil para debug
    } catch (e) {
      console.error('No se pudo cargar la cartelera:', e)
      movies.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
  return { movies, filtered, loading, q, load }
}
