import { usersCol } from '../utils/db'

export default async () => {
    try {
        const col = await usersCol()
        const desired = { key: { email: 1 } as Record<string, 1 | -1>, name: 'email_1', unique: true }
        const indexes = await col.indexes()
        const existing = indexes.find(i => JSON.stringify(i.key) === JSON.stringify(desired.key))

        if (!existing) {
            await col.createIndex(desired.key, { name: desired.name, unique: desired.unique })
            console.log('[mongo-indexes] users.email index created (unique)')
            return
        }

        const isUnique = !!(existing as any).unique
        if (isUnique === desired.unique) {
            console.log('[mongo-indexes] users.email index OK →', existing.name, 'unique:', isUnique)
            return
        }

        console.warn(`[mongo-indexes] users.email index exists with different options (name: ${existing.name}, unique: ${isUnique}). No changes applied.`)
        if (process.env.NUXT_DROP_EMAIL_INDEX === 'true') {
            await col.dropIndex(existing.name)
            await col.createIndex(desired.key, { name: desired.name, unique: desired.unique })
            console.log('[mongo-indexes] users.email index dropped & recreated as unique')
        }
    } catch (e) {
        console.error('[mongo-indexes] error creating indexes', e)
    }
}
