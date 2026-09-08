'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Save, MapPin, Phone, Mail, MessageCircle, Truck, Image as ImageIcon, Clock, Globe } from 'lucide-react'
import { ImageUploader } from '@/components/admin/ImageUploader'

type Settings = {
  id: string
  warehouseAddress: string
  warehouseLat: number
  warehouseLng: number
  phone: string
  email: string
  workHours: string
  logoUrl: string | null
  siteName: string
  footerText: string
  whatsappUrl: string | null
  telegramUrl: string | null
  vkUrl: string | null
  messengerType: string
  messengerChatId: string | null
  messengerToken: string | null
  invoiceEmail: string | null
}

type Tariff = {
  id: string
  name: string
  basePrice: number
  perKmPrice: number
  maxDistanceKm: number | null
  isActive: boolean
}

type Banner = {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  linkUrl: string | null
  linkLabel: string | null
  position: string
  sortOrder: number
  isActive: boolean
}

const POSITIONS = [
  { value: "home_top", label: "Главная — сверху" },
  { value: "home_middle", label: "Главная — середина" },
  { value: "catalog_top", label: "Каталог — сверху" },
  { value: "sidebar", label: "Боковая панель" },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'branding' | 'contacts' | 'delivery' | 'banners' | 'messenger'>('branding')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const [s, t, b] = await Promise.all([
      fetch('/api/admin/settings').then(r => r.json()),
      fetch('/api/admin/delivery-tariffs').then(r => r.json()),
      fetch('/api/admin/banners').then(r => r.json()),
    ])
    setSettings(s.settings)
    setTariffs(s.tariffs || t.tariffs)
    setBanners(b.banners || [])
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // --- Тарифы ---
  const addTariff = async () => {
    const resp = await fetch('/api/admin/delivery-tariffs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Новый тариф', basePrice: 500, perKmPrice: 50, maxDistanceKm: null, isActive: true }),
    })
    const data = await resp.json()
    setTariffs([...tariffs, data.tariff])
  }
  const updateTariff = (id: string, field: string, value: any) => {
    setTariffs(tariffs.map(t => t.id === id ? { ...t, [field]: value } : t))
  }
  const saveTariff = async (id: string) => {
    const t = tariffs.find(t => t.id === id)
    if (!t) return
    await fetch(`/api/admin/delivery-tariffs?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
  }
  const deleteTariff = async (id: string) => {
    await fetch(`/api/admin/delivery-tariffs?id=${id}`, { method: 'DELETE' })
    setTariffs(tariffs.filter(t => t.id !== id))
  }

  // --- Баннеры ---
  const addBanner = async () => {
    const resp = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Новый баннер', position: 'home_top', sortOrder: 0, isActive: true }),
    })
    const data = await resp.json()
    setBanners([...banners, data.banner])
  }
  const updateBanner = (id: string, field: string, value: any) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b))
  }
  const saveBanner = async (id: string) => {
    const b = banners.find(b => b.id === id)
    if (!b) return
    await fetch(`/api/admin/banners?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  }
  const deleteBanner = async (id: string) => {
    await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
    setBanners(banners.filter(b => b.id !== id))
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-slate-400" /></div>
  }

  const TABS = [
    { id: 'branding' as const, label: 'Брендинг', icon: ImageIcon },
    { id: 'contacts' as const, label: 'Контакты', icon: Phone },
    { id: 'delivery' as const, label: 'Доставка', icon: Truck },
    { id: 'banners' as const, label: 'Баннеры', icon: ImageIcon },
    { id: 'messenger' as const, label: 'Мессенджер', icon: MessageCircle },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Настройки магазина</h1>

      {/* Табы */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* === БРЕНДИНГ === */}
      {tab === 'branding' && settings && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <ImageIcon className="size-5 text-blue-600" /> Логотип и название
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ImageUploader
                value={settings.logoUrl}
                onChange={(url) => setSettings({ ...settings, logoUrl: url || null })}
                label="Логотип сайта"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Название сайта</label>
              <input type="text" value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Часы работы</label>
              <input type="text" value={settings.workHours}
                onChange={(e) => setSettings({ ...settings, workHours: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Текст в подвале</label>
              <textarea value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <SaveButton saving={saving} saved={saved} onClick={saveSettings} />
        </section>
      )}

      {/* === КОНТАКТЫ === */}
      {tab === 'contacts' && settings && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Phone className="size-5 text-blue-600" /> Контакты (шапка и подвал)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700"><Phone className="mr-1 inline size-4" /> Телефон</label>
              <input type="text" value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700"><Mail className="mr-1 inline size-4" /> Email</label>
              <input type="email" value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700"><Clock className="mr-1 inline size-4" /> Часы работы</label>
              <input type="text" value={settings.workHours}
                onChange={(e) => setSettings({ ...settings, workHours: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700"><Globe className="mr-1 inline size-4" /> WhatsApp ссылка</label>
              <input type="text" value={settings.whatsappUrl || ''}
                onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value || null })}
                placeholder="https://wa.me/79990000000"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telegram ссылка</label>
              <input type="text" value={settings.telegramUrl || ''}
                onChange={(e) => setSettings({ ...settings, telegramUrl: e.target.value || null })}
                placeholder="https://t.me/pesok_metall"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">ВКонтакте ссылка</label>
              <input type="text" value={settings.vkUrl || ''}
                onChange={(e) => setSettings({ ...settings, vkUrl: e.target.value || null })}
                placeholder="https://vk.com/pesok_metall"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><MapPin className="size-4" /> Адрес склада (для расчёта доставки)</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <input type="text" value={settings.warehouseAddress}
                  onChange={(e) => setSettings({ ...settings, warehouseAddress: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Широта</label>
                <input type="number" step="0.0001" value={settings.warehouseLat}
                  onChange={(e) => setSettings({ ...settings, warehouseLat: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Долгота</label>
                <input type="number" step="0.0001" value={settings.warehouseLng}
                  onChange={(e) => setSettings({ ...settings, warehouseLng: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <SaveButton saving={saving} saved={saved} onClick={saveSettings} />
        </section>
      )}

      {/* === ДОСТАВКА === */}
      {tab === 'delivery' && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Truck className="size-5 text-blue-600" /> Тарифы доставки
            </h2>
            <button onClick={addTariff} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200">
              <Plus className="size-4" /> Добавить
            </button>
          </div>
          <div className="space-y-3">
            {tariffs.map(t => (
              <div key={t.id} className="rounded-xl border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Название</label>
                    <input type="text" value={t.name} onChange={(e) => updateTariff(t.id, 'name', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Базовая цена (₽)</label>
                    <input type="number" value={t.basePrice} onChange={(e) => updateTariff(t.id, 'basePrice', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Цена за км (₽)</label>
                    <input type="number" value={t.perKmPrice} onChange={(e) => updateTariff(t.id, 'perKmPrice', parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Макс. дальность (км)</label>
                    <input type="number" value={t.maxDistanceKm || ''} onChange={(e) => updateTariff(t.id, 'maxDistanceKm', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="—" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={t.isActive} onChange={(e) => updateTariff(t.id, 'isActive', e.target.checked)} className="size-4 rounded" />
                    Активен
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => saveTariff(t.id)} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Сохранить</button>
                    <button onClick={() => deleteTariff(t.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
                      <Trash2 className="size-3.5" /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {tariffs.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Нет тарифов. Нажмите «Добавить».</p>}
          </div>
        </section>
      )}

      {/* === БАННЕРЫ === */}
      {tab === 'banners' && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ImageIcon className="size-5 text-blue-600" /> Баннеры
            </h2>
            <button onClick={addBanner} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200">
              <Plus className="size-4" /> Добавить
            </button>
          </div>
          <div className="space-y-3">
            {banners.map(b => (
              <div key={b.id} className="rounded-xl border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Заголовок</label>
                    <input type="text" value={b.title} onChange={(e) => updateBanner(b.id, 'title', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Подзаголовок</label>
                    <input type="text" value={b.subtitle || ''} onChange={(e) => updateBanner(b.id, 'subtitle', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Текст кнопки</label>
                    <input type="text" value={b.linkLabel || ''} onChange={(e) => updateBanner(b.id, 'linkLabel', e.target.value)}
                      placeholder="Купить сейчас" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Ссылка кнопки</label>
                    <input type="text" value={b.linkUrl || ''} onChange={(e) => updateBanner(b.id, 'linkUrl', e.target.value)}
                      placeholder="/shop/арматура" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Позиция</label>
                    <select value={b.position} onChange={(e) => updateBanner(b.id, 'position', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Порядок</label>
                    <input type="number" value={b.sortOrder} onChange={(e) => updateBanner(b.id, 'sortOrder', parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <ImageUploader value={b.imageUrl} onChange={(url) => updateBanner(b.id, 'imageUrl', url || null)} label="Изображение баннера" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={b.isActive} onChange={(e) => updateBanner(b.id, 'isActive', e.target.checked)} className="size-4 rounded" />
                    Активен
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => saveBanner(b.id)} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Сохранить</button>
                    <button onClick={() => deleteBanner(b.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
                      <Trash2 className="size-3.5" /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Нет баннеров. Нажмите «Добавить».</p>}
          </div>
        </section>
      )}

      {/* === МЕССЕНДЖЕР === */}
      {tab === 'messenger' && settings && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <MessageCircle className="size-5 text-blue-600" /> Отправка счетов (безналичный расчёт)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Тип мессенджера</label>
              <select value={settings.messengerType} onChange={(e) => setSettings({ ...settings, messengerType: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Chat ID получателя</label>
              <input type="text" value={settings.messengerChatId || ''} onChange={(e) => setSettings({ ...settings, messengerChatId: e.target.value })}
                placeholder="Например: 123456789"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Bot Token (Telegram)</label>
              <input type="text" value={settings.messengerToken || ''} onChange={(e) => setSettings({ ...settings, messengerToken: e.target.value })}
                placeholder="123456:ABC-DEF..."
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Email для счетов (если мессенджер не настроен)</label>
              <input type="email" value={settings.invoiceEmail || ''} onChange={(e) => setSettings({ ...settings, invoiceEmail: e.target.value })}
                placeholder="billing@pesok-metall.ru"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <SaveButton saving={saving} saved={saved} onClick={saveSettings} />
        </section>
      )}
    </div>
  )
}

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
      {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {saved ? 'Сохранено!' : 'Сохранить настройки'}
    </button>
  )
}
