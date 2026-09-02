"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Truck, X } from "lucide-react";
import {
  listFleet,
  createFleet,
  updateFleet,
  deleteFleet,
  type AdminFleetVehicle,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FleetForm {
  name: string;
  maxWeightKg: string;
  maxLengthMeters: string;
  baseFare: string;
  perKmCharge: string;
  isActive: boolean;
}

const EMPTY_FORM: FleetForm = {
  name: "",
  maxWeightKg: "1000",
  maxLengthMeters: "3",
  baseFare: "0",
  perKmCharge: "0",
  isActive: true,
};

function toForm(v: AdminFleetVehicle): FleetForm {
  return {
    name: v.name,
    maxWeightKg: v.maxWeightKg,
    maxLengthMeters: v.maxLengthMeters,
    baseFare: v.baseFare,
    perKmCharge: v.perKmCharge,
    isActive: v.isActive,
  };
}

export default function FleetPage() {
  const [fleet, setFleet] = useState<AdminFleetVehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFleetVehicle | null>(null);
  const [form, setForm] = useState<FleetForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listFleet();
      setFleet(data.fleet);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(v: AdminFleetVehicle) {
    setEditing(v);
    setForm(toForm(v));
    setFormError(null);
    setModalOpen(true);
  }

  async function submit() {
    if (!form.name.trim()) {
      setFormError("Введите название машины");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        maxWeightKg: form.maxWeightKg || 1000,
        maxLengthMeters: form.maxLengthMeters || 3,
        baseFare: form.baseFare || 0,
        perKmCharge: form.perKmCharge || 0,
        isActive: form.isActive,
      };
      if (editing) {
        await updateFleet(editing.id, payload);
      } else {
        await createFleet(payload);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(v: AdminFleetVehicle) {
    if (!confirm(`Удалить машину «${v.name}»?`)) return;
    try {
      await deleteFleet(v.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function toggleActive(v: AdminFleetVehicle) {
    try {
      await updateFleet(v.id, { isActive: !v.isActive });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Truck className="h-6 w-6 text-primary" />
            Автопарк
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Машины для калькулятора доставки на сайте
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Добавить машину
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!fleet && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Загрузка автопарка…
        </div>
      )}

      {fleet && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Машина</th>
                <th className="px-4 py-3 text-right font-medium">Груз, кг</th>
                <th className="px-4 py-3 text-right font-medium">Длина, м</th>
                <th className="px-4 py-3 text-right font-medium">Подача, ₽</th>
                <th className="px-4 py-3 text-right font-medium">₽/км</th>
                <th className="px-4 py-3 text-center font-medium">Активна</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map((v) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-right">{v.maxWeightKg}</td>
                  <td className="px-4 py-3 text-right">{v.maxLengthMeters}</td>
                  <td className="px-4 py-3 text-right">{v.baseFare}</td>
                  <td className="px-4 py-3 text-right">{v.perKmCharge}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(v)}
                      className={
                        v.isActive
                          ? "text-green-700 hover:text-green-800"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      {v.isActive ? "Вкл" : "Выкл"}
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} title="Редактировать">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(v)} title="Удалить">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {fleet.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Автопарк пуст. Добавьте машины для калькулятора.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Редактировать машину" : "Новая машина"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Название *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Газель (борт)"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Грузоподъёмность, кг</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxWeightKg}
                  onChange={(e) => setForm({ ...form, maxWeightKg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Макс. длина, м</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={form.maxLengthMeters}
                  onChange={(e) => setForm({ ...form, maxLengthMeters: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Подача, ₽</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.baseFare}
                  onChange={(e) => setForm({ ...form, baseFare: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>За км, ₽</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.perKmCharge}
                  onChange={(e) => setForm({ ...form, perKmCharge: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                Машина активна (участвует в расчётах)
              </label>
            </div>
            {formError && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                {formError}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                Отмена
              </Button>
              <Button onClick={submit} disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                {editing ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
