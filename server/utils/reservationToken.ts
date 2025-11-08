import crypto from 'node:crypto'

type ReservationTokenPayload = {
  rid: string
  sid?: string | null
  ts: number
}

export const encodeReservationToken = (payload: ReservationTokenPayload, secret: string) => {
  if (!secret) throw new Error('Missing QR secret')
  const data = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex')
  const token = JSON.stringify({ data, signature })
  return Buffer.from(token).toString('base64url')
}

export const decodeReservationToken = (token: string, secret: string): ReservationTokenPayload => {
  if (!token) throw new Error('Token requerido')
  if (!secret) throw new Error('Missing QR secret')
  let raw: string
  try {
    raw = Buffer.from(token, 'base64url').toString('utf8')
  } catch {
    throw new Error('Token inv��lido')
  }

  let parsed: { data: string; signature: string }
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Token inv��lido')
  }

  const expected = crypto.createHmac('sha256', secret).update(parsed.data).digest('hex')
  if (expected !== parsed.signature) {
    throw new Error('Token inv��lido')
  }

  const payload = JSON.parse(parsed.data) as ReservationTokenPayload
  return payload
}
