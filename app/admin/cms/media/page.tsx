'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import type { CmsMediaItem } from '@/types/cms';
import { fetchCmsMedia, uploadCmsMedia, deleteCmsMedia } from '@/lib/api/admin.service';

export default function AdminCmsMediaPage() {
  const toast = useToast();
  const [items, setItems] = useState<CmsMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folder, setFolder] = useState('');
  const [altText, setAltText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchCmsMedia({ per_page: 100 })
      .then((res) => {
        setItems(res.data);
        setError(null);
      })
      .catch(() => setError('Unable to load media.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.showError('Please choose a file.');
      return;
    }
    setUploading(true);
    try {
      await uploadCmsMedia({ file, folder: folder || undefined, alt_text: altText || undefined });
      toast.showSuccess('File uploaded.');
      setUploadOpen(false);
      setFile(null);
      setFolder('');
      setAltText('');
      loadData();
    } catch (e: any) {
      toast.showError(e?.response?.data?.message ?? 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      await deleteCmsMedia(deleteId);
      toast.showSuccess('Media deleted.');
      setDeleteId(null);
      loadData();
    } catch (e: any) {
      toast.showError(e?.response?.data?.message ?? 'Failed to delete media.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Media
        </Typography>
        <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setUploadOpen(true)}>
          Upload
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Preview</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell>Folder</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size (KB)</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No media yet. Upload a file to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {m.mime_type?.startsWith('image/') ? (
                        <Box
                          component="img"
                          src={m.url}
                          alt={m.alt_text ?? ''}
                          sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{m.filename}</TableCell>
                    <TableCell>{m.folder || '—'}</TableCell>
                    <TableCell>{m.mime_type || '—'}</TableCell>
                    <TableCell>{Math.round(m.size / 1024)}</TableCell>
                    <TableCell>{new Date(m.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(m.id)}
                        aria-label="Delete"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload media</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Button variant="outlined" component="label">
            Choose file
            <input
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
              }}
            />
          </Button>
          {file && (
            <Typography variant="body2" color="text.secondary">
              Selected: {file.name}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Optional grouping (e.g. hero, blog)"
          />
          <TextField
            fullWidth
            label="Alt text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Accessibility text for images"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId != null}
        title="Delete media"
        message="Are you sure you want to delete this media item? It must not be in use."
        confirmLabel="Delete"
        severity="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

