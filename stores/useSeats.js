import { defineStore } from 'pinia'


const KEY = 'cine-seats-v1'


const loadTaken = () => {
if (typeof window === 'undefined') return new Set()
try {
const raw = localStorage.getItem(KEY)
return new Set(raw ? JSON.parse(raw) : [])
} catch { return new Set() }
}


export const useSeats = defineStore('seats', {
state: () => ({
rows: 8,
cols: 12,
taken: loadTaken(), // Set de asientos ocupados
selected: new Set() // Set de asientos seleccionados en la sesión
}),
getters: {
total (state) { return state.rows * state.cols },
selectedCount (state) { return state.selected.size }
},
actions: {
seatId (r, c) { return `${r}-${c}` },
isTaken (id) { return this.taken.has(id) },
isSelected (id) { return this.selected.has(id) },
toggle (id) {
if (this.isTaken(id)) return
if (this.selected.has(id)) this.selected.delete(id)
else this.selected.add(id)
},
confirm () {
this.selected.forEach(id => this.taken.add(id))
this.selected.clear()
this.persist()
},
clearAll () {
this.taken.clear()
this.selected.clear()
this.persist()
},
persist () {
if (typeof window === 'undefined') return
localStorage.setItem(KEY, JSON.stringify([...this.taken]))
}
}
})