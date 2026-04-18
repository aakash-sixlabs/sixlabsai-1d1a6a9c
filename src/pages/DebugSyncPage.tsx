import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

type Status = 'idle' | 'loading' | 'success' | 'error'
interface CardState {
  status: Status
  result: any
  message: string
}

const initialState: CardState = { status: 'idle', result: null, message: '' }

interface TestCardProps {
  step: string
  title: string
  description: string
  note: string
  state: CardState
  onRun: () => void
}

function TestCard({ step, title, description, note, state, onRun }: TestCardProps) {
  const [copied, setCopied] = useState(false)

  function copyResult() {
    navigator.clipboard.writeText(JSON.stringify(state.result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusDot = {
    idle: 'bg-gray-300',
    loading: 'bg-yellow-400 animate-pulse',
    success: 'bg-green-500',
    error: 'bg-red-500',
  }[state.status]

  const cardBorder = {
    idle: 'border-gray-200',
    loading: 'border-yellow-300',
    success: 'border-green-300',
    error: 'border-red-300',
  }[state.status]

  return (
    <div className={`bg-white border-2 rounded-lg p-5 ${cardBorder}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xs font-mono bg-gray-100 text-gray-700 rounded px-2 py-1">
            {step}
          </span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`w-3 h-3 rounded-full ${statusDot}`} />
          <button
            onClick={onRun}
            disabled={state.status === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded px-4 py-2"
          >
            {state.status === 'loading' ? 'Running...' : 'Run Test'}
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        ⚠️ {note}
      </div>

      {state.message && (
        <div
          className={`mt-3 text-sm rounded px-3 py-2 ${
            state.status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {state.status === 'success' ? '✅' : '❌'} {state.message}
        </div>
      )}

      {state.result && (
        <div className="mt-3 relative">
          <div className="bg-gray-900 text-gray-100 rounded p-3 max-h-80 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(state.result, null, 2)}
            </pre>
          </div>
          <button
            onClick={copyResult}
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs rounded px-2 py-1"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DebugSyncPage() {
  const [adAccountId, setAdAccountId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  const [campaignState, setCampaignState] = useState<CardState>(initialState)
  const [adSetState, setAdSetState] = useState<CardState>(initialState)
  const [adState, setAdState] = useState<CardState>(initialState)
  const [creativeState, setCreativeState] = useState<CardState>(initialState)
  const [insightState, setInsightState] = useState<CardState>(initialState)

  function validate() {
    if (!adAccountId.trim()) {
      alert('Please enter an Ad Account ID')
      return false
    }
    if (!accessToken.trim()) {
      alert('Please enter an Access Token')
      return false
    }
    return true
  }

  async function runTest(
    fnName: string,
    setter: React.Dispatch<React.SetStateAction<CardState>>,
  ) {
    if (!validate()) return
    setter({ status: 'loading', result: null, message: '' })
    try {
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { adAccountId, accessToken },
      })
      if (error) throw error
      setter({
        status: data.success ? 'success' : 'error',
        result: data,
        message: data.success
          ? `${data.total_pulled ?? data.total_fetched ?? 0} pulled · ${data.total_stored ?? 0} stored`
          : data.upsert_error ?? data.error ?? 'Unknown error',
      })
    } catch (err: any) {
      setter({
        status: 'error',
        result: null,
        message: err.message ?? 'Function failed',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Meta Sync Debug</h1>
          <p className="text-gray-600 mt-2">
            Test each sync segment independently. Run in order: Campaigns → Ad Sets → Ads → Creatives → Insights
          </p>
        </header>

        <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Connection Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Account ID (Supabase UUID)
            </label>
            <input
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Access Token
            </label>
            <div className="flex gap-2">
              <input
                type={showToken ? 'text' : 'password'}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste Meta access token here"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="border rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <TestCard
            step="STEP 1"
            title="Campaigns"
            description="Pull all campaigns from the Meta ad account."
            note="No prerequisites."
            state={campaignState}
            onRun={() => runTest('test-campaigns', setCampaignState)}
          />
          <TestCard
            step="STEP 2"
            title="Ad Sets"
            description="Pull all ad sets and link them to stored campaigns."
            note="Requires Campaigns to be synced first."
            state={adSetState}
            onRun={() => runTest('test-adsets', setAdSetState)}
          />
          <TestCard
            step="STEP 3"
            title="Ads"
            description="Pull image-based ads and link to stored ad sets."
            note="Requires Ad Sets to be synced first."
            state={adState}
            onRun={() => runTest('test-ads', setAdState)}
          />
          <TestCard
            step="STEP 4"
            title="Creatives"
            description="Batch-fetch creative details and resolve image URLs."
            note="Requires Ads to be synced first."
            state={creativeState}
            onRun={() => runTest('test-creatives', setCreativeState)}
          />
          <TestCard
            step="STEP 5"
            title="Insights"
            description="Pull last 7 days of daily performance metrics."
            note="Requires Ads to be synced first. Test mode pulls 7 days only."
            state={insightState}
            onRun={() => runTest('test-insights', setInsightState)}
          />
        </section>
      </div>
    </div>
  )
}
