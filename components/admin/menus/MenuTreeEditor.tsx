'use client';

import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { AdminMenuItem } from '@/types/menus';

const ROOT = '__root__';

export function normalizeOrders(flat: AdminMenuItem[]): AdminMenuItem[] {
  const groups = new Map<string | null, AdminMenuItem[]>();
  for (const i of flat) {
    const k = i.parent_id;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push({ ...i });
  }
  const out: AdminMenuItem[] = [];
  for (const [, rows] of groups) {
    rows.sort((a, b) => a.sort_order - b.sort_order).forEach((row, idx) => {
      out.push({ ...row, sort_order: idx });
    });
  }
  return out;
}

function isInvalidParent(flat: AdminMenuItem[], itemId: string, proposedParentId: string | null): boolean {
  if (proposedParentId === null) return false;
  if (proposedParentId === itemId) return true;
  let cur: AdminMenuItem | undefined = flat.find((i) => i.id === proposedParentId);
  let guard = 0;
  while (cur && guard++ < 64) {
    const node = cur;
    if (node.id === itemId) return true;
    cur = node.parent_id ? flat.find((i) => i.id === node.parent_id) : undefined;
  }
  return false;
}

function subtreeIds(flat: AdminMenuItem[], rootId: string): Set<string> {
  const out = new Set<string>();
  const add = (id: string) => {
    out.add(id);
    flat.filter((i) => i.parent_id === id).forEach((c) => add(c.id));
  };
  add(rootId);
  return out;
}

function useGrouped(flat: AdminMenuItem[]) {
  return useMemo(() => {
    const map = new Map<string | null, AdminMenuItem[]>();
    flat.forEach((i) => {
      const k = i.parent_id;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(i);
    });
    map.forEach((arr) => arr.sort((a, b) => a.sort_order - b.sort_order));
    return map;
  }, [flat]);
}

function SortableRow({
  item,
  depth,
  flat,
  onItemUpdate,
  onDelete,
}: {
  item: AdminMenuItem;
  depth: number;
  flat: AdminMenuItem[];
  onItemUpdate: (
    id: string,
    patch: Partial<Pick<AdminMenuItem, 'title' | 'parent_id' | 'target' | 'url'>>
  ) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const parentOptions = useMemo(() => {
    const opts: { id: string | null; label: string }[] = [{ id: null, label: '(root)' }];
    const banned = subtreeIds(flat, item.id);
    flat.forEach((i) => {
      if (banned.has(i.id)) return;
      let d = 0;
      let p = flat.find((x) => x.id === i.parent_id);
      while (p) {
        d++;
        p = p.parent_id ? flat.find((x) => x.id === p!.parent_id) : undefined;
      }
      opts.push({ id: i.id, label: `${'—'.repeat(Math.min(d, 8))} ${i.title}` });
    });
    return opts;
  }, [flat, item.id]);

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      variant="outlined"
      data-item-id={item.id}
      sx={{ mb: 1, p: 1.5, pl: 1 + depth * 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
        <IconButton size="small" {...attributes} {...listeners} aria-label="Drag to reorder" sx={{ cursor: 'grab', mt: 0.5 }}>
          <DragIndicatorIcon />
        </IconButton>
        <TextField
          label="Title"
          size="small"
          defaultValue={item.title}
          key={item.id + item.title}
          onBlur={(e) => {
            void Promise.resolve(onItemUpdate(item.id, { title: e.target.value }));
          }}
          sx={{ minWidth: 160, flex: '1 1 160px' }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Parent</InputLabel>
          <Select
            label="Parent"
            value={item.parent_id ?? ROOT}
            onChange={(e) => {
              const v = e.target.value;
              const pid = v === ROOT ? null : (v as string);
              if (isInvalidParent(flat, item.id, pid)) return;
              void Promise.resolve(onItemUpdate(item.id, { parent_id: pid }));
            }}
          >
            {parentOptions.map((o) => (
              <MuiMenuItem key={o.id ?? 'root'} value={o.id ?? ROOT}>
                {o.label}
              </MuiMenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Target</InputLabel>
          <Select
            label="Target"
            value={item.target ?? '_self'}
            onChange={(e) => {
              void Promise.resolve(onItemUpdate(item.id, { target: e.target.value as '_self' | '_blank' }));
            }}
          >
            <MuiMenuItem value="_self">Same tab</MuiMenuItem>
            <MuiMenuItem value="_blank">New tab</MuiMenuItem>
          </Select>
        </FormControl>
        {(item.type === 'url' || item.type === 'custom') && (
          <TextField
            label="URL"
            size="small"
            defaultValue={item.url ?? ''}
            key={item.id + (item.url ?? '')}
            onBlur={(e) => {
              void Promise.resolve(onItemUpdate(item.id, { url: e.target.value || null }));
            }}
            sx={{ minWidth: 180, flex: '1 1 180px' }}
          />
        )}
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', flex: '1 1 120px' }}>
          {item.type}
          {item.reference_id ? ` · ${item.reference_id}` : ''}
          {item.url ? ` · ${item.url}` : ''}
        </Typography>
        <Tooltip title="Delete item & subtree">
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              void Promise.resolve(onDelete(item.id));
            }}
            aria-label="Delete"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}

function SiblingGroup({
  items,
  grouped,
  depth,
  flat,
  setFlat,
  onPersist,
  onDeleteItem,
  onItemUpdate,
}: {
  items: AdminMenuItem[];
  grouped: Map<string | null, AdminMenuItem[]>;
  depth: number;
  flat: AdminMenuItem[];
  setFlat: React.Dispatch<React.SetStateAction<AdminMenuItem[]>>;
  onPersist: (next: AdminMenuItem[]) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onItemUpdate: (
    id: string,
    patch: Partial<Pick<AdminMenuItem, 'title' | 'parent_id' | 'target' | 'url'>>
  ) => void | Promise<void>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const siblings = items;
    const oldIndex = siblings.findIndex((i) => i.id === active.id);
    const newIndex = siblings.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(siblings, oldIndex, newIndex).map((row, idx) => ({ ...row, sort_order: idx }));
    setFlat((prev) => {
      const map = new Map(reordered.map((r) => [r.id, r]));
      const next = prev.map((row) => map.get(row.id) ?? row);
      const norm = normalizeOrders(next);
      onPersist(norm);
      return norm;
    });
  };

  const handleDelete = async (id: string) => {
    await onDeleteItem(id);
  };

  if (items.length === 0) return null;

  return (
    <Box sx={{ ml: depth * 2, borderLeft: depth ? '2px solid' : 'none', borderColor: 'divider', pl: depth ? 2 : 0, mb: 1 }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <SortableRow
                item={item}
                depth={depth}
                flat={flat}
                onItemUpdate={onItemUpdate}
                onDelete={handleDelete}
              />
              <SiblingGroup
                items={grouped.get(item.id) ?? []}
                grouped={grouped}
                depth={depth + 1}
                flat={flat}
                setFlat={setFlat}
                onPersist={onPersist}
                onDeleteItem={onDeleteItem}
                onItemUpdate={onItemUpdate}
              />
            </React.Fragment>
          ))}
        </SortableContext>
      </DndContext>
    </Box>
  );
}

export default function MenuTreeEditor({
  flat,
  setFlat,
  onPersist,
  onDeleteItem,
  onItemUpdate,
}: {
  flat: AdminMenuItem[];
  setFlat: React.Dispatch<React.SetStateAction<AdminMenuItem[]>>;
  onPersist: (next: AdminMenuItem[]) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onItemUpdate: (
    id: string,
    patch: Partial<Pick<AdminMenuItem, 'title' | 'parent_id' | 'target' | 'url'>>
  ) => void | Promise<void>;
}) {
  const grouped = useGrouped(flat);
  const roots = grouped.get(null) ?? [];

  return (
    <SiblingGroup
      items={roots}
      grouped={grouped}
      depth={0}
      flat={flat}
      setFlat={setFlat}
      onPersist={onPersist}
      onDeleteItem={onDeleteItem}
      onItemUpdate={onItemUpdate}
    />
  );
}
