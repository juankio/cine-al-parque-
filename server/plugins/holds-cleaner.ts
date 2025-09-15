export default defineNitroPlugin(() => {
    // Corre cada 60s. En producción usa un job/cron serio (BullMQ/Agenda).
    const interval = setInterval(async () => {
        try {
            const { Reservation } = await import('@/server/models/Reservation')
            const { ReservationSeat } = await import('@/server/models/ReservationSeat')
            const now = new Date()
            // Buscar reservas pending vencidas
            const expired = await Reservation.find({
                status: 'pending',
                expiresAt: { $lte: now }
            }).select('_id').lean()

            if (!expired.length) return
            const ids = expired.map(r => r._id)
            // liberar asientos y marcar expired
            await ReservationSeat.deleteMany({ reservationId: { $in: ids } })
            await Reservation.updateMany({ _id: { $in: ids } }, { $set: { status: 'expired' } })
            // console.log(`[holds-cleaner] Expiradas: ${ids.length}`)
        } catch (e) {
            // console.error('[holds-cleaner] error', e)
        }
    }, 60_000)

    // Limpieza al cerrar (hot reload)
    // @ts-ignore
    if (import.meta.dev) {
        // @ts-ignore
        import.meta.hot?.on('vite:beforeFullReload', () => clearInterval(interval))
    }
})
