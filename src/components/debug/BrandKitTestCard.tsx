import { Component, ReactNode, useRef, useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

class BrandKitErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: any) {
    console.error('[BrandKitTestCard] render error:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <section className="bg-white border-2 border-red-300 rounded-lg p-5">
          <h2 className="font-semibold text-red-900">Brand Kit card crashed</h2>
          <pre className="mt-2 text-xs text-red-800 bg-red-50 p-3 rounded overflow-auto max-h-60">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-3 bg-red-600 text-white text-sm rounded px-3 py-1.5"
          >Reset</button>
        </section>
      )
    }
    return this.props.children
  }
}

interface LogEntry {
  ts: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  meta?: any
}

interface BrandKit {
  brand_name: string | null
  tagline: string | null
  website_url: string
  logo_url: string | null
  favicon_url: string | null
  screenshot_url: string | null
  colors: {
    primary: string | null
    secondary: string | null
    accent: string | null
    background: string | null
    text_primary: string | null
    text_secondary: string | null
  }
  fonts: { primary: string | null; heading: string | null; all: string[] }
  tone_of_voice: string | null
  product_categories: string[]
  target_audience: string | null
  value_propositions: string[]
  raw: any
  warnings: string[]
}

function ColorSwatch({ name, hex }: { name: string; hex: string | null }) {
  const [copied, setCopied] = useState(false)
  if (!hex) {
    return (
      <div className="flex flex-col items-center text-center w-20">
        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">—</div>
        <div className="mt-1 text-[10px] text-gray-500 uppercase tracking-wide">{name}</div>
      </div>
    )
  }
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(hex)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      className="flex flex-col items-center text-center w-20 group"
      title="Click to copy"
    >
      <div className="w-16 h-16 rounded-lg border border-gray-200 shadow-sm group-hover:scale-105 transition-transform" style={{ backgroundColor: hex }} />
      <div className="mt-1 text-[10px] text-gray-700 uppercase tracking-wide">{name}</div>
      <div className="text-[10px] font-mono text-gray-500">{copied ? 'copied' : hex}</div>
    </button>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-gray-100 text-gray-800 text-xs rounded-full px-3 py-1 mr-2 mb-2 border border-gray-200">{children}</span>
  )
}

const levelColor: Record<LogEntry['level'], string> = {
  info: 'text-sky-300',
  warn: 'text-amber-300',
  error: 'text-red-300',
  success: 'text-emerald-300',
}

function LogLine({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false)
  const time = entry.ts.slice(11, 23)
  const hasMeta = entry.meta && Object.keys(entry.meta).length > 0
  return (
    <div className="font-mono text-[11px] leading-relaxed">
      <div className="flex gap-2">
        <span className="text-gray-500 shrink-0">{time}</span>
        <span className={`shrink-0 uppercase ${levelColor[entry.level]}`}>{entry.level}</span>
        <span className="text-gray-100 break-words flex-1">{entry.message}</span>
        {hasMeta && (
          <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-200 shrink-0 text-[10px]">
            {open ? '▼' : '▶'}
          </button>
        )}
      </div>
      {hasMeta && open && (
        <pre className="mt-1 ml-[120px] text-[10px] text-gray-400 whitespace-pre-wrap bg-black/30 rounded p-2 border border-gray-700">
          {JSON.stringify(entry.meta, null, 2)}
        </pre>
      )}
    </div>
  )
}

function BrandKitTestCardInner() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string>('')
  const [kit, setKit] = useState<BrandKit | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showRaw, setShowRaw] = useState(false)
  const [showShot, setShowShot] = useState(false)
  const [copied, setCopied] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  function appendLog(entry: LogEntry) {
    setLogs((prev) => {
      const next = [...prev, entry]
      // auto scroll to bottom on next paint
      setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 0)
      return next
    })
  }

  async function run() {
    if (!url.trim()) {
      setError('Enter a website URL')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')
    setKit(null)
    setLogs([])

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
      const fnUrl = `https://${projectId}.supabase.co/functions/v1/test-brand-kit`
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

      const resp = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ websiteUrl: url.trim() }),
      })

      if (!resp.ok || !resp.body) {
        const text = await resp.text().catch(() => '')
        throw new Error(`HTTP ${resp.status}: ${text || resp.statusText}`)
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = ''
      let done = false

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        if (streamDone) break
        buffer += decoder.decode(value, { stream: true })

        let nlIndex: number
        while ((nlIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIndex)
          buffer = buffer.slice(nlIndex + 1)
          if (line.endsWith('\r')) line = line.slice(0, -1)

          if (line === '') {
            currentEvent = ''
            continue
          }
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
            continue
          }
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6)
            try {
              const parsed = JSON.parse(jsonStr)
              if (currentEvent === 'log') {
                appendLog(parsed as LogEntry)
              } else if (currentEvent === 'result') {
                // Defensive normalization — never trust shape
                const safeKit: BrandKit = {
                  brand_name: parsed?.brand_name ?? null,
                  tagline: parsed?.tagline ?? null,
                  website_url: parsed?.website_url ?? '',
                  logo_url: parsed?.logo_url ?? null,
                  favicon_url: parsed?.favicon_url ?? null,
                  screenshot_url: parsed?.screenshot_url ?? null,
                  colors: {
                    primary: parsed?.colors?.primary ?? null,
                    secondary: parsed?.colors?.secondary ?? null,
                    accent: parsed?.colors?.accent ?? null,
                    background: parsed?.colors?.background ?? null,
                    text_primary: parsed?.colors?.text_primary ?? null,
                    text_secondary: parsed?.colors?.text_secondary ?? null,
                  },
                  fonts: {
                    primary: parsed?.fonts?.primary ?? null,
                    heading: parsed?.fonts?.heading ?? null,
                    all: Array.isArray(parsed?.fonts?.all) ? parsed.fonts.all : [],
                  },
                  tone_of_voice: parsed?.tone_of_voice ?? null,
                  product_categories: Array.isArray(parsed?.product_categories) ? parsed.product_categories : [],
                  target_audience: parsed?.target_audience ?? null,
                  value_propositions: Array.isArray(parsed?.value_propositions) ? parsed.value_propositions : [],
                  raw: parsed?.raw ?? {},
                  warnings: Array.isArray(parsed?.warnings) ? parsed.warnings : [],
                }
                setKit(safeKit)
                setStatus('success')
                done = true
              } else if (currentEvent === 'error') {
                setError(parsed.error ?? 'Unknown error')
                setStatus('error')
                done = true
              }
            } catch (e) {
              console.error('SSE parse error', e, jsonStr)
            }
          }
        }
      }
    } catch (e: any) {
      setError(e?.message ?? 'Extraction failed')
      setStatus('error')
      appendLog({
        ts: new Date().toISOString(),
        level: 'error',
        message: `Client error: ${e?.message ?? 'unknown'}`,
      })
    }
  }

  function copyRaw() {
    if (!kit) return
    navigator.clipboard.writeText(JSON.stringify(kit, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="bg-white border-2 border-indigo-200 rounded-lg p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono bg-indigo-100 text-indigo-800 rounded px-2 py-1">BRAND KIT</span>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">Brand Kit Extraction (Test)</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter any brand website URL. Live logs stream from the function as it scrapes (Firecrawl) and infers brand voice (AI).
            Sandbox only — does not write to the database.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g. nike.com"
          className="flex-1 border rounded px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && run()}
          disabled={status === 'loading'}
        />
        <button
          onClick={run}
          disabled={status === 'loading'}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded px-5 py-2"
        >
          {status === 'loading' ? 'Extracting...' : 'Extract Brand Kit'}
        </button>
      </div>

      {/* Live logs */}
      {logs.length > 0 && (
        <div className="border border-gray-700 rounded bg-gray-950 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
            <div className="text-xs font-semibold text-gray-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'loading' ? 'bg-yellow-400 animate-pulse' : status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-500'}`} />
              Live logs
              <span className="text-gray-500">({logs.length})</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(logs.map(l => `[${l.ts}] ${l.level.toUpperCase()} ${l.message}${l.meta ? ' ' + JSON.stringify(l.meta) : ''}`).join('\n'))}
              className="text-[10px] text-gray-400 hover:text-gray-200"
            >
              Copy all
            </button>
          </div>
          <div className="max-h-72 overflow-auto p-3 space-y-1 bg-gray-950">
            {logs.map((entry, i) => <LogLine key={i} entry={entry} />)}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2">❌ {error}</div>
      )}

      {kit && (
        <div className="space-y-5 pt-2">
          {kit.warnings?.length > 0 && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              {kit.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
            </div>
          )}

          <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
            {kit.logo_url ? (
              <img src={kit.logo_url} alt="logo" className="w-16 h-16 object-contain rounded bg-white border border-gray-200" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
            ) : kit.favicon_url ? (
              <img src={kit.favicon_url} alt="favicon" className="w-16 h-16 object-contain rounded bg-white border border-gray-200 p-2" />
            ) : (
              <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">no logo</div>
            )}
            <div className="flex-1">
              <div className="text-xl font-bold text-gray-900">{kit.brand_name ?? 'Unknown brand'}</div>
              {kit.tagline && <div className="text-sm text-gray-600 italic">"{kit.tagline}"</div>}
              <a href={kit.website_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">{kit.website_url}</a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Color palette</h3>
            <div className="flex flex-wrap gap-3">
              <ColorSwatch name="primary" hex={kit.colors.primary} />
              <ColorSwatch name="secondary" hex={kit.colors.secondary} />
              <ColorSwatch name="accent" hex={kit.colors.accent} />
              <ColorSwatch name="bg" hex={kit.colors.background} />
              <ColorSwatch name="text" hex={kit.colors.text_primary} />
              <ColorSwatch name="text 2" hex={kit.colors.text_secondary} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Typography</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded p-3">
                <div className="text-[10px] uppercase text-gray-500 tracking-wide">Heading</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1" style={{ fontFamily: kit.fonts.heading ?? undefined }}>{kit.fonts.heading ?? '—'}</div>
              </div>
              <div className="border border-gray-200 rounded p-3">
                <div className="text-[10px] uppercase text-gray-500 tracking-wide">Body</div>
                <div className="text-base text-gray-900 mt-1" style={{ fontFamily: kit.fonts.primary ?? undefined }}>{kit.fonts.primary ?? '—'} — The quick brown fox jumps.</div>
              </div>
            </div>
            {kit.fonts.all.length > 0 && <div className="mt-2 text-xs text-gray-500">Detected: {kit.fonts.all.join(', ')}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tone of voice</h3>
              <div>{kit.tone_of_voice ? kit.tone_of_voice.split(',').map((t, i) => <Chip key={i}>{t.trim()}</Chip>) : <span className="text-sm text-gray-400">—</span>}</div>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Target audience</h3>
              <p className="text-sm text-gray-700">{kit.target_audience ?? '—'}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Product categories</h3>
            <div>{kit.product_categories.length ? kit.product_categories.map((c, i) => <Chip key={i}>{c}</Chip>) : <span className="text-sm text-gray-400">—</span>}</div>
          </div>

          <div className="border border-gray-200 rounded p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Value propositions</h3>
            {kit.value_propositions.length ? (
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">{kit.value_propositions.map((v, i) => <li key={i}>{v}</li>)}</ul>
            ) : <span className="text-sm text-gray-400">—</span>}
          </div>

          {kit.screenshot_url && (
            <details open={showShot} onToggle={(e) => setShowShot((e.target as HTMLDetailsElement).open)} className="border border-gray-200 rounded">
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-gray-700">Site screenshot</summary>
              <div className="p-3"><img src={kit.screenshot_url} alt="site screenshot" className="w-full rounded border border-gray-200" /></div>
            </details>
          )}

          <details open={showRaw} onToggle={(e) => setShowRaw((e.target as HTMLDetailsElement).open)} className="border border-gray-200 rounded relative">
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-gray-700">Raw response JSON</summary>
            <div className="relative">
              <button onClick={copyRaw} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs rounded px-2 py-1 z-10">{copied ? 'Copied!' : 'Copy'}</button>
              <div className="bg-gray-900 text-gray-100 rounded-b max-h-96 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap p-3">{JSON.stringify(kit, null, 2)}</pre>
              </div>
            </div>
          </details>
        </div>
      )}
    </section>
  )
}

export default function BrandKitTestCard() {
  return (
    <BrandKitErrorBoundary>
      <BrandKitTestCardInner />
    </BrandKitErrorBoundary>
  )
}
