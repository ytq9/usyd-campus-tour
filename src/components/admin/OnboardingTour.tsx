'use client'

import React, { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'usyd-campus-tour__onboarding-done'

// ---------------------------------------------------------------------------
// Tour steps
// ---------------------------------------------------------------------------
type Step = {
  icon: string
  title: string
  subtitle?: string
  body: string
  highlight?: string // optional coloured badge text
  highlightColor?: string
}

const STEPS: Step[] = [
  {
    icon: '🎓',
    title: 'Welcome to USYD Campus Tour!',
    subtitle: 'Your virtual building tour platform',
    body: 'This platform lets you create and manage immersive, interactive virtual tours of buildings on campus. Visitors can explore floors, look around panoramic scenes, and navigate between spaces — all from their browser.',
    highlight: 'First-time setup guide',
    highlightColor: '#3b82f6',
  },
  {
    icon: '📸',
    title: 'Media',
    subtitle: 'Your image library',
    body: 'Everything starts with Media. Upload and organise all the images you need — panoramic photos, floorplan maps, and tour cover images.\n\n• Alt — a short accessibility description for each file\n• Tags — labels to help you search and categorise your uploads',
    highlight: 'Start here',
    highlightColor: '#10b981',
  },
  {
    icon: '🗺️',
    title: 'Tours',
    subtitle: 'Create virtual building routes',
    body: 'A Tour is the top-level experience visitors open. Give it a name, a cover image, and a welcome message. Then link the building\'s Floors to the tour.\n\n• Slug — the unique URL used to share the tour publicly\n• Default Floor — which floor visitors land on first',
    highlight: 'Step 2',
    highlightColor: '#8b5cf6',
  },
  {
    icon: '🏢',
    title: 'Floors',
    subtitle: 'Model individual levels of a building',
    body: 'Each Floor belongs to a Tour and represents one level of a building. Upload a floorplan image and set the first scene visitors will see on arrival.\n\n• Floorplan — the overhead map shown in the minimap\n• Map Points — clickable markers on the map that teleport visitors to scenes',
    highlight: 'Step 3',
    highlightColor: '#f59e0b',
  },
  {
    icon: '🔮',
    title: 'Scenes',
    subtitle: 'Panoramic 360° viewpoints',
    body: 'A Scene is a single panoramic viewpoint inside a floor. Upload a 360° equirectangular image and then use the Hotspot Editor to add interactive markers.\n\n• Portal hotspots — let visitors navigate to other scenes\n• Info hotspots — display extra text or details on hover',
    highlight: 'Step 4',
    highlightColor: '#ef4444',
  },
  {
    icon: '✅',
    title: "You're all set!",
    subtitle: 'Ready to build your first tour',
    body: 'Here\'s the workflow to get started:\n\n1. Upload images in Media\n2. Create a Tour\n3. Add Floors to the tour\n4. Create Scenes for each floor\n5. Place Hotspots to connect everything\n6. Publish and share your tour link!',
    highlight: 'Tip: hover over any field label for a quick description',
    highlightColor: '#06b6d4',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function OnboardingTour({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY)
      if (!done) setVisible(true)
    } catch {
      // localStorage unavailable — skip
    }
  }, [])

  const dismiss = useCallback((permanent: boolean) => {
    if (permanent) {
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {}
    }
    setVisible(false)
  }, [])

  const goTo = useCallback(
    (next: number) => {
      if (animating) return
      setAnimating(true)
      setTimeout(() => {
        setStep(next)
        setAnimating(false)
      }, 180)
    },
    [animating],
  )

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <>
      {children}

      {visible && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => dismiss(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 100000,
            }}
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Platform introduction"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100001,
              width: 'min(520px, calc(100vw - 32px))',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              color: '#e2e8f0',
              fontFamily: 'inherit',
              overflow: 'hidden',
            }}
          >
            {/* Progress bar */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  transition: 'width 0.35s ease',
                  borderRadius: '3px',
                }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                padding: '32px 36px 28px',
                opacity: animating ? 0 : 1,
                transform: animating ? 'translateY(8px)' : 'translateY(0)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: '48px', marginBottom: '14px', lineHeight: 1 }}>
                {current.icon}
              </div>

              {/* Highlight badge */}
              {current.highlight && (
                <span
                  style={{
                    display: 'inline-block',
                    marginBottom: '10px',
                    padding: '3px 10px',
                    background: current.highlightColor
                      ? `${current.highlightColor}25`
                      : 'rgba(255,255,255,0.08)',
                    color: current.highlightColor ?? '#94a3b8',
                    border: `1px solid ${current.highlightColor ?? 'rgba(255,255,255,0.12)'}50`,
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                  }}
                >
                  {current.highlight}
                </span>
              )}

              {/* Title */}
              <h2
                style={{
                  margin: '0 0 6px',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  lineHeight: 1.3,
                }}
              >
                {current.title}
              </h2>

              {/* Subtitle */}
              {current.subtitle && (
                <p
                  style={{
                    margin: '0 0 16px',
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: 500,
                  }}
                >
                  {current.subtitle}
                </p>
              )}

              {/* Body */}
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#94a3b8',
                  whiteSpace: 'pre-line',
                  marginBottom: '28px',
                }}
              >
                {current.body}
              </div>

              {/* Step dots */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to step ${i + 1}`}
                    style={{
                      width: i === step ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '999px',
                      border: 'none',
                      background: i === step ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'width 0.25s ease, background 0.25s ease',
                    }}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {step > 0 && (
                  <button
                    onClick={() => goTo(step - 1)}
                    style={{
                      padding: '9px 18px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#94a3b8',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    ← Back
                  </button>
                )}

                <div style={{ flex: 1 }} />

                <button
                  onClick={() => dismiss(true)}
                  style={{
                    padding: '9px 18px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#475569',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Skip
                </button>

                {isLast ? (
                  <button
                    onClick={() => dismiss(true)}
                    style={{
                      padding: '9px 22px',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                    }}
                  >
                    Get started 🚀
                  </button>
                ) : (
                  <button
                    onClick={() => goTo(step + 1)}
                    style={{
                      padding: '9px 22px',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                    }}
                  >
                    Next →
                  </button>
                )}
              </div>

              {/* Re-open hint */}
              <p
                style={{
                  textAlign: 'center',
                  marginTop: '16px',
                  marginBottom: 0,
                  fontSize: '11px',
                  color: '#334155',
                }}
              >
                You can re-open this guide from the dashboard any time.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
