export type ShowtimeInfo = {
    id: string
    movieId: string
    fechaHora: string
    sala?: string
    price?: number
    movie?: {
        id: string
        titulo: string
        poster?: string
        duracion?: number
        clasificacion?: string
        sinopsis?: string
    } | null
}

export type CartLine = {
    menuItemId: string
    nombre: string
    unitPrice: number
    qty: number
}

export type ReservationSnapshot = {
    id: string
    total: number
    seatsTotal: number
    foodTotal: number
    expiresAt?: string | null
    seats: string[]
    status: 'pending' | 'paid'
    items?: CartLine[]
}

export type LayoutStat = { label: string; value: number }
