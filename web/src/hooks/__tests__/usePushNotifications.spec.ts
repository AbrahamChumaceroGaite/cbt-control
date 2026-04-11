import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePushNotifications } from '../usePushNotifications'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('@/services/push.service', () => ({
  pushService: {
    getVapidKey:  vi.fn(),
    subscribe:    vi.fn(),
    unsubscribe:  vi.fn(),
  },
}))

import { pushService } from '@/services/push.service'
const mockPush = vi.mocked(pushService)

const mockSub = {
  endpoint:    'https://push.example.com/sub1',
  unsubscribe: vi.fn().mockResolvedValue(true),
}

const mockPushManager = {
  getSubscription: vi.fn(),
  subscribe:       vi.fn(),
}

const mockSwRegistration = { pushManager: mockPushManager }

// These will be installed onto navigator.serviceWorker
const mockSw = {
  register:        vi.fn().mockResolvedValue(mockSwRegistration),
  ready:           Promise.resolve(mockSwRegistration),
  getRegistration: vi.fn(),
}

// ── Setup helpers ─────────────────────────────────────────────────────────────

/**
 * Install browser Push APIs onto the existing jsdom globals.
 * Uses vi.stubGlobal for standalone globals (safe — restored by vi.unstubAllGlobals).
 * Uses Object.defineProperty for navigator.serviceWorker so we don't replace navigator.
 */
function installPushApis() {
  // PushManager and Notification don't exist in jsdom — stub them
  vi.stubGlobal('PushManager', class PushManager {})
  vi.stubGlobal('Notification', {
    permission:        'default' as NotificationPermission,
    requestPermission: vi.fn(),
  })
  // Add serviceWorker to the existing navigator (not replace navigator)
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value:        mockSw,
    writable:     true,
    configurable: true,
  })
}

function removePushApis() {
  vi.stubGlobal('PushManager', undefined)
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value:        undefined,
    writable:     true,
    configurable: true,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  installPushApis()
  mockPushManager.getSubscription.mockResolvedValue(null)
  mockPushManager.subscribe.mockResolvedValue(mockSub)
  mockSw.register.mockResolvedValue(mockSwRegistration)
  mockSw.getRegistration.mockResolvedValue(mockSwRegistration)
  mockSw.ready = Promise.resolve(mockSwRegistration)
  mockPush.getVapidKey.mockResolvedValue({ publicKey: 'fake-vapid-key' })
  mockPush.subscribe.mockResolvedValue(undefined as never)
  mockPush.unsubscribe.mockResolvedValue(undefined as never)
})

afterEach(() => { vi.unstubAllGlobals() })

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('usePushNotifications', () => {
  describe('mount — unsupported browser', () => {
    it('sets state to unsupported when Push APIs are absent', async () => {
      // vi.unstubAllGlobals() removes PushManager (which was added via vi.stubGlobal in beforeEach)
      // Without PushManager, isSupported() returns false immediately
      vi.unstubAllGlobals()
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))
      expect(result.current.state).toBe('unsupported')
    })
  })

  describe('mount — permission denied', () => {
    it('sets state to denied when Notification.permission is denied', async () => {
      vi.stubGlobal('Notification', { permission: 'denied', requestPermission: vi.fn() })
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))
      expect(result.current.state).toBe('denied')
    })
  })

  describe('mount — already subscribed', () => {
    it('sets state to subscribed when an existing subscription is found', async () => {
      mockPushManager.getSubscription.mockResolvedValueOnce(mockSub)
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))
      expect(result.current.state).toBe('subscribed')
    })
  })

  describe('mount — no subscription, default permission', () => {
    it('sets state to unsubscribed when no existing subscription and permission is default', async () => {
      mockPushManager.getSubscription.mockResolvedValueOnce(null)
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))
      expect(result.current.state).toBe('unsubscribed')
    })
  })

  describe('requestAndSubscribe()', () => {
    it('subscribes and returns true when permission is granted', async () => {
      vi.stubGlobal('Notification', {
        permission: 'default' as NotificationPermission,
        requestPermission: vi.fn().mockResolvedValue('granted'),
      })
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))

      let success!: boolean
      await act(async () => { success = await result.current.requestAndSubscribe() })

      expect(success).toBe(true)
      expect(result.current.state).toBe('subscribed')
      expect(mockPush.subscribe).toHaveBeenCalled()
    })

    it('sets state to denied and returns false when user denies permission', async () => {
      vi.stubGlobal('Notification', {
        permission: 'default' as NotificationPermission,
        requestPermission: vi.fn().mockResolvedValue('denied'),
      })
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))

      let success!: boolean
      await act(async () => { success = await result.current.requestAndSubscribe() })

      expect(success).toBe(false)
      expect(result.current.state).toBe('denied')
    })

    it('returns false when browser is unsupported', async () => {
      removePushApis()
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))

      let success!: boolean
      await act(async () => { success = await result.current.requestAndSubscribe() })
      expect(success).toBe(false)
    })

    it('sets state to unsubscribed when subscribe throws', async () => {
      vi.stubGlobal('Notification', {
        permission: 'default' as NotificationPermission,
        requestPermission: vi.fn().mockResolvedValue('granted'),
      })
      mockPushManager.subscribe.mockRejectedValueOnce(new Error('Subscribe failed'))
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))

      await act(async () => { await result.current.requestAndSubscribe() })
      expect(result.current.state).toBe('unsubscribed')
    })
  })

  describe('unsubscribeForLogout()', () => {
    it('unsubscribes from both push service and browser when subscription exists', async () => {
      // First call: init useEffect calls getSubscription → null → state: unsubscribed
      // Second call: unsubscribeForLogout calls getSubscription → mockSub
      mockPushManager.getSubscription
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockSub)
      mockSw.getRegistration.mockResolvedValueOnce(mockSwRegistration)

      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))

      await act(() => result.current.unsubscribeForLogout())

      expect(mockPush.unsubscribe).toHaveBeenCalledWith(mockSub.endpoint)
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('does nothing when no SW registration is found', async () => {
      mockSw.getRegistration.mockResolvedValueOnce(undefined)
      const { result } = renderHook(() => usePushNotifications())
      await waitFor(() => expect(result.current.state).not.toBe('loading'))

      await act(() => result.current.unsubscribeForLogout())
      expect(mockPush.unsubscribe).not.toHaveBeenCalled()
    })
  })
})
