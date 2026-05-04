import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import BrandKitTestCard from '@/components/debug/BrandKitTestCard'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'skipped'
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
  disabled?: boolean
}

function TestCard({ step, title, description, note, state, onRun, disabled }: TestCardProps) {
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
    skipped: 'bg-gray-400',
  }[state.status]

  const cardBorder = {
    idle: 'border-gray-200',
    loading: 'border-yellow-300',
    success: 'border-green-300',
    error: 'border-red-300',
    skipped: 'border-gray-300 border-dashed',
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
            disabled={state.status === 'loading' || disabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded px-4 py-2"
          >
            {state.status === 'loading' ? 'Running...' : 'Run Test'}
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        ⚠️ {note}
      </div>

      {state.status === 'skipped' && (
        <div className="mt-3 text-sm rounded px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200">
          ⊘ Skipped — previous step failed
        </div>
      )}

      {state.message && state.status !== 'skipped' && (
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

type StepDef = {
  fnName: string
  label: string
  setter: React.Dispatch<React.SetStateAction<CardState>>
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

  const [isRunningAll, setIsRunningAll] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [overallMessage, setOverallMessage] = useState('')
  const [currentStep, setCurrentStep] = useState<number | null>(null)

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
  ): Promise<CardState> {
    setter({ status: 'loading', result: null, message: '' })
    let finalState: CardState
    try {
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { adAccountId, accessToken },
      })
      if (error) throw error
      finalState = {
        status: data.success ? 'success' : 'error',
        result: data,
        message: data.success
          ? `${data.total_merged ?? data.total_pulled ?? data.total_fetched ?? 0} pulled · ${data.total_stored ?? 0} stored`
          : data.upsert_error ?? data.error ?? 'Unknown error',
      }
    } catch (err: any) {
      finalState = {
        status: 'error',
        result: null,
        message: err.message ?? 'Function failed',
      }
    }
    setter(finalState)
    return finalState
  }

  async function runSingle(
    fnName: string,
    setter: React.Dispatch<React.SetStateAction<CardState>>,
  ) {
    if (!validate()) return
    await runTest(fnName, setter)
  }

  function resetAll() {
    setCampaignState(initialState)
    setAdSetState(initialState)
    setAdState(initialState)
    setCreativeState(initialState)
    setInsightState(initialState)
    setOverallStatus('idle')
    setOverallMessage('')
    setCurrentStep(null)
  }

  async function runAll() {
    if (!validate()) return

    const steps: StepDef[] = [
      { fnName: 'test-campaigns', label: 'Campaigns', setter: setCampaignState },
      { fnName: 'test-adsets', label: 'Ad Sets', setter: setAdSetState },
      { fnName: 'test-ads', label: 'Ads', setter: setAdState },
      { fnName: 'test-creatives', label: 'Creatives', setter: setCreativeState },
      { fnName: 'test-insights', label: 'Insights', setter: setInsightState },
    ]

    setIsRunningAll(true)
    setOverallStatus('running')
    setOverallMessage('')
    // Reset all cards to idle at the start
    steps.forEach(s => s.setter(initialState))

    let failedAt: { index: number; step: StepDef; message: string } | null = null

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      setCurrentStep(i + 1)
      const result = await runTest(step.fnName, step.setter)
      if (result.status === 'error') {
        failedAt = { index: i, step, message: result.message }
        // Mark remaining steps as skipped
        for (let j = i + 1; j < steps.length; j++) {
          steps[j].setter({ status: 'skipped', result: null, message: '' })
        }
        break
      }
      // Small delay between steps
      if (i < steps.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    setCurrentStep(null)
    setIsRunningAll(false)

    if (failedAt) {
      setOverallStatus('error')
      setOverallMessage(
        `Failed at Step ${failedAt.index + 1} (${failedAt.step.fnName}): ${failedAt.message}`,
      )
    } else {
      setOverallStatus('success')
      setOverallMessage('All 5 steps completed successfully')
    }
  }

  const progressPct = currentStep ? (currentStep / 5) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Meta Sync Debug</h1>
          <p className="text-gray-600 mt-2">
            Test each sync segment independently, or run the full chain. Order: Campaigns → Ad Sets → Ads → Creatives → Insights
          </p>
        </header>

        <BrandKitTestCard />

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

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={runAll}
              disabled={isRunningAll}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded px-5 py-2.5 text-sm"
            >
              {isRunningAll ? `Running Step ${currentStep} of 5...` : '▶ Run All Steps Sequentially'}
            </button>
            <button
              onClick={resetAll}
              disabled={isRunningAll}
              className="border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm rounded px-4 py-2.5"
            >
              Reset All
            </button>
          </div>
        </section>

        {isRunningAll && currentStep && (
          <section className="bg-white border border-yellow-300 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm font-medium text-gray-800 mb-2">
              <span>Step {currentStep} of 5 — Running...</span>
              <span className="text-gray-500">{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </section>
        )}

        {overallStatus === 'success' && (
          <section className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-green-900">
            <div className="font-semibold">✅ {overallMessage}</div>
          </section>
        )}

        {overallStatus === 'error' && (
          <section className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-900">
            <div className="font-semibold">❌ {overallMessage}</div>
          </section>
        )}

        <section className="space-y-4">
          <TestCard
            step="STEP 1"
            title="Campaigns"
            description="Pull all campaigns from the Meta ad account."
            note="No prerequisites."
            state={campaignState}
            disabled={isRunningAll}
            onRun={() => runSingle('test-campaigns', setCampaignState)}
          />
          <TestCard
            step="STEP 2"
            title="Ad Sets"
            description="Pull all ad sets and link them to stored campaigns."
            note="Requires Campaigns to be synced first."
            state={adSetState}
            disabled={isRunningAll}
            onRun={() => runSingle('test-adsets', setAdSetState)}
          />
          <TestCard
            step="STEP 3"
            title="Ads"
            description="Pull image-based ads and link to stored ad sets."
            note="Requires Ad Sets to be synced first."
            state={adState}
            disabled={isRunningAll}
            onRun={() => runSingle('test-ads', setAdState)}
          />
          <TestCard
            step="STEP 4"
            title="Creatives"
            description="Batch-fetch creative details and resolve image URLs."
            note="Requires Ads to be synced first."
            state={creativeState}
            disabled={isRunningAll}
            onRun={() => runSingle('test-creatives', setCreativeState)}
          />
          <TestCard
            step="STEP 5"
            title="Insights"
            description="Pull last 30 days of daily performance metrics."
            note="Requires Ads to be synced first. Test mode pulls 30 days only."
            state={insightState}
            disabled={isRunningAll}
            onRun={() => runSingle('test-insights', setInsightState)}
          />
        </section>
      </div>
    </div>
  )
}
