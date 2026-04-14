'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, X, Eye, Download, Trash2, Share } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
}

interface MediaLibraryProps {
  onSelect?: (media: MediaAsset) => void;
  multiSelect?: boolean;
  selectedMedia?: MediaAsset[];
  onSelectionChange?: (media: MediaAsset[]) => void;
}

export function MediaLibrary({
  onSelect,
  multiSelect = false,
  selectedMedia = [],
  onSelectionChange,
}: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<MediaAsset[]>(selectedMedia);
  const [showPublic, setShowPublic] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [search, page, showPublic]);

  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);

  const loadMedia = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      });

      const endpoint = showPublic
        ? `/media/public?${params}`
        : `/media?${params}`;
      const response = await apiRequest<{ data: any[] }>(endpoint);

      if (page === 1) {
        setMedia(response.data);
      } else {
        setMedia((prev) => [...prev, ...response.data]);
      }

      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('Failed to load media:', error);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiRequest<{ data: any }>('/media', {
          method: 'POST',
          body: formData,
        });

        setMedia((prev) => [response.data, ...prev]);
        toast.success(`Uploaded ${file.name}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (item: MediaAsset) => {
    if (multiSelect) {
      const isSelected = selected.some((s) => s.id === item.id);
      if (isSelected) {
        setSelected((prev) => prev.filter((s) => s.id !== item.id));
      } else {
        setSelected((prev) => [...prev, item]);
      }
    } else {
      onSelect?.(item);
    }
  };

  const handleDelete = async (item: MediaAsset) => {
    if (!confirm(`Delete ${item.originalName}?`)) return;

    try {
      await apiRequest(`/media/${item.id}`, { method: 'DELETE' });
      setMedia((prev) => prev.filter((m) => m.id !== item.id));
      toast.success('Media deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Media Library</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showPublic ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPublic(!showPublic)}
          >
            <Share className="w-4 h-4 mr-2" />
            {showPublic ? 'Public' : 'My Media'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          <input
            id="media-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="pl-10"
        />
      </div>

      {/* Selected media indicator */}
      {multiSelect && selected.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
          <span className="text-sm text-blue-700">
            {selected.length} selected
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Media Grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-2">
                <div className="aspect-square bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => {
            const isSelected = selected.some((s) => s.id === item.id);
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelect(item)}
              >
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded bg-gray-100">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.altText || item.originalName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p
                      className="text-xs font-medium truncate"
                      title={item.originalName}
                    >
                      {item.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.sizeBytes)}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Used {item.usageCount}x
                      </span>
                      {!showPublic && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setPage((prev) => prev + 1)}>
            Load More
          </Button>
        </div>
      )}

      {media.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          {showPublic ? 'No public media found' : 'No media uploaded yet'}
        </div>
      )}
    </div>
  );
}
