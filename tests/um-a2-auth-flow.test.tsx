import { Children, isValidElement, type FormEvent, type ReactElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../app/login/page'

const fakes = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  rpc: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  state: [] as unknown[],
  refs: [] as { current: unknown }[],
  stateIndex: 0,
  refIndex: 0,
}))

// Exercise the real page's callbacks and rendered states without a DOM package.
// Browser focus, navigation and session cookies are covered by local acceptance.
vi.mock('react', async (importOriginal) => ({
  ...await importOriginal<typeof import('react')>(),
  useState<T>(initial: T | (() => T)) {
    const index = fakes.stateIndex++
    if (!(index in fakes.state)) {
      fakes.state[index] = typeof initial === 'function' ? (initial as () => T)() : initial
    }
    return [fakes.state[index], (next: T | ((previous: T) => T)) => {
      fakes.state[index] = typeof next === 'function'
        ? (next as (previous: T) => T)(fakes.state[index] as T)
        : next
    }]
  },
  useRef<T>(initial: T) {
    const index = fakes.refIndex++
    return fakes.refs[index] ??= { current: initial }
  },
  useMemo<T>(create: () => T) { return create() },
  useEffect() {},
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: fakes.push, refresh: fakes.refresh }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: fakes.rpc,
    auth: {
      signInWithPassword: fakes.signInWithPassword,
      signUp: fakes.signUp,
      resetPasswordForEmail: fakes.resetPasswordForEmail,
    },
  }),
}))
vi.mock('@/lib/auth/email', () => import('../lib/auth/email'))
vi.mock('@/lib/auth/authorization', () => import('../lib/auth/authorization'))
vi.mock('@/lib/utils', () => import('../lib/utils'))
vi.mock('@/components/ui/alert', () => import('../components/ui/alert'))
vi.mock('@/components/ui/button', () => import('../components/ui/button'))
vi.mock('@/components/ui/card', () => import('../components/ui/card'))
vi.mock('@/components/ui/input', () => import('../components/ui/input'))
vi.mock('@/components/ui/label', () => import('../components/ui/label'))
vi.mock('@/components/ui/separator', () => import('../components/ui/separator'))

type Props = {
  children?: ReactNode
  id?: string
  type?: string
  value?: string
  autoComplete?: string
  inputMode?: string
  onClick?: () => void
  onChange?: (event: { target: { value: string } }) => void
  onBlur?: () => void
  onSubmit?: (event: Pick<FormEvent, 'preventDefault'>) => Promise<void>
}

const ORIGIN = 'http://127.0.0.1:3000'
const PASSWORD = 'synthetic-password'

function renderForm() {
  fakes.stateIndex = 0
  fakes.refIndex = 0
  const { type: Form } = LoginPage().props.children as ReactElement<Props, () => ReactElement<Props>>
  return Form()
}

function* elements(node: ReactNode): Generator<ReactElement<Props>> {
  for (const child of Children.toArray(node)) {
    if (isValidElement<Props>(child)) {
      yield child
      yield* elements(child.props.children)
    }
  }
}

function findElement(predicate: (element: ReactElement<Props>) => boolean) {
  return Array.from(elements(renderForm())).find(predicate)
}

function text(node: ReactNode): string {
  return Children.toArray(node).map(child => {
    if (isValidElement<Props>(child)) return text(child.props.children)
    return typeof child === 'string' || typeof child === 'number' ? String(child) : ''
  }).join('')
}

function hasCheckEmailHeading() {
  return Boolean(findElement(({ type, props }) =>
    (type === 'h1' || type === 'h2') && text(props.children) === 'ตรวจสอบอีเมล'))
}

function input(id: 'email' | 'password') {
  const element = findElement(({ props }) => props.id === id)
  if (!element) throw new Error(`Missing ${id} input`)
  return element.props
}

function change(id: 'email' | 'password', value: string) {
  const { onChange } = input(id)
  if (!onChange) throw new Error(`Missing ${id} change handler`)
  onChange({ target: { value } })
}

function click(label: string) {
  const action = findElement(({ props }) => props.onClick !== undefined && text(props.children) === label)
  if (!action?.props.onClick) throw new Error(`Missing action ${label}`)
  action.props.onClick()
}

function submit() {
  const form = findElement(({ type }) => type === 'form')
  if (!form?.props.onSubmit) throw new Error('Missing signup form submission handler')
  return form.props.onSubmit({ preventDefault() {} })
}

function startSignup(email: string) {
  click('สมัครสมาชิก')
  change('email', email)
  change('password', PASSWORD)
}

describe('UM-A2 signup outcomes', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('window', { location: { origin: ORIGIN } })
    fakes.state.length = 0
    fakes.refs.length = 0
    fakes.rpc.mockResolvedValue({ data: true, error: null })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('shows the submitted normalized address after a signup without a session', async () => {
    fakes.signUp.mockResolvedValue({
      data: { session: null, user: { email: 'provider-value@example.invalid' } },
      error: null,
    })
    startSignup(' synthetic-nt ')
    await submit()

    expect(fakes.rpc).toHaveBeenCalledExactlyOnceWith('is_signup_email_allowed', {
      p_email: 'synthetic-nt@ntplc.co.th',
    })
    expect(fakes.signUp).toHaveBeenCalledExactlyOnceWith({
      email: 'synthetic-nt@ntplc.co.th',
      password: PASSWORD,
      options: { emailRedirectTo: `${ORIGIN}/auth/callback` },
    })
    const screen = text(renderForm())
    expect(hasCheckEmailHeading()).toBe(true)
    expect(screen).toContain('synthetic-nt@ntplc.co.th')
    expect(screen).not.toContain('provider-value@example.invalid')
    expect(screen).not.toContain(PASSWORD)
    expect(fakes.push).not.toHaveBeenCalled()

    click('กลับไปกรอกอีเมลใหม่')

    expect(text(renderForm())).toContain('สมัครสมาชิก')
    expect(input('email').value).toBe('synthetic-nt@ntplc.co.th')
    expect(input('password').value).toBe('')
    expect(fakes.signUp).toHaveBeenCalledOnce()
  })

  it('lets a confirmation-pending user return to Login without another Auth request', async () => {
    fakes.signUp.mockResolvedValue({ data: { session: null }, error: null })
    startSignup('synthetic@example.invalid')
    await submit()
    click('กลับไปเข้าสู่ระบบ')

    expect(input('password')).toMatchObject({ autoComplete: 'current-password', value: '' })
    expect(fakes.signUp).toHaveBeenCalledOnce()
    expect(fakes.signInWithPassword).not.toHaveBeenCalled()
  })

  it('uses the submitted address even if the draft changes while signup is pending', async () => {
    const response = Promise.withResolvers<{ data: { session: null }; error: null }>()
    const authCalled = Promise.withResolvers<void>()
    fakes.signUp.mockImplementation(() => {
      authCalled.resolve()
      return response.promise
    })
    startSignup('submitted@example.invalid')
    const request = submit()
    await authCalled.promise
    change('email', 'later-draft@example.invalid')
    response.resolve({ data: { session: null }, error: null })
    await request

    const screen = text(renderForm())
    expect(screen).toContain('submitted@example.invalid')
    expect(screen).not.toContain('later-draft@example.invalid')
  })

  it('continues through the app entry route when signup returns a session', async () => {
    fakes.signUp.mockResolvedValue({ data: { session: { user: { id: 'synthetic-user' } } }, error: null })
    startSignup('synthetic@example.invalid')
    await submit()

    expect(fakes.push).toHaveBeenCalledExactlyOnceWith('/')
    expect(fakes.refresh).toHaveBeenCalledOnce()
    expect(hasCheckEmailHeading()).toBe(false)
  })

  it('does not submit again while signup is in flight', async () => {
    const request = Promise.withResolvers<{ data: { session: null }; error: null }>()
    fakes.signUp.mockReturnValue(request.promise)
    startSignup('synthetic@example.invalid')

    const first = submit()
    const second = submit()
    request.resolve({ data: { session: null }, error: null })
    await Promise.all([first, second])

    expect(fakes.rpc).toHaveBeenCalledOnce()
    expect(fakes.signUp).toHaveBeenCalledOnce()
  })

  it('does not interpret a denied email or failed Auth request as a signup success', async () => {
    fakes.rpc.mockResolvedValueOnce({ data: false, error: null })
    fakes.signUp.mockResolvedValue({ data: { session: null }, error: new Error('synthetic signup error') })
    startSignup('synthetic@example.invalid')

    await submit()
    expect(fakes.signUp).not.toHaveBeenCalled()
    expect(hasCheckEmailHeading()).toBe(false)

    await submit()
    expect(fakes.signUp).toHaveBeenCalledOnce()
    expect(hasCheckEmailHeading()).toBe(false)
    expect(text(renderForm())).not.toContain('synthetic signup error')
    expect(fakes.push).not.toHaveBeenCalled()
  })

  it('keeps the existing short-name field behavior on Login and full-email routing on Forgot', async () => {
    fakes.signInWithPassword.mockResolvedValue({ error: null })
    fakes.resetPasswordForEmail.mockResolvedValue({ error: null })
    expect(input('email')).toMatchObject({ type: 'text', autoComplete: 'username', inputMode: 'email' })
    change('email', 'synthetic-nt')
    input('email').onBlur?.()
    expect(input('email').value).toBe('synthetic-nt@ntplc.co.th')
    change('password', PASSWORD)
    await submit()
    expect(fakes.signInWithPassword).toHaveBeenCalledExactlyOnceWith({
      email: 'synthetic-nt@ntplc.co.th', password: PASSWORD,
    })

    click('ลืมรหัสผ่าน?')
    change('email', 'synthetic@example.invalid')
    await submit()
    expect(fakes.resetPasswordForEmail).toHaveBeenCalledExactlyOnceWith('synthetic@example.invalid', {
      redirectTo: `${ORIGIN}/auth/callback?next=/profile`,
    })
    expect(fakes.signUp).not.toHaveBeenCalled()
  })
})
