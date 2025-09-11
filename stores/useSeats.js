import { defineStore } from 'pinia'

const BASE = 'cine-seats-v3' // nueva versión con movieKey

function createDefaultLayout({ tablesOf2 = 2, tablesOf4 = 4 } = {}) {
  const tables = []
  let i = 1
  for (let t = 0; t < tablesOf2; t++) tables.push({ id: `M${i++}`, type: 2, seats: ['A', 'B'] })
  for (let t = 0; t < tablesOf4; t++) tables.push({ id: `M${i++}`, type: 4, seats: ['A', 'B', 'C', 'D'] })
  return tables
}

export const useSeats = defineStore('seats', {
  state: () => ({
    // contexto de película/horario
    movieId: null,
    hora: null,

    // layout y ocupación
    tables: createDefaultLayout({ tablesOf2: 2, tablesOf4: 4 }),
    takenIds: [],           // ['M1-A', ...] guardados POR película+hora
    selected: new Set()
  }),
  getters: {
    total: s => s.tables.reduce((acc, t) => acc + t.seats.length, 0),
    selectedCount: s => s.selected.size,
    takenSet: s => new Set(s.takenIds),
    movieKey: s => s.movieId ? `${BASE}:${s.movieId}${s.hora ? '@'+s.hora : ''}` : null
  },
  actions: {
    seatId (tableId, seatKey) { return `${tableId}-${seatKey}` },
    isTaken (id) { return this.takenSet.has(id) },
    isSelected (id) { return this.selected.has(id) },

    setContext ({ movieId, hora }) {
      // si cambia de película/horario, persistimos lo actual y cargamos el nuevo
      if (this.movieId !== movieId || this.hora !== hora) {
        this.persist()
        this.movieId = movieId || null
        this.hora = hora || null
        this.selected.clear()
        this.load()
      }
    },

    toggle (id) {
      if (this.isTaken(id)) return
      this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id)
    },

    confirm () {
      const set = this.takenSet
      this.selected.forEach(id => { if (!set.has(id)) this.takenIds.push(id) })
      this.selected.clear()
      this.persist()
    },

    clearAll () {
      this.takenIds = []
      this.selected.clear()
      this.persist()
    },

    persist () {
      if (!process.client || !this.movieKey) return
      const payload = { takenIds: this.takenIds, tables: this.tables }
      localStorage.setItem(this.movieKey, JSON.stringify(payload))
    },

    load () {
      if (!process.client || !this.movieKey) return
      try {
        const raw = localStorage.getItem(this.movieKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          this.takenIds = Array.isArray(parsed.takenIds) ? parsed.takenIds : []
          this.tables = Array.isArray(parsed.tables) && parsed.tables.length
            ? parsed.tables
            : createDefaultLayout()
        } else {
          // si no existe estado previo, limpia ocupación para este contexto
          this.takenIds = []
        }
      } catch {
        this.takenIds = []
      }
    }
  }
})
