import { useEffect, useRef, useState } from 'react'
import {
  fetchAdminOverview,
  fetchCurrentUser,
  fetchDisposals,
  loginUser,
  registerUser,
  submitDisposal,
} from './services/disposalApi'
import Images from './assets/images'
import './App.css'

/**
 * SmartWaste MVP - Main Application Component
 * 
 * Image Integration Strategy:
 * - SectionBackgrounds: Used as card backgrounds for different tabs
 * - HeroImages: Authentication and dashboard hero sections
 * - ContextualImages: Inline illustrations for specific waste types
 * - ProblemVisuals: Motivational imagery showing waste management challenges
 */

// Extract images for easy reference
const { SectionBackgrounds, HeroImages, ContextualImages, ProblemVisuals, ImpactVisuals } = Images

const agritechImages = {
  rewards: '/rewards-hero.jpg',
  admin: '/admin-hero.jpg',
  points: '/points-demo.jpg',
}

const wasteTypeOptions = [
  { value: 'plastic', label: 'Plastic' },
  { value: 'organic', label: 'Organic' },
  { value: 'general', label: 'General' },
]
const baseTabs = [
  { id: 'scan', label: 'Scan', kicker: 'Field log', hint: 'Camera and bin capture' },
  { id: 'progress', label: 'Progress', kicker: 'Impact', hint: 'Habits and recovery' },
  { id: 'rewards', label: 'Rewards', kicker: 'Motivation', hint: 'Badges and leaderboard' },
]
const adminTab = { id: 'admin', label: 'Admin', kicker: 'Operations', hint: 'Network-wide overview' }
const WEEKLY_GOAL = 7
const DEMO_BIN_ID = 'BIN-001'
const SESSION_KEY = 'smartwaste-session-token'
const leaderboardTemplate = [
  { id: 'user-002', name: 'Amina', points: 90 },
  { id: 'user-003', name: 'Brian', points: 70 },
  { id: 'user-004', name: 'Joy', points: 50 },
]

const onboardingSteps = [
  {
    title: 'Choose a bin',
    description: 'Use the camera, demo bin, or manual entry to pick where the waste is going.',
  },
  {
    title: 'Pick the waste type',
    description: 'Select plastic, organic, or general before you log the disposal.',
  },
  {
    title: 'Earn and track impact',
    description: 'Each proper disposal adds points, builds streaks, and improves your impact view.',
  },
]

const scanGuideCards = [
  {
    id: 'bin',
    badge: '01',
    title: 'Choose a bin',
    description: 'Use the camera, demo bin, or manual entry to pick where the waste is going.',
    image: Images.collectionTab.smartCollection,
  },
  {
    id: 'waste',
    badge: '02',
    title: 'Pick the waste type',
    description: 'Select plastic, organic, or general before you log the disposal.',
    image: Images.progressTab.sectionBackground,
  },
  {
    id: 'reward',
    badge: '03',
    title: 'Earn and track impact',
    description: 'Each proper disposal adds points, builds streaks, and improves your impact view.',
    image: agritechImages.points,
  },
]

const authHighlights = [
  'Scan bins quickly on phone or desktop',
  'Track points, streaks, and impact over time',
  'Unlock rewards while building disposal habits',
]

function isSameDay(leftDate, rightDate) {
  return leftDate.toDateString() === rightDate.toDateString()
}

function getStreak(events) {
  if (events.length === 0) return 0
  const uniqueDays = [...new Set(events.map((event) => new Date(event.createdAt).toDateString()))]
    .map((value) => new Date(value))
    .sort((leftDate, rightDate) => rightDate - leftDate)
  const today = new Date()
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterday = new Date(todayAtMidnight)
  yesterday.setDate(yesterday.getDate() - 1)
  if (!isSameDay(uniqueDays[0], todayAtMidnight) && !isSameDay(uniqueDays[0], yesterday)) return 0
  let streak = 1
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previousDate = uniqueDays[index - 1]
    const currentDate = uniqueDays[index]
    const expectedDate = new Date(previousDate)
    expectedDate.setDate(expectedDate.getDate() - 1)
    if (isSameDay(currentDate, expectedDate)) streak += 1
    else break
  }
  return streak
}

function formatDayKey(date) {
  return date.toISOString().slice(0, 10)
}

function getLastSevenDaysActivity(events) {
  const today = new Date()
  const days = []
  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date(today)
    day.setHours(0, 0, 0, 0)
    day.setDate(today.getDate() - index)
    const count = events.filter((event) => isSameDay(new Date(event.createdAt), day)).length
    days.push({
      key: day.toISOString(),
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      date: day.toLocaleDateString(),
      count,
    })
  }
  return days
}

function getChartFromDailyCounts(entries = []) {
  const countMap = new Map(entries.map((entry) => [entry.day, entry.count]))
  const today = new Date()
  const days = []
  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date(today)
    day.setHours(0, 0, 0, 0)
    day.setDate(today.getDate() - index)
    const dayKey = formatDayKey(day)
    days.push({
      key: dayKey,
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      date: day.toLocaleDateString(),
      count: countMap.get(dayKey) ?? 0,
    })
  }
  return days
}

function renderBarChart(chartEntries, railClassName = '', fillClassName = '') {
  const maxCount = Math.max(...chartEntries.map((entry) => entry.count), 1)

  return (
    <div className="bar-chart">
      {chartEntries.map((entry) => (
        <div className="bar-group" key={entry.key}>
          <span className="bar-value">{entry.count}</span>
          <div className={`bar-rail ${railClassName}`.trim()}>
            <div
              className={`bar-fill ${fillClassName}`.trim()}
              style={{ height: `${Math.max((entry.count / maxCount) * 100, entry.count > 0 ? 18 : 0)}%` }}
              title={`${entry.date}: ${entry.count}`}
            />
          </div>
          <span className="bar-label">{entry.label}</span>
        </div>
      ))}
    </div>
  )
}

function App() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectorRef = useRef(null)
  const scanIntervalRef = useRef(null)

  const [activeTab, setActiveTab] = useState('scan')
  const [wasteType, setWasteType] = useState('plastic')
  const [binId, setBinId] = useState(DEMO_BIN_ID)
  const [manualBinId, setManualBinId] = useState(DEMO_BIN_ID)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false)
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dashboardError, setDashboardError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [events, setEvents] = useState([])
  const [adminOverview, setAdminOverview] = useState(null)
  const [scannerMessage, setScannerMessage] = useState('Ready to scan a bin QR code or use the demo bin.')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const [barcodeSupported, setBarcodeSupported] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem(SESSION_KEY) || '')
  const [currentUser, setCurrentUser] = useState(null)

  const isAdmin = currentUser?.role === 'admin'
  const visibleTabs = isAdmin ? [...baseTabs, adminTab] : baseTabs

  useEffect(() => {
    const detectorAvailable = typeof window !== 'undefined' && 'BarcodeDetector' in window
    setBarcodeSupported(detectorAvailable)
    if (detectorAvailable) {
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
    }
    return () => stopCamera()
  }, [])

  useEffect(() => {
    async function restoreSession() {
      if (!sessionToken) {
        setIsRestoringSession(false)
        return
      }

      try {
        const response = await fetchCurrentUser(sessionToken)
        setCurrentUser(response.user)
      } catch {
        localStorage.removeItem(SESSION_KEY)
        setSessionToken('')
      } finally {
        setIsRestoringSession(false)
      }
    }

    restoreSession()
  }, [sessionToken])

  useEffect(() => {
    if (!currentUser || !sessionToken) {
      setEvents([])
      setAdminOverview(null)
      setIsLoadingDashboard(false)
      return
    }

    loadDashboard(sessionToken)
    if (currentUser.role === 'admin') {
      loadAdminOverview(sessionToken)
    } else {
      setAdminOverview(null)
      setAdminError('')
    }
  }, [currentUser, sessionToken])

  useEffect(() => {
    if (activeTab === 'admin' && !isAdmin) {
      setActiveTab('scan')
    }
  }, [activeTab, isAdmin])

  useEffect(() => {
    if (!isCameraOpen || !videoRef.current || !detectorRef.current) return undefined
    scanIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current)
        if (barcodes.length > 0) {
          const scannedValue = barcodes[0].rawValue?.trim() || DEMO_BIN_ID
          setBinId(scannedValue)
          setManualBinId(scannedValue)
          setScannerMessage(`QR detected: ${scannedValue}`)
          stopCamera()
        }
      } catch {
        setScannerMessage('Camera is on, but QR detection is not responding. You can still use manual entry.')
      }
    }, 900)
    return () => {
      if (scanIntervalRef.current) {
        window.clearInterval(scanIntervalRef.current)
        scanIntervalRef.current = null
      }
    }
  }, [isCameraOpen])

  function stopCamera() {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)
    setIsStartingCamera(false)
  }

  async function startCameraScan() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerMessage('This device or browser does not support camera scanning. Use the demo or manual entry instead.')
      return
    }
    setIsStartingCamera(true)
    setScannerMessage(
      barcodeSupported
        ? 'Point the camera at a QR code on the bin.'
        : 'Camera preview opened. This browser does not support built-in QR detection, so use manual entry or demo bin if needed.',
    )
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setIsCameraOpen(true)
      setIsStartingCamera(false)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      setIsStartingCamera(false)
      setScannerMessage('Camera access was blocked or unavailable. Use demo scan or enter a bin code manually.')
    }
  }

  function useDemoScan() {
    stopCamera()
    setBinId(DEMO_BIN_ID)
    setManualBinId(DEMO_BIN_ID)
    setScannerMessage(`Demo bin selected: ${DEMO_BIN_ID}`)
  }

  function applyManualBin() {
    const normalizedBinId = manualBinId.trim() || DEMO_BIN_ID
    setBinId(normalizedBinId)
    setManualBinId(normalizedBinId)
    setScannerMessage(`Manual bin selected: ${normalizedBinId}`)
  }

  async function loadDashboard(token) {
    setIsLoadingDashboard(true)
    setDashboardError('')
    try {
      const disposalEvents = await fetchDisposals(token)
      setEvents(disposalEvents)
    } catch (requestError) {
      setDashboardError(requestError.response?.data?.message || 'Unable to load your dashboard right now.')
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  async function loadAdminOverview(token) {
    setIsLoadingAdmin(true)
    setAdminError('')
    try {
      const overview = await fetchAdminOverview(token)
      setAdminOverview(overview)
    } catch (requestError) {
      setAdminOverview(null)
      setAdminError(requestError.response?.data?.message || 'Unable to load admin data right now.')
    } finally {
      setIsLoadingAdmin(false)
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthError('')
    setIsAuthSubmitting(true)

    try {
      const response =
        authMode === 'register'
          ? await registerUser(authForm)
          : await loginUser({
              email: authForm.email,
              password: authForm.password,
            })

      localStorage.setItem(SESSION_KEY, response.token)
      setSessionToken(response.token)
      setCurrentUser(response.user)
      setAuthForm({ name: '', email: '', password: '' })
    } catch (requestError) {
      setAuthError(requestError.response?.data?.message || 'Unable to continue right now.')
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  function handleSignOut() {
    stopCamera()
    localStorage.removeItem(SESSION_KEY)
    setSessionToken('')
    setCurrentUser(null)
    setEvents([])
    setAdminOverview(null)
    setResult(null)
    setActiveTab('scan')
  }

  async function handleDispose() {
    if (!sessionToken) {
      setError('Please sign in to continue.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const response = await submitDisposal({ wasteType, binId }, sessionToken)
      setResult(response)
      setEvents((currentEvents) => [response.event, ...currentEvents])
      if (isAdmin) {
        loadAdminOverview(sessionToken)
      }
      setWasteType('plastic')
      setActiveTab('progress')
    } catch (requestError) {
      setResult(null)
      setError(requestError.response?.data?.message || 'Unable to record disposal right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isRestoringSession) {
    return (
      <main className="app-shell">
        <section className="card">
          <p className="label">Session</p>
          <h2>Restoring your SmartWaste account...</h2>
        </section>
      </main>
    )
  }

  if (!currentUser) {
    return (
      <main className="app-shell auth-shell">
        <section className="hero-panel auth-hero-panel">
          <div className="auth-hero-grid">
            <div>
              <p className="eyebrow">SmartWaste MVP</p>
              <h1>Build disposal habits with points, impact, and progress.</h1>
              <p className="hero-copy">Create a simple account to start scanning bins, tracking your impact, and unlocking rewards.</p>
              <div className="hero-highlight-row">
                {authHighlights.map((highlight) => (
                  <div className="hero-highlight" key={highlight}>
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
            <div className="auth-hero-media" style={{ backgroundImage: `url('${HeroImages.auth}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="brand-mark-card">
                {/* SmartWaste brand identity card */}
                <img src={HeroImages.brandMark} alt="SmartWaste brand mark" className="brand-mark" />
                <div>
                  <p className="label">Platform Mission</p>
                  <h3>Clean communities, smarter sorting, stronger environmental habits.</h3>
                </div>
              </div>
              <div className="hero-photo-card">
                {/* Impact visualization - motivates users on environmental benefit */}
                <img src={HeroImages.impact} alt="Sustainable recycling app concept" className="hero-photo" />
              </div>
            </div>
          </div>
        </section>

        <section className="card auth-card">
          <div className="auth-toggle">
            <button type="button" className={`tab-button ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Sign in</button>
            <button type="button" className={`tab-button ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Create account</button>
          </div>

          <p className="helper-copy">Create account makes a normal user account. Admin access is private and only available to the owner account.</p>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' ? (
              <label className="field">
                <span>Name</span>
                <input type="text" value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} placeholder="Amina" />
              </label>
            ) : null}
            <label className="field">
              <span>Email</span>
              <input type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="........" />
            </label>
            <button className="primary-button" type="submit" disabled={isAuthSubmitting}>{isAuthSubmitting ? 'Saving...' : authMode === 'register' ? 'Create account' : 'Sign in'}</button>
            {authError ? <p className="status error">{authError}</p> : null}
          </form>
        </section>
      </main>
    )
  }

  const totalDisposals = events.length
  const totalPoints = events.reduce((sum, event) => sum + event.pointsEarned, 0)
  const plasticCount = events.filter((event) => event.wasteType === 'plastic').length
  const organicCount = events.filter((event) => event.wasteType === 'organic').length
  const generalCount = events.filter((event) => event.wasteType === 'general').length
  const estimatedSortedItems = totalDisposals
  const estimatedLandfillReduction = organicCount * 0.35
  const estimatedRecyclingSupport = plasticCount * 0.2
  const recentEvents = events.slice(0, 5)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const weeklyDisposals = events.filter((event) => new Date(event.createdAt) >= startOfWeek).length
  const weeklyGoalProgress = Math.min((weeklyDisposals / WEEKLY_GOAL) * 100, 100)
  const disposalsLeftForGoal = Math.max(WEEKLY_GOAL - weeklyDisposals, 0)
  const streakDays = getStreak(events)
  const isFirstJourney = totalDisposals === 0
  const leaderboard = [
    { id: currentUser.id, name: currentUser.name, points: totalPoints },
    ...leaderboardTemplate,
  ].sort((leftEntry, rightEntry) => rightEntry.points - leftEntry.points)

  const badgeDefinitions = [
    { id: 'first-disposal', title: 'First Toss', description: 'Log your first proper disposal.', unlocked: totalDisposals >= 1, progressLabel: `${Math.min(totalDisposals, 1)}/1` },
    { id: 'goal-setter', title: 'Goal Getter', description: 'Reach the weekly disposal goal.', unlocked: weeklyDisposals >= WEEKLY_GOAL, progressLabel: `${Math.min(weeklyDisposals, WEEKLY_GOAL)}/${WEEKLY_GOAL}` },
    { id: 'plastic-hero', title: 'Plastic Hero', description: 'Record 5 plastic disposals.', unlocked: plasticCount >= 5, progressLabel: `${Math.min(plasticCount, 5)}/5` },
    { id: 'green-streak', title: 'Green Streak', description: 'Maintain a 3-day disposal streak.', unlocked: streakDays >= 3, progressLabel: `${Math.min(streakDays, 3)}/3` },
    { id: 'compost-champion', title: 'Compost Champion', description: 'Sort 3 organic disposals correctly.', unlocked: organicCount >= 3, progressLabel: `${Math.min(organicCount, 3)}/3` },
    { id: 'impact-builder', title: 'Impact Builder', description: 'Reach 100 points total.', unlocked: totalPoints >= 100, progressLabel: `${Math.min(totalPoints, 100)}/100` },
  ]

  const unlockedBadges = badgeDefinitions.filter((badge) => badge.unlocked)
  const nextBadge = badgeDefinitions.find((badge) => !badge.unlocked)
  const weeklyChart = getLastSevenDaysActivity(events)
  const adminChart = getChartFromDailyCounts(adminOverview?.weeklyActivity ?? [])

  let topCategory = 'Plastic'
  if (organicCount > plasticCount && organicCount >= generalCount) topCategory = 'Organic'
  else if (generalCount > plasticCount && generalCount > organicCount) topCategory = 'General'

  const adminTotals = adminOverview ?? {
    totalDisposals: 0,
    totalPoints: 0,
    totalUsers: 0,
    wasteBreakdown: { plastic: 0, organic: 0, general: 0 },
    topBins: [],
    recentActivity: [],
  }
  const leadAdminBin = adminTotals.topBins[0] ?? null
  const successLead = totalDisposals <= 1
    ? 'Nice start. Your first proper disposal is logged and your progress journey is live.'
    : 'Another disposal logged. Your points, streaks, and impact just moved forward.'

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-topline">
          <div>
            <p className="eyebrow">SmartWaste MVP</p>
            <h1>Reward better disposal behavior with one quick scan.</h1>
            <p className="hero-copy">
              {isFirstJourney
                ? `Welcome, ${currentUser.name}. Start with one disposal and we'll turn it into points, progress, and visible impact.`
                : `Welcome back, ${currentUser.name}. Scan fast, track impact, unlock rewards, and keep the habit going.`}
            </p>
          </div>
          <div className="hero-chip-group">
            <div className="hero-chip"><span>Points</span><strong>{totalPoints}</strong></div>
            <div className="hero-chip"><span>Streak</span><strong>{streakDays}d</strong></div>
            <div className="hero-chip"><span>Role</span><strong>{isAdmin ? 'Admin' : 'User'}</strong></div>
            <button type="button" className="ghost-button signout-button" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
      </section>

      <nav className="tab-bar" aria-label="Primary views">
        {visibleTabs.map((tab) => <button key={tab.id} type="button" className={`tab-button tab-${tab.id} ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id}><span className="tab-kicker">{tab.kicker}</span><strong>{tab.label}</strong><span className="tab-hint">{tab.hint}</span></button>)}
      </nav>

      {dashboardError ? <p className="status error card slim-card">{dashboardError}</p> : null}

      {activeTab === 'scan' ? <section className="card scan-card" style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92)), url('${SectionBackgrounds.scan}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="card-header"><div><p className="label">Scan & Dispose</p><h2>Quick QR scan to log waste</h2><p className="subtitle">Point camera at any SmartWaste bin to start earning points</p></div><span className="bin-badge">{binId}</span></div><section className="quick-guide-section"><div className="guide-header"><p className="label">How it works</p><h3>Three simple steps, now visual</h3><p className="subtitle">Use the real product flow instead of generic illustrations: bin selection, waste sorting, then points and impact.</p></div><div className="guide-story-grid">{scanGuideCards.map((card) => <article className="guide-story-card" key={card.id}><div className="guide-story-copy"><span className="guide-badge">{card.badge}</span><strong>{card.title}</strong><p>{card.description}</p></div><div className="guide-story-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), url('${card.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} /></article>)}</div></section><section className="onboarding-banner"><div className="onboarding-copy"><p className="label">Quick guide</p><h3>{isFirstJourney ? 'Start here and log one simple disposal.' : 'Need a quick refresher before the next scan?'}</h3><p>{isFirstJourney ? 'SmartWaste works best when the first action feels effortless. Pick a bin, choose a waste type, and we will handle the reward and progress tracking for you.' : 'Choose a bin, confirm the waste type, and log the disposal to keep your streak, rewards, and impact moving.'}</p><div className="onboarding-grid">{onboardingSteps.map((step, index) => <article className="onboarding-step" key={step.title}><span className="step-index">0{index + 1}</span><strong>{step.title}</strong><p>{step.description}</p></article>)}</div></div><div className="onboarding-art-wrap"><div className="onboarding-art-stack"><img className="onboarding-art" src="/agritech-illustration.svg" alt="Farm field and smart bin illustration" />{/* Smart bin image - contextual to scanning activity */}<img className="scan-photo" src={ContextualImages.smartCollection} alt="Smart waste bin solution" /></div></div></section><div className="scanner-panel"><div className="scanner-actions"><button className="secondary-button" type="button" onClick={startCameraScan} disabled={isStartingCamera}>{isStartingCamera ? 'Opening camera...' : 'Use camera scan'}</button><button className="ghost-button" type="button" onClick={useDemoScan}>Use demo bin</button>{isCameraOpen ? <button className="ghost-button" type="button" onClick={stopCamera}>Stop camera</button> : null}</div><div className="scanner-preview">{isCameraOpen ? <video ref={videoRef} className="scanner-video" muted playsInline autoPlay /> : <div className="scanner-placeholder"><strong>Camera scan ready</strong><p>{barcodeSupported ? 'Open the camera and point it at a QR code on the bin.' : 'Your browser may not support automatic QR detection yet, but camera preview and manual fallback are available.'}</p></div>}</div><p className="scanner-message">{scannerMessage}</p><div className="manual-bin-row"><label className="field manual-field"><span>Manual bin code</span><input type="text" value={manualBinId} onChange={(event) => setManualBinId(event.target.value.toUpperCase())} placeholder="BIN-001" /></label><button className="ghost-button apply-button" type="button" onClick={applyManualBin}>Apply bin</button></div></div><label className="field"><span>Waste type</span><select value={wasteType} onChange={(event) => setWasteType(event.target.value)}>{wasteTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button className="primary-button" onClick={handleDispose} disabled={isSubmitting}>{isSubmitting ? 'Recording disposal...' : 'Log disposal'}</button>{error ? <p className="status error">{error}</p> : null}{result ? <div className="result-panel"><div className="result-media" style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), url('${agritechImages.points}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} /><div className="result-copy"><p className="label">Disposal logged</p><h3>+{result.pointsEarned} points earned</h3><p className="success-copy">{successLead}</p><p>Waste type: <strong>{result.event.wasteType}</strong></p><p>Bin ID: <strong>{result.event.binId}</strong></p><p>User: <strong>{currentUser.name}</strong></p><p>Logged at: <strong>{new Date(result.event.createdAt).toLocaleString()}</strong></p></div></div> : <p className="status">No disposal recorded yet.</p>}</section> : null}

      {activeTab === 'progress' ? <section className="card" style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92)), url('${SectionBackgrounds.progress}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="card-header"><div><p className="label">Progress & Impact</p><h2>Track your disposal habits</h2><p className="subtitle">Every properly sorted disposal makes a measurable environmental difference</p></div></div><section className="impact-guide-section"><div className="impact-row"><div className="impact-stat"><p className="label">What sorting does</p><h4>Cleaner material streams</h4><p className="stat-copy">Proper waste segregation reduces contamination and increases recovery rates in processing facilities.</p></div><div className="impact-image" style={{ backgroundImage: `url('${Images.emptyStates.unsortedWaste}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div></div></section><div className="stats-grid"><article className="stat-card"><p className="label">Total points</p><h3>{totalPoints}</h3><p>Rewarded for verified disposals.</p></article><article className="stat-card"><p className="label">Total disposals</p><h3>{totalDisposals}</h3><p>Proper disposal actions logged so far.</p></article><article className="stat-card"><p className="label">Top category</p><h3>{topCategory}</h3><p>Your most-used waste stream right now.</p></article></div><div className="motivation-grid"><article className="dashboard-panel highlight-panel"><p className="label">Weekly goal</p><h3>{weeklyDisposals} of {WEEKLY_GOAL} disposals this week</h3><div className="progress-track"><div className="progress-fill" style={{ width: `${weeklyGoalProgress}%` }} /></div><p className="motivation-copy">{disposalsLeftForGoal === 0 ? 'Weekly goal reached. Keep going and raise the bar.' : `${disposalsLeftForGoal} more disposals to hit this week's goal.`}</p></article><article className="dashboard-panel highlight-panel soft"><p className="label">Current streak</p><h3>{streakDays} day{streakDays === 1 ? '' : 's'}</h3><p className="motivation-copy">{streakDays > 0 ? 'You are building a consistent disposal habit.' : 'Make a disposal today to start a new streak.'}</p></article><article className="dashboard-panel highlight-panel warm"><p className="label">Impact snapshot</p><h3>{estimatedSortedItems} sorted actions</h3><p className="motivation-copy">Cleaner sorting, better waste recovery, stronger habits.</p></article></div><div className="dashboard-grid"><article className="dashboard-panel impact-panel"><p className="label">Estimated impact</p><h3>Small actions, visible environmental value.</h3><ul className="impact-list"><li>{estimatedSortedItems} items were sorted into the right stream.</li><li>Organic sorting may help avoid about {estimatedLandfillReduction.toFixed(1)} kg of landfill-bound waste.</li><li>Plastic sorting supports an estimated {estimatedRecyclingSupport.toFixed(1)} kg of cleaner recycling flow.</li></ul><p className="impact-note">These are MVP-friendly estimates to help users understand positive habits, not audited climate measurements.</p></article></div><div className="dashboard-grid"><article className="dashboard-panel"><p className="label">Waste breakdown</p><div className="breakdown-list"><div className="breakdown-row"><span>Plastic</span><strong>{plasticCount}</strong></div><div className="breakdown-row"><span>Organic</span><strong>{organicCount}</strong></div><div className="breakdown-row"><span>General</span><strong>{generalCount}</strong></div></div></article></div><div className="dashboard-grid category-cards-grid"><article className="dashboard-panel category-card plastic-card" style={{ backgroundImage: `linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(52, 152, 219, 0.25)), url('${Images.progressTab.plasticStats}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="category-content"><p className="label">Plastic Waste</p><h3>{plasticCount} disposals</h3><p className="category-description">Sorted plastic materials support cleaner recycling streams and reduce contamination.</p></div></article><article className="dashboard-panel category-card organic-card" style={{ backgroundImage: `linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(46, 204, 113, 0.25)), url('${Images.progressTab.organicStats}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="category-content"><p className="label">Organic Waste</p><h3>{organicCount} disposals</h3><p className="category-description">Proper composting reduces methane emissions and creates natural soil amendments.</p></div></article><article className="dashboard-panel category-card general-card" style={{ backgroundImage: `linear-gradient(135deg, rgba(155, 89, 182, 0.15), rgba(155, 89, 182, 0.25))`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="category-content"><p className="label">General Waste</p><h3>{generalCount} disposals</h3><p className="category-description">Mixed materials require careful handling to maximize recovery in processing chains.</p></div></article></div><div className="dashboard-grid chart-grid"><article className="dashboard-panel"><div className="card-header compact"><div><p className="label">Weekly activity</p><h3>Last 7 days</h3></div></div>{renderBarChart(weeklyChart)}</article><article className="dashboard-panel"><div className="card-header compact"><div><p className="label">Recent activity</p><h3>Latest disposal events</h3></div></div>{isLoadingDashboard ? <p className="status">Loading dashboard...</p> : recentEvents.length === 0 ? <p className="status">No activity yet. Your next scan will appear here.</p> : <div className="activity-list">{recentEvents.map((event) => <div className="activity-item" key={event.id}><div><strong>{event.wasteType}</strong><p>{event.binId} - {new Date(event.createdAt).toLocaleString()}</p></div><span className="points-pill">+{event.pointsEarned}</span></div>)}</div>}</article></div></section> : null}

      {activeTab === 'rewards' ? <section className="card" style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92)), url('${agritechImages.rewards}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="card-header"><div><p className="label">Rewards & Recognition</p><h2>Unlock badges and community status</h2><p className="subtitle">Build streaks, earn badges, and join the global SmartWaste community</p></div></div><section className="rewards-motivation-section"><div className="motivation-row"><div className="motivation-image" style={{ backgroundImage: `url('${agritechImages.rewards}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div><div className="motivation-content"><p className="label">Community Impact</p><h4>Every badge is a real difference</h4><p className="motivation-copy">When you earn badges, you're joined by thousands of others making the same environmental commitment. Your progress motivates others.</p></div></div></section>{isFirstJourney ? <section className="empty-state-panel"><p className="label">Rewards preview</p><h3>Your first logged disposal unlocks the first badge.</h3><p>This section becomes more motivating after you take action once. Come back here after your first scan to see rewards light up.</p><button type="button" className="ghost-button" onClick={() => setActiveTab('scan')}>Log first disposal</button></section> : null}<div className="dashboard-grid badge-grid"><article className="dashboard-panel badge-panel"><div className="card-header compact"><div><p className="label">Achievement badges</p><h3>Rewards for consistent habits</h3></div></div><div className="badge-list">{badgeDefinitions.map((badge) => <div className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`} key={badge.id}><div><strong>{badge.title}</strong><p>{badge.description}</p></div><div className="badge-meta"><span className="badge-status">{badge.unlocked ? 'Unlocked' : 'In progress'}</span><span className="badge-progress">{badge.progressLabel}</span></div></div>)}</div></article><article className="dashboard-panel next-badge-panel"><p className="label">Next milestone</p>{nextBadge ? <><h3>{nextBadge.title}</h3><p>{nextBadge.description}</p><p className="milestone-copy">Progress: <strong>{nextBadge.progressLabel}</strong></p></> : <><h3>Badge set complete</h3><p>You have unlocked every current achievement in this MVP.</p></>}<div className="milestone-summary"><strong>{unlockedBadges.length}</strong><span>badges unlocked</span></div></article></div><article className="dashboard-panel"><div className="card-header compact"><div><p className="label">Community momentum</p><h3>Mock leaderboard</h3></div></div><div className="leaderboard-list">{leaderboard.map((entry, index) => <div className="leaderboard-item" key={entry.id}><div><strong>#{index + 1} {entry.name}</strong><p>{entry.id === currentUser.id ? 'Your live score' : 'Demo participant'}</p></div><span className="points-pill">{entry.points} pts</span></div>)}</div></article></section> : null}

      {activeTab === 'admin' && isAdmin ? <section className="card" style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92)), url('${agritechImages.admin}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="card-header"><div><p className="label">Admin Dashboard</p><h2>System-wide smart waste operations</h2><p className="subtitle">Monitor disposals, users, bins, and environmental impact across all SmartWaste nodes</p></div><span className="mode-badge">Private</span></div><section className="admin-guide-section"><div className="admin-hero" style={{ backgroundImage: `url('${agritechImages.admin}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="admin-hero-content"><p className="label">System Overview</p><h4>Real-time waste management metrics</h4><p>Track global disposals, user engagement, and environmental outcomes to optimize the SmartWaste network.</p></div></div></section>{adminError ? <p className="status error">{adminError}</p> : null}<div className="stats-grid"><article className="stat-card"><p className="label">System disposals</p><h3>{adminTotals.totalDisposals}</h3><p>Total disposal events across all users.</p></article><article className="stat-card"><p className="label">Points issued</p><h3>{adminTotals.totalPoints}</h3><p>Rewards issued across the whole system.</p></article><article className="stat-card"><p className="label">Total users</p><h3>{adminTotals.totalUsers}</h3><p>Registered SmartWaste accounts.</p></article></div><div className="dashboard-grid chart-grid"><article className="dashboard-panel"><div className="card-header compact"><div><p className="label">System activity</p><h3>Last 7 days</h3></div></div>{isLoadingAdmin ? <p className="status">Loading admin data...</p> : renderBarChart(adminChart, 'admin-rail', 'admin-fill')}</article><article className="dashboard-panel"><div className="card-header compact"><div><p className="label">Top bins</p><h3>Highest usage bins</h3></div></div>{isLoadingAdmin ? <p className="status">Loading admin data...</p> : adminTotals.topBins.length === 0 ? <p className="status">No bin activity yet.</p> : <div className="leaderboard-list">{adminTotals.topBins.map((bin) => <div className="leaderboard-item" key={bin.binId}><div><strong>{bin.binId}</strong><p>Logged disposal activity</p></div><span className="points-pill">{bin.count} logs</span></div>)}</div>}</article></div><div className="dashboard-grid chart-grid"><article className="dashboard-panel"><div className="card-header compact"><div><p className="label">Recent system activity</p><h3>Latest disposal events</h3></div></div>{isLoadingAdmin ? <p className="status">Loading admin data...</p> : adminTotals.recentActivity.length === 0 ? <p className="status">No system activity yet.</p> : <div className="activity-list">{adminTotals.recentActivity.map((event) => <div className="activity-item" key={event.id}><div><strong>{event.userName} - {event.wasteType}</strong><p>{event.binId} - {new Date(event.createdAt).toLocaleString()}</p></div><span className="points-pill">+{event.pointsEarned}</span></div>)}</div>}</article><article className="dashboard-panel"><div className="card-header compact"><div><p className="label">Waste stream mix</p><h3>Category counts</h3></div></div><div className="breakdown-list"><div className="breakdown-row"><span>Plastic</span><strong>{adminTotals.wasteBreakdown.plastic}</strong></div><div className="breakdown-row"><span>Organic</span><strong>{adminTotals.wasteBreakdown.organic}</strong></div><div className="breakdown-row"><span>General</span><strong>{adminTotals.wasteBreakdown.general}</strong></div><div className="breakdown-row"><span>Lead bin</span><strong>{leadAdminBin ? leadAdminBin.binId : 'N/A'}</strong></div></div></article></div></section> : null}
    </main>
  )
}

export default App
