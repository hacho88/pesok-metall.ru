'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Navigation, Truck, Package, CreditCard, Banknote, Loader2, Check, Trash2, Minus, Plus, MessageCircle, Mail } from 'lucide-react'
import { useCart } from '@/components/pm-theme/cart-context'
import { Button } from '@/components/pm-theme/ui/Button'
import { cn } from '@/lib/pm-utils'

type PaymentMethod = 'cash' | 'bank_wire'
type DeliveryType = 'delivery' | 'pickup'

export function PmCart() {
  const { items, count, total, updateQty, removeItem, clear } = useCart()

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [deliveryCost, setDeliveryCost] = useState(0)
  const [freeFromSum, setFreeFromSum] = useState<number | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [inn, setInn] = useState('')
  const [comment, setComment] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  // Геолокация — определить местоположение
  const detectLocation = () => {
    setGeoLoading(true)
    setError(null)
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается браузером')
      setGeoLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
 async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })

        // Обратное геокодирование через Яндекс/OSM
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ru`
          )
          const data = await resp.json()
          const addr = data.display_name || `${latitude}, ${longitude}`
          setAddress(addr)
        } catch {
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        }
        setGeoLoading(false)
      },
      (err) => {
        setError('Не удалось определить местоположение: ' + err.message)
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Расчёт доставки при изменении координат или суммы
  useEffect(() => {
    if (deliveryType !== 'delivery' || !coords) {
      setDeliveryCost(0)
      setDistanceKm(null)
      return
    }
    setCalcLoading(true)
    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(
          `/api/delivery/calculate?lat=${coords.lat}&lng=${coords.lng}&sum=${total}`
        )
        const data = await resp.json()
        if (data.deliveryCost !== undefined) {
          setDeliveryCost(data.deliveryCost)
          setDistanceKm(data.distanceKm)
          setFreeFromSum(data.freeFromSum ?? null)
        }
      } catch (e) {
        console.error('Delivery calc error:', e)
      }
      setCalcLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [coords, deliveryType, total])

  const grandTotal = deliveryType === 'pickup' ? total : total + deliveryCost

  // Отправка заказа
  const submitOrder = async () => {
    setError(null)
    if (!customerName.trim() || !phone.trim()) {
      setError('Укажите имя и телефон')
      return
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      setError('Укажите адрес доставки или определите местоположение')
      return
    }
    if (paymentMethod === 'bank_wire' && (!company.trim() || !inn.trim())) {
      setError('Для безналичной оплаты укажите название компании и ИНН')
      return
    }

    setSubmitting(true)
    try {
      const resp = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          company,
          inn,
          paymentMethod,
          deliveryType,
          address: deliveryType === 'delivery' ? address : null,
          lat: coords?.lat,
          lng: coords?.lng,
          distanceKm,
          deliveryCost: deliveryType === 'delivery' ? deliveryCost : 0,
          comment,
          items: items.map((i) => ({
            id: i.id,
            title: i.title,
            price: i.price,
            unit: i.unit,
            qty: i.qty,
          })),
        }),
      })
      const data = await resp.json()
      if (data.error) {
        setError(data.error)
      } else {
        setOrderResult(data)
        clear()
      }
    } catch (e) {
      setError('Ошибка при отправке заказа')
    }
    setSubmitting(false)
  }

  // Экран успешного заказа
  if (orderResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl border border-border/70 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
            <Check className="size-8 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Заказ оформлен!</h1>
          <p className="mt-2 text-muted-foreground">
            Номер заказа: <span className="font-mono font-bold text-foreground">{orderResult.order.number}</span>
          </p>
          <p className="mt-1 text-lg font-semibold">
            Сумма: {orderResult.order.total.toLocaleString('ru-RU')} ₽
          </p>

          {orderResult.order.paymentMethod === 'bank_wire' && (
            <div className="mt-6 rounded-2xl bg-accent p-4 text-left">
              <p className="font-semibold text-accent-foreground">📋 Счёт на оплату</p>
              {orderResult.invoice?.success ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Счёт отправлен: {orderResult.invoice.method === 'telegram' ? 'в мессенджер' : `на email ${orderResult.invoice.email}`}
                </p>
              ) : (
                <p className="mt-1 text-sm text-orange-600">
                  Менеджер свяжется с вами для отправки счёта
                </p>
              )}
            </div>
          )}

          {orderResult.order.paymentMethod === 'cash' && (
            <p className="mt-4 text-sm text-muted-foreground">
              Оплата наличными при получении. Менеджер свяжется с вами для подтверждения.
            </p>
          )}

          <Link href="/">
            <Button className="mt-6">На главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Пустая корзина
  if (count === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl border border-border/70 bg-card p-12 text-center shadow-sm">
          <Package className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Корзина пуста</h1>
          <p className="mt-2 text-muted-foreground">Добавьте товары из каталога</p>
          <Link href="/shop/арматура">
            <Button className="mt-6">В каталог</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Корзина и оформление</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Левая колонка — товары + форма */}
        <div className="flex flex-col gap-6">
          {/* Товары */}
          <div className="rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
              <h2 className="font-bold text-slate-900">Товары ({count})</h2>
            </div>
            <ul className="divide-y divide-border/70">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-pretty">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('ru-RU')} ₽/{item.unit}
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-2xl bg-secondary p-1">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="flex size-8 items-center justify-center rounded-xl hover:bg-card"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="flex size-8 items-center justify-center rounded-xl hover:bg-card"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="w-24 text-right font-semibold text-slate-900">
                    {(item.price * item.qty).toLocaleString('ru-RU')} ₽
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Доставка */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Доставка</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('delivery')}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                  deliveryType === 'delivery'
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <Truck className="size-5 text-primary" />
                <div>
                  <p className="font-semibold">Доставка</p>
                  <p className="text-xs text-muted-foreground">По Москве и МО</p>
                </div>
              </button>
              <button
                onClick={() => setDeliveryType('pickup')}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                  deliveryType === 'pickup'
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <Package className="size-5 text-primary" />
                <div>
                  <p className="font-semibold">Самовывоз</p>
                  <p className="text-xs text-muted-foreground">Со склада</p>
                </div>
              </button>
            </div>

            {deliveryType === 'delivery' && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Введите адрес доставки"
                      className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <Button
                    onClick={detectLocation}
                    variant="outline"
                    disabled={geoLoading}
                    className="shrink-0"
                  >
                    {geoLoading ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
                    <span className="hidden sm:inline">Определить</span>
                  </Button>
                </div>

                {distanceKm !== null && (
                  <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                      Расстояние: <span className="font-semibold text-foreground">{distanceKm} км</span>
                    </span>
                    {calcLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : deliveryCost === 0 && freeFromSum ? (
                      <span className="font-semibold text-emerald-600">Бесплатно</span>
                    ) : (
                      <span className="font-semibold text-foreground">
                        {deliveryCost.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                )}
                {deliveryType === 'delivery' && freeFromSum && deliveryCost > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Бесплатная доставка при заказе от {freeFromSum.toLocaleString('ru-RU')} ₽
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
            )}
          </div>

          {/* Оплата */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Способ оплаты</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                  paymentMethod === 'cash'
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <Banknote className="size-5 text-primary" />
                <div>
                  <p className="font-semibold">Наличными</p>
                  <p className="text-xs text-muted-foreground">При получении</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('bank_wire')}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                  paymentMethod === 'bank_wire'
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <CreditCard className="size-5 text-primary" />
                <div>
                  <p className="font-semibold">Безналичный</p>
                  <p className="text-xs text-muted-foreground">Счёт на оплату</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'bank_wire' && (
              <div className="mt-4 rounded-2xl bg-accent p-3 text-sm text-accent-foreground">
                <p className="flex items-center gap-2">
                  <MessageCircle className="size-4" />
                  Счёт автоматически отправится в мессенджер или на email
                </p>
              </div>
            )}
          </div>

          {/* Контактные данные */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Контактные данные</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Имя *"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон *"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              {paymentMethod === 'bank_wire' && (
                <>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Название компании *"
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    placeholder="ИНН *"
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </>
              )}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий к заказу"
              rows={2}
              className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Правая колонка — итог */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Итого</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товары ({count})</span>
                <span className="font-semibold">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
                {deliveryType === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  {calcLoading ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : deliveryCost === 0 && freeFromSum ? (
                    <span className="font-semibold text-emerald-600">Бесплатно</span>
                  ) : (
                    <span className="font-semibold">{deliveryCost.toLocaleString('ru-RU')} ₽</span>
                  )}
                </div>
              )}
              {distanceKm !== null && deliveryType === 'delivery' && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Расстояние</span>
                  <span className="text-muted-foreground">{distanceKm} км</span>
                </div>
              )}
            </div>
            <div className="mt-4 border-t border-border/70 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Всего</span>
                <span className="text-2xl font-black text-primary">
                  {grandTotal.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <Button
              onClick={submitOrder}
              disabled={submitting}
              size="lg"
              className="mt-4 w-full"
            >
              {submitting ? (
                <><Loader2 className="size-4 animate-spin" /> Оформляем...</>
              ) : (
                <>Оформить заказ</>
              )}
            </Button>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="size-3.5" />
                Счёт отправляется автоматически
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="size-3.5" />
                Менеджер свяжется в течение 15 минут
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
