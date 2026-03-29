'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  fetchAdminShippingZones,
  createAdminShippingZone,
  updateAdminShippingZone,
  deleteAdminShippingZone,
  fetchAdminShippingMethods,
  createAdminShippingMethod,
  updateAdminShippingMethod,
  deleteAdminShippingMethod,
} from '@/lib/api/admin.service';
import type { AdminShippingZone, AdminShippingMethod } from '@/types/admin';
import { useToast } from '@/components/common/Toast';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

type RegionForm = { country_code: string; state_code: string; postal_prefix: string };

const emptyRegion = (): RegionForm => ({ country_code: 'PK', state_code: '', postal_prefix: '' });

export default function AdminShippingPage() {
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [zones, setZones] = useState<AdminShippingZone[]>([]);
  const [methods, setMethods] = useState<AdminShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadZones = useCallback(async () => {
    const data = await fetchAdminShippingZones();
    setZones(data);
  }, []);

  const loadMethods = useCallback(async () => {
    const data = await fetchAdminShippingMethods();
    setMethods(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadZones(), loadMethods()]);
    } catch (e) {
      setError(extractErrorMessage(e as object).message);
    } finally {
      setLoading(false);
    }
  }, [loadZones, loadMethods]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // ——— Zones dialog ———
  const [zoneOpen, setZoneOpen] = useState(false);
  const [zoneSaving, setZoneSaving] = useState(false);
  const [editingZone, setEditingZone] = useState<AdminShippingZone | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [zonePriority, setZonePriority] = useState('0');
  const [zoneActive, setZoneActive] = useState(true);
  const [zoneRegions, setZoneRegions] = useState<RegionForm[]>([emptyRegion()]);

  const openNewZone = () => {
    setEditingZone(null);
    setZoneName('');
    setZonePriority('0');
    setZoneActive(true);
    setZoneRegions([emptyRegion()]);
    setZoneOpen(true);
  };

  const openEditZone = (z: AdminShippingZone) => {
    setEditingZone(z);
    setZoneName(z.name);
    setZonePriority(String(z.priority));
    setZoneActive(z.is_active);
    setZoneRegions(
      z.regions.length
        ? z.regions.map((r) => ({
            country_code: r.country_code,
            state_code: r.state_code ?? '',
            postal_prefix: r.postal_prefix ?? '',
          }))
        : [emptyRegion()]
    );
    setZoneOpen(true);
  };

  const saveZone = async () => {
    if (!zoneName.trim()) {
      toast.showError('Zone name is required.');
      return;
    }
    const regions = zoneRegions
      .filter((r) => r.country_code.trim() !== '')
      .map((r) => ({
        country_code: r.country_code.trim().toUpperCase(),
        state_code: r.state_code.trim() || null,
        postal_prefix: r.postal_prefix.trim() || null,
      }));
    if (regions.length === 0) {
      toast.showError('Add at least one region (country code).');
      return;
    }
    setZoneSaving(true);
    try {
      if (editingZone) {
        await updateAdminShippingZone(editingZone.id, {
          name: zoneName.trim(),
          priority: parseInt(zonePriority, 10) || 0,
          is_active: zoneActive,
          regions,
        });
        toast.showSuccess('Zone updated');
      } else {
        await createAdminShippingZone({
          name: zoneName.trim(),
          priority: parseInt(zonePriority, 10) || 0,
          is_active: zoneActive,
          regions,
        });
        toast.showSuccess('Zone created');
      }
      setZoneOpen(false);
      await loadZones();
      await loadMethods();
    } catch (e) {
      toast.showError(extractErrorMessage(e as object).message);
    } finally {
      setZoneSaving(false);
    }
  };

  const removeZone = async (z: AdminShippingZone) => {
    if (!window.confirm(`Delete zone “${z.name}”? Method rates for this zone will be removed.`)) return;
    try {
      await deleteAdminShippingZone(z.id);
      toast.showSuccess('Zone deleted');
      await loadAll();
    } catch (e) {
      toast.showError(extractErrorMessage(e as object).message);
    }
  };

  // ——— Methods dialog ———
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodSaving, setMethodSaving] = useState(false);
  const [editingMethod, setEditingMethod] = useState<AdminShippingMethod | null>(null);
  const [mCode, setMCode] = useState('');
  const [mLabel, setMLabel] = useState('');
  const [mCarrier, setMCarrier] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mSort, setMSort] = useState('0');
  const [mActive, setMActive] = useState(true);
  const [mFallback, setMFallback] = useState('');
  const [mDaysMin, setMDaysMin] = useState('');
  const [mDaysMax, setMDaysMax] = useState('');
  const [mRates, setMRates] = useState<Record<number, string>>({});

  const openNewMethod = () => {
    setEditingMethod(null);
    setMCode('');
    setMLabel('');
    setMCarrier('');
    setMDesc('');
    setMSort(String((methods[methods.length - 1]?.sort_order ?? -1) + 1));
    setMActive(true);
    setMFallback('');
    setMDaysMin('');
    setMDaysMax('');
    const rates: Record<number, string> = {};
    zones.forEach((z) => {
      rates[z.id] = '0';
    });
    setMRates(rates);
    setMethodOpen(true);
  };

  const openEditMethod = (m: AdminShippingMethod) => {
    setEditingMethod(m);
    setMCode(m.code);
    setMLabel(m.label);
    setMCarrier(m.carrier ?? '');
    setMDesc(m.description ?? '');
    setMSort(String(m.sort_order));
    setMActive(m.is_active);
    setMFallback(m.fallback_rate != null ? String(m.fallback_rate) : '');
    setMDaysMin(m.estimated_days_min != null ? String(m.estimated_days_min) : '');
    setMDaysMax(m.estimated_days_max != null ? String(m.estimated_days_max) : '');
    const rates: Record<number, string> = {};
    zones.forEach((z) => {
      const row = m.rates.find((r) => r.shipping_zone_id === z.id);
      rates[z.id] = row ? String(row.rate) : '0';
    });
    setMRates(rates);
    setMethodOpen(true);
  };

  const saveMethod = async () => {
    if (!mCode.trim() || !mLabel.trim()) {
      toast.showError('Code and label are required.');
      return;
    }
    const ratesPayload = zones.map((z) => ({
      shipping_zone_id: z.id,
      rate: parseFloat(mRates[z.id] || '0') || 0,
    }));
    setMethodSaving(true);
    try {
      const payload = {
        code: mCode.trim().toLowerCase().replace(/\s+/g, '_'),
        label: mLabel.trim(),
        carrier: mCarrier.trim() || null,
        description: mDesc.trim() || null,
        is_active: mActive,
        sort_order: parseInt(mSort, 10) || 0,
        fallback_rate: mFallback.trim() === '' ? null : parseFloat(mFallback) || 0,
        estimated_days_min: mDaysMin.trim() === '' ? null : parseInt(mDaysMin, 10),
        estimated_days_max: mDaysMax.trim() === '' ? null : parseInt(mDaysMax, 10),
        rates: ratesPayload,
      };
      if (editingMethod) {
        await updateAdminShippingMethod(editingMethod.id, payload);
        toast.showSuccess('Delivery method updated');
      } else {
        await createAdminShippingMethod(payload);
        toast.showSuccess('Delivery method created');
      }
      setMethodOpen(false);
      await loadMethods();
    } catch (e) {
      toast.showError(extractErrorMessage(e as object).message);
    } finally {
      setMethodSaving(false);
    }
  };

  const removeMethod = async (m: AdminShippingMethod) => {
    if (!window.confirm(`Delete delivery method “${m.label}”?`)) return;
    try {
      await deleteAdminShippingMethod(m.id);
      toast.showSuccess('Method deleted');
      await loadMethods();
    } catch (e) {
      toast.showError(extractErrorMessage(e as object).message);
    }
  };

  const regionSummary = (z: AdminShippingZone) =>
    z.regions
      .map((r) => {
        const bits = [r.country_code];
        if (r.state_code) bits.push(r.state_code);
        if (r.postal_prefix) bits.push(`starts ${r.postal_prefix}`);
        return bits.join(' · ');
      })
      .join(' | ');

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Shipping &amp; delivery
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 900 }}>
        Define geographic <strong>zones</strong> (country, optional state and postal prefix), then set a price per zone
        for each <strong>delivery method</strong> (Standard, TCS, Leopard, etc.). Checkout uses the customer&apos;s
        shipping address to pick the best-matching zone (highest priority first), then applies the correct rate. Use{' '}
        <code>*</code> as country code for a catch-all zone (e.g. Rest of world) with lower priority.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Zones" id="shipping-tab-zones" />
          <Tab label="Delivery methods" id="shipping-tab-methods" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : tab === 0 ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openNewZone}>
                  Add zone
                </Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Regions</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell align="right" width={100} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {zones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No zones yet. Create Pakistan, United States, and a * catch-all to match most stores.
                      </TableCell>
                    </TableRow>
                  ) : (
                    zones.map((z) => (
                      <TableRow key={z.id} hover>
                        <TableCell>{z.name}</TableCell>
                        <TableCell>{z.priority}</TableCell>
                        <TableCell sx={{ maxWidth: 420 }}>
                          <Typography variant="body2" color="text.secondary" noWrap title={regionSummary(z)}>
                            {regionSummary(z)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={z.is_active ? 'Yes' : 'No'} color={z.is_active ? 'success' : 'default'} variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" aria-label="Edit zone" onClick={() => openEditZone(z)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" aria-label="Delete zone" onClick={() => void removeZone(z)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openNewMethod} disabled={zones.length === 0}>
                  Add delivery method
                </Button>
                {zones.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    Create at least one zone first.
                  </Typography>
                )}
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Carrier</TableCell>
                    <TableCell>Sort</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell align="right" width={100} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {methods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        No delivery methods. Add Standard, TCS, Leopard, etc.
                      </TableCell>
                    </TableRow>
                  ) : (
                    methods.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>{m.label}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {m.code}
                          </Typography>
                        </TableCell>
                        <TableCell>{m.carrier ?? '—'}</TableCell>
                        <TableCell>{m.sort_order}</TableCell>
                        <TableCell>
                          <Chip size="small" label={m.is_active ? 'Yes' : 'No'} color={m.is_active ? 'success' : 'default'} variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" aria-label="Edit method" onClick={() => openEditMethod(m)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" aria-label="Delete method" onClick={() => void removeMethod(m)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </Box>
      </Paper>

      <Dialog open={zoneOpen} onClose={() => !zoneSaving && setZoneOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingZone ? 'Edit zone' : 'New zone'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Zone name" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
          <TextField
            fullWidth
            margin="normal"
            label="Priority"
            type="number"
            helperText="Higher priority zones are checked first (e.g. Pakistan = 100, Rest of world * = 0)."
            value={zonePriority}
            onChange={(e) => setZonePriority(e.target.value)}
          />
          <FormControlLabel control={<Switch checked={zoneActive} onChange={(e) => setZoneActive(e.target.checked)} />} label="Active" sx={{ mt: 1 }} />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Regions (OR within this zone)
          </Typography>
          {zoneRegions.map((r, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, alignItems: 'flex-start' }}>
              <TextField
                size="small"
                label="Country"
                placeholder="PK, US, *"
                value={r.country_code}
                onChange={(e) => {
                  const next = [...zoneRegions];
                  next[i] = { ...next[i], country_code: e.target.value };
                  setZoneRegions(next);
                }}
                sx={{ width: 100 }}
              />
              <TextField
                size="small"
                label="State (opt.)"
                value={r.state_code}
                onChange={(e) => {
                  const next = [...zoneRegions];
                  next[i] = { ...next[i], state_code: e.target.value };
                  setZoneRegions(next);
                }}
                sx={{ width: 120 }}
              />
              <TextField
                size="small"
                label="Postal prefix"
                value={r.postal_prefix}
                onChange={(e) => {
                  const next = [...zoneRegions];
                  next[i] = { ...next[i], postal_prefix: e.target.value };
                  setZoneRegions(next);
                }}
                sx={{ width: 130 }}
              />
              <IconButton
                size="small"
                aria-label="Remove region"
                disabled={zoneRegions.length <= 1}
                onClick={() => setZoneRegions(zoneRegions.filter((_, j) => j !== i))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button size="small" onClick={() => setZoneRegions([...zoneRegions, emptyRegion()])}>
            Add region row
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoneOpen(false)} disabled={zoneSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void saveZone()} disabled={zoneSaving}>
            {zoneSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={methodOpen} onClose={() => !methodSaving && setMethodOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMethod ? 'Edit delivery method' : 'New delivery method'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Code (slug)"
            value={mCode}
            onChange={(e) => setMCode(e.target.value)}
            disabled={Boolean(editingMethod)}
            helperText="Unique id stored on orders. Cannot be changed after creation."
          />
          <TextField fullWidth margin="normal" label="Customer-facing label" value={mLabel} onChange={(e) => setMLabel(e.target.value)} />
          <TextField fullWidth margin="normal" label="Carrier key" value={mCarrier} onChange={(e) => setMCarrier(e.target.value)} helperText="Optional: tcs, leopard, store" />
          <TextField fullWidth margin="normal" label="Description" value={mDesc} onChange={(e) => setMDesc(e.target.value)} multiline rows={2} />
          <TextField fullWidth margin="normal" label="Sort order" type="number" value={mSort} onChange={(e) => setMSort(e.target.value)} />
          <TextField
            fullWidth
            margin="normal"
            label="Fallback rate"
            type="number"
            value={mFallback}
            onChange={(e) => setMFallback(e.target.value)}
            helperText="Used when the address does not match any zone, or before the customer enters a full address."
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Est. days (min)"
              type="number"
              value={mDaysMin}
              onChange={(e) => setMDaysMin(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Est. days (max)"
              type="number"
              value={mDaysMax}
              onChange={(e) => setMDaysMax(e.target.value)}
            />
          </Box>
          <FormControlLabel control={<Switch checked={mActive} onChange={(e) => setMActive(e.target.checked)} />} label="Active" sx={{ mt: 1 }} />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Rates by zone
          </Typography>
          {zones.map((z) => (
            <TextField
              key={z.id}
              fullWidth
              size="small"
              margin="dense"
              label={`${z.name} (#${z.id})`}
              type="number"
              value={mRates[z.id] ?? '0'}
              onChange={(e) => setMRates((prev) => ({ ...prev, [z.id]: e.target.value }))}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMethodOpen(false)} disabled={methodSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void saveMethod()} disabled={methodSaving}>
            {methodSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
