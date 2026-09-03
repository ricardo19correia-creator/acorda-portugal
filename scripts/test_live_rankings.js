async function test() {
  const urls = [
    'https://acordaportugal.pt/api/version',
    'https://acordaportugal.pt/api/shop/diag',
    'https://acordaportugal.pt/api/rankings',
    'https://acordaportugal.pt/api/rankings?mode=nacional',
    'https://acordaportugal.pt/api/rankings?mode=guerra',
    'https://acordaportugal.pt/api/rankings?mode=temporada',
  ]
  for (const u of urls) {
    try {
      const res = await fetch(u)
      const text = await res.text()
      console.log(`URL: ${u} -> STATUS: ${res.status}, BODY: ${text.slice(0, 120)}`)
    } catch (e) {
      console.error(`URL: ${u} -> ERROR:`, e.message)
    }
  }
}
test()
