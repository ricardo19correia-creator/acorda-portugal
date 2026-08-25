import { redirect } from 'next/navigation'

export default async function JogoRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      query.set(key, value)
    } else if (Array.isArray(value)) {
      query.set(key, value.join(','))
    }
  }
  const queryString = query.toString()
  redirect(queryString ? `/jogar?${queryString}` : '/jogar')
}
