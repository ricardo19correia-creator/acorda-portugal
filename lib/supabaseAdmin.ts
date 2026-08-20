export const supabaseAdmin = {
  async rpc(fnName: string, params: Record<string, any>) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { data: null, error: new Error('Supabase credentials not configured') }
    }

    try {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(params),
        cache: 'no-store',
      })

      if (!res.ok) {
        const text = await res.text()
        return { data: null, error: new Error(`RPC error ${res.status}: ${text}`) }
      }

      const data = await res.json()
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err }
    }
  },
}
