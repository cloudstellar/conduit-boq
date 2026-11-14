'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  affiliationDenialCopy, affiliationJournalKey, affiliationReasonLimit, assertAffiliationAdmin,
  clearAffiliationIntent, confirmAffiliation, fingerprintAffiliationIntent, lookupAffiliationOutcome,
  normalizeAffiliationReason, readAffiliationHistory, readAffiliationJournal, registerAffiliationIntent, reviewAffiliation,
  type AffiliationHistoryEntry, type AffiliationOutcome, type AffiliationPending, type AffiliationReviewResult,
} from '@/lib/admin/users/affiliation-confirmation'
import type { AdminUserPresentation } from '@/lib/admin/users/presentation'

export type AffiliationConfirmationProps = {
  client: SupabaseClient
  actorId: string
  canReview: boolean
  canMutate: boolean
  canReadHistory: boolean
  canSubmit: () => boolean
  refresh: () => Promise<boolean>
}

type View =
  | { kind: 'starting' | 'loading' | 'unavailable' | 'load-error' | 'storage-error' }
  | { kind: 'eligible'; review: Extract<AffiliationReviewResult, { kind: 'eligible' }> }
  | { kind: 'ineligible'; review: Extract<AffiliationReviewResult, { kind: 'ineligible' }> }
  | { kind: 'pending'; pending: AffiliationPending; message?: string }
  | { kind: 'applied'; refreshing?: boolean; stale?: boolean; pending: AffiliationPending }
  | { kind: 'denied'; outcome: Extract<AffiliationOutcome, { kind: 'denied' }> }

type History = { kind: 'closed' | 'loading' | 'error' } | { kind: 'ready'; entries: AffiliationHistoryEntry[] }
const historyDate = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' })

export function AdminAffiliationConfirmation({ client, actorId, user, canReview, canMutate, canReadHistory, canSubmit, refresh, children }: AffiliationConfirmationProps & {
  user: AdminUserPresentation
  children: ReactNode
}) {
  const targetId = user.id
  const key = affiliationJournalKey(actorId, targetId)
  const [view, setView] = useState<View>({ kind: 'starting' })
  const [mode, setMode] = useState<'details' | 'review'>('details')
  const [reasonDraft, setReasonDraft] = useState('')
  const [busy, setBusy] = useState<'send' | 'lookup' | null>(null)
  const [history, setHistory] = useState<History>({ kind: 'closed' })
  const active = useRef(false)
  const operation = useRef<symbol | null>(null)
  const openButton = useRef<HTMLButtonElement>(null)
  const reviewHeading = useRef<HTMLHeadingElement>(null)
  const statusMessage = useRef<HTMLParagraphElement>(null)
  const needsFocus = useRef(false)
  const settledView = useRef<View | null>(null)
  const reviewingEnabled = useRef(canReview)

  useEffect(() => {
    reviewingEnabled.current = canReview
  }, [canReview])

  const load = useCallback(async () => {
    const ticket = Symbol()
    operation.current = ticket
    const isCurrent = () => active.current && operation.current === ticket
    try {
      if (settledView.current) { setView(settledView.current); return }
      const journal = readAffiliationJournal(key)
      if (journal.kind === 'pending') {
        setView({ kind: 'pending', pending: journal.pending })
        return
      }
      if (!reviewingEnabled.current) { setView({ kind: 'starting' }); return }
      if (journal.kind === 'unavailable') { setView({ kind: 'storage-error' }); return }
      setView({ kind: 'loading' })
      const review = await reviewAffiliation(client, actorId, targetId)
      if (!isCurrent()) return
      const current = readAffiliationJournal(key)
      if (current.kind !== 'clear') {
        setView(current.kind === 'pending' ? { kind: 'pending', pending: current.pending } : { kind: 'storage-error' })
        return
      }
      if (review.kind === 'unavailable') setView({ kind: 'unavailable' })
      else if (review.kind === 'eligible') setView({ kind: 'eligible', review })
      else setView({ kind: 'ineligible', review })
    } catch {
      if (isCurrent()) setView({ kind: 'load-error' })
    } finally {
      if (isCurrent()) operation.current = null
    }
  }, [actorId, client, key, targetId])

  useEffect(() => {
    if (!canReview) return
    const setup = window.setTimeout(() => { if (operation.current === null) void load() }, 0)
    return () => window.clearTimeout(setup)
  }, [canReview, load])

  useEffect(() => {
    active.current = true
    // Defer to keep strict-mode cleanup and immediate actor changes ahead of reads.
    const setup = window.setTimeout(() => { void load() }, 0)
    const receiveStorage = (event: StorageEvent) => {
      if ((event.key === key || event.key === null) && operation.current === null) void load()
    }
    window.addEventListener('storage', receiveStorage)
    return () => {
      active.current = false
      operation.current = null
      window.clearTimeout(setup)
      window.removeEventListener('storage', receiveStorage)
    }
  }, [key, load])

  useEffect(() => {
    if (!needsFocus.current) return
    if (mode === 'review') reviewHeading.current?.focus()
    else if (view.kind === 'eligible') openButton.current?.focus()
    else statusMessage.current?.focus()
    needsFocus.current = false
  }, [mode, view.kind])

  const returnToDetails = () => {
    needsFocus.current = true
    setMode('details')
    setReasonDraft('')
  }

  async function finish(outcome: AffiliationOutcome, pending: AffiliationPending, owner: () => boolean) {
    if (outcome.kind === 'denied') {
      try { await clearAffiliationIntent(key, pending) } catch { /* The recorded outcome remains available by lookup. */ }
      if (!owner()) return
      returnToDetails()
      settledView.current = { kind: 'denied', outcome }
      setView(settledView.current)
      return
    }
    if (!owner()) return
    returnToDetails()
    settledView.current = { kind: 'applied', refreshing: true, pending }
    setView(settledView.current)
    let fresh = false
    try { fresh = await refresh() } catch { /* A bound applied result remains true. */ }
    if (fresh) {
      try { await clearAffiliationIntent(key, pending) } catch { /* Retain the exact recovery record on storage failure. */ }
    }
    if (active.current) {
      settledView.current = { kind: 'applied', stale: !fresh, pending }
      setView(settledView.current)
    }
  }

  async function submit() {
    const reason = normalizeAffiliationReason(reasonDraft)
    if (busy || operation.current !== null || !reason || view.kind !== 'eligible' || !canSubmit()) return
    const reviewed = view.review.reviewed
    const ticket = Symbol()
    const isCurrent = () => active.current && operation.current === ticket
    operation.current = ticket
    setBusy('send')
    let pending: AffiliationPending | undefined
    let registered = false
    let dispatched = false
    try {
      await assertAffiliationAdmin(client, actorId)
      if (!isCurrent() || !canSubmit()) return
      pending = { requestId: crypto.randomUUID(), intentHash: await fingerprintAffiliationIntent({ reviewed, reason }) }
      const journal = await registerAffiliationIntent(key, pending)
      if (journal.kind !== 'clear') {
        if (isCurrent()) {
          returnToDetails()
          setView(journal.kind === 'pending' ? { kind: 'pending', pending: journal.pending } : { kind: 'storage-error' })
        }
        return
      }
      registered = true
      if (!isCurrent() || !canSubmit()) return
      dispatched = true
      setReasonDraft('')
      const outcome = await confirmAffiliation(client, reviewed, reason, pending)
      // A closed or replaced sheet must not forget a request or write to its replacement.
      if (isCurrent()) await finish(outcome, pending, isCurrent)
    } catch {
      if (!isCurrent()) return
      returnToDetails()
      if (pending && dispatched) setView({ kind: 'pending', pending })
      else setView({ kind: registered ? 'storage-error' : 'load-error' })
    } finally {
      if (pending && registered && !dispatched) {
        try { await clearAffiliationIntent(key, pending) } catch { /* The same registered intent remains visible. */ }
      }
      if (isCurrent()) {
        operation.current = null
        setBusy(null)
      }
    }
  }

  async function lookup() {
    if (view.kind !== 'pending' || busy || operation.current !== null) return
    const pending = view.pending
    const ticket = Symbol()
    const isCurrent = () => active.current && operation.current === ticket
    operation.current = ticket
    setBusy('lookup')
    try {
      const outcome = await lookupAffiliationOutcome(client, actorId, targetId, pending)
      if (!isCurrent()) return
      if (outcome) await finish(outcome, pending, isCurrent)
      else setView({ kind: 'pending', pending, message: 'ยังไม่พบผลที่บันทึกไว้ คำสั่งเดิมอาจยังดำเนินการอยู่' })
    } catch {
      if (isCurrent()) setView({ kind: 'pending', pending, message: 'โหลดผลคำสั่งไม่สำเร็จ กรุณาตรวจผลอีกครั้ง' })
    } finally {
      if (isCurrent()) {
        operation.current = null
        setBusy(null)
      }
    }
  }

  async function refreshApplied() {
    if (view.kind !== 'applied' || view.refreshing) return
    const pending = view.pending
    settledView.current = { kind: 'applied', refreshing: true, pending }
    setView(settledView.current)
    let fresh = false
    try { fresh = await refresh() } catch { /* Keep the known applied outcome visible. */ }
    if (fresh) {
      try { await clearAffiliationIntent(key, pending) } catch { /* Retain the exact recovery record on storage failure. */ }
    }
    if (active.current) {
      settledView.current = { kind: 'applied', stale: !fresh, pending }
      setView(settledView.current)
    }
  }

  async function loadHistory() {
    if (!canReadHistory || history.kind === 'loading') return
    setHistory({ kind: 'loading' })
    try {
      await assertAffiliationAdmin(client, actorId)
      if (!active.current) return
      const entries = await readAffiliationHistory(client, targetId)
      if (active.current) setHistory({ kind: 'ready', entries })
    } catch {
      if (active.current) setHistory({ kind: 'error' })
    }
  }

  const normalizedReason = normalizeAffiliationReason(reasonDraft)
  const reasonIssue = reasonDraft && !normalizedReason && 'กรอกเหตุผลที่มีข้อความและยาวไม่เกิน 1,000 ตัวอักษร'
  if (mode === 'review' && view.kind === 'eligible') {
    const hierarchy = view.review.reviewed.hierarchy
    return <section className="flex min-w-0 flex-col gap-4" aria-labelledby="admin-affiliation-review-title" data-admin-affiliation-review="true">
      <h3 id="admin-affiliation-review-title" tabIndex={-1} ref={reviewHeading} className="text-sm font-semibold outline-none">ทบทวนการยืนยันสังกัด</h3>
      <div className="min-w-0 rounded-md border bg-card p-4 text-sm">
        <p className="break-words font-medium">{user.displayName}</p>
        <p className="mt-1 break-all text-muted-foreground">{user.email}</p>
        <dl className="mt-3 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">บัญชี</dt><dd>{user.statusLabel} · {user.roleLabel}</dd>
          <dt className="text-muted-foreground">สังกัดจริง</dt><dd>ยังไม่ได้กำหนด</dd>
          <dt className="text-muted-foreground">สังกัดที่ยื่นขอ</dt><dd className="space-y-1 break-words">{[hierarchy.org, hierarchy.department, hierarchy.sector].map(entry => <p key={entry.id}>{entry.name}</p>)}</dd>
        </dl>
      </div>
      <form className="flex min-w-0 flex-col gap-3" onSubmit={event => { event.preventDefault(); void submit() }}>
        <Alert role="note"><AlertDescription><p id="admin-affiliation-scope">บัญชีนี้อาจเห็น BOQ ที่แชร์ในส่วนงานนี้เพิ่มขึ้น</p></AlertDescription></Alert>
        <div className="space-y-2">
          <Label htmlFor="admin-affiliation-reason">เหตุผลที่ยืนยัน</Label>
          <textarea id="admin-affiliation-reason" rows={3} required value={reasonDraft} disabled={busy !== null}
            aria-describedby={`admin-affiliation-scope admin-affiliation-limit${reasonIssue ? ' admin-affiliation-reason-error' : ''}`} aria-invalid={Boolean(reasonIssue)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring disabled:opacity-50"
            onChange={event => setReasonDraft(event.currentTarget.value)} />
          <p id="admin-affiliation-limit" className="text-xs text-muted-foreground">กรอกเหตุผลไม่เกิน {affiliationReasonLimit.toLocaleString('en-US')} ตัวอักษร</p>
          {reasonIssue ? <p id="admin-affiliation-reason-error" className="text-sm text-destructive">{reasonIssue}</p> : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="min-h-11" onClick={returnToDetails} disabled={busy !== null}>กลับไปดูรายละเอียด</Button>
          <Button type="submit" className="min-h-11" disabled={busy !== null || !normalizedReason || !canReview || !canMutate}>{busy === 'send' ? 'กำลังยืนยันสังกัด…' : 'ยืนยันสังกัด'}</Button>
        </div>
        <p role="status" aria-live="polite" className="sr-only">{busy === 'send' ? 'กำลังยืนยันสังกัด โปรดรอผล' : ''}</p>
      </form>
    </section>
  }

  const reload = () => {
    if (operation.current !== null) return
    settledView.current = null
    void load()
  }
  let feedback: ReactNode = null
  if (view.kind === 'eligible') feedback = <div><Button ref={openButton} type="button" variant="outline" className="min-h-11"
    disabled={!canReview || !canMutate} onClick={() => { needsFocus.current = true; setMode('review') }}>ยืนยันสังกัด</Button></div>
  if (view.kind === 'loading') feedback = <p role="status" className="text-sm text-muted-foreground">กำลังตรวจคำขอสังกัดล่าสุด…</p>
  if (view.kind === 'unavailable') feedback = <p role="status" className="text-sm text-muted-foreground">การยืนยันสังกัดยังไม่พร้อมใช้งาน</p>
  if (view.kind === 'ineligible' && view.review.code === 'REQUEST_INVALID') feedback =
    <p role="status" className="text-sm text-muted-foreground">{affiliationDenialCopy[view.review.code]}</p>
  if (view.kind === 'storage-error') feedback = <p role="status" className="text-sm text-muted-foreground">เบราว์เซอร์เก็บข้อมูลสำหรับตรวจผลคำสั่งไม่ได้ จึงยืนยันสังกัดไม่ได้</p>
  if (view.kind === 'load-error') feedback = <Alert role="status"><AlertDescription>
    <p ref={statusMessage} tabIndex={-1}>ตรวจข้อมูลสำหรับยืนยันสังกัดไม่สำเร็จ</p>
    <Button type="button" variant="outline" className="min-h-11" onClick={reload}>โหลดข้อมูลล่าสุด</Button>
  </AlertDescription></Alert>
  if (view.kind === 'pending') feedback = <Alert role="status" data-admin-affiliation-state="unknown"><AlertDescription>
    <p ref={statusMessage} tabIndex={-1} className="font-medium">ยังตรวจผลการยืนยันไม่ได้</p>
    <p>{view.message ?? 'ตรวจผลของคำสั่งเดิมได้จากรายการนี้'}</p>
    <Button type="button" variant="outline" className="min-h-11" disabled={busy !== null} onClick={() => { void lookup() }}>
      {busy === 'lookup' ? 'กำลังตรวจผล…' : 'ตรวจผลคำสั่ง'}
    </Button>
  </AlertDescription></Alert>
  if (view.kind === 'denied') feedback = <Alert role="status" data-admin-affiliation-state="denied"><AlertDescription>
    <p ref={statusMessage} tabIndex={-1} className="font-medium">ยืนยันสังกัดไม่สำเร็จ</p>
    <p>{affiliationDenialCopy[view.outcome.code]}</p>
    <Button type="button" variant="outline" className="min-h-11" onClick={reload}>โหลดข้อมูลล่าสุด</Button>
  </AlertDescription></Alert>
  if (view.kind === 'applied') feedback = <Alert role="status" data-admin-affiliation-state="applied"><AlertDescription>
    <p ref={statusMessage} tabIndex={-1} className="font-medium">{view.stale ? 'ยืนยันสังกัดแล้ว แต่ยังโหลดข้อมูลล่าสุดไม่ได้' : 'ยืนยันสังกัดแล้ว'}</p>
    {view.refreshing ? <p>กำลังโหลดข้อมูลล่าสุด…</p> : null}
    {view.stale ? <Button type="button" variant="outline" className="min-h-11" onClick={() => { void refreshApplied() }}>โหลดข้อมูลล่าสุด</Button> : null}
  </AlertDescription></Alert>
  return <div className="flex min-w-0 flex-col gap-5">
    {feedback}{children}
    {canReadHistory ? <section className="flex min-w-0 flex-col gap-3" aria-labelledby="admin-affiliation-history-heading">
      <h3 id="admin-affiliation-history-heading" className="text-sm font-semibold">ประวัติการยืนยันสังกัด</h3>
      {history.kind === 'loading' ? <p role="status" className="text-sm text-muted-foreground">กำลังโหลดประวัติ…</p> : null}
      {history.kind === 'error' ? <p role="status" className="text-sm text-destructive">โหลดประวัติการยืนยันสังกัดไม่สำเร็จ</p> : null}
      {history.kind === 'closed' || history.kind === 'error' ? <div>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => { void loadHistory() }}>
          {history.kind === 'error' ? 'ลองโหลดประวัติอีกครั้ง' : 'ดูประวัติการยืนยันสังกัด'}
        </Button>
      </div> : null}
      {history.kind === 'ready' && !history.entries.length ? <p role="status" className="text-sm text-muted-foreground">ไม่พบการยืนยันสังกัดในประวัติที่อ่านได้</p> : null}
      {history.kind === 'ready' && history.entries.length ? <ul className="divide-y rounded-md border bg-card text-sm">
        {history.entries.map(entry => <li key={entry.id} className="min-w-0 p-3">
          <time className="text-xs text-muted-foreground" dateTime={entry.recordedAt}>{historyDate.format(new Date(entry.recordedAt))}</time>
          <p className="mt-1 whitespace-pre-wrap break-words">{entry.reason}</p>
        </li>)}
      </ul> : null}
    </section> : null}
  </div>
}
