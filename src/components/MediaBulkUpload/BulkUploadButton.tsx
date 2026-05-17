'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type FileWithPath = {
  file: File
  relativePath?: string
}

type MediaKind = 'all' | 'image' | 'video'

type QueueItem = {
  localId: string
  file: File
  filename: string
  relativePath?: string
  folderName: string | null
  alt: string
  tags: string[]
  selected: boolean
}

type UploadResult = {
  localId: string
  filename: string
  file: File
  status: 'success' | 'error'
  message?: string
}

type FileSystemEntryLike = {
  isFile: boolean
  isDirectory: boolean
  fullPath: string
  name: string
}

type FileSystemFileEntryLike = FileSystemEntryLike & {
  file: (successCallback: (file: File) => void, errorCallback?: (err: DOMException) => void) => void
}

type FileSystemDirectoryReaderLike = {
  readEntries: (
    successCallback: (entries: FileSystemEntryLike[]) => void,
    errorCallback?: (err: DOMException) => void,
  ) => void
}

type FileSystemDirectoryEntryLike = FileSystemEntryLike & {
  createReader: () => FileSystemDirectoryReaderLike
}

type DataTransferItemWithWebkit = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemEntryLike | null
}

type DirectoryInput = HTMLInputElement & {
  directory?: boolean
  webkitdirectory?: boolean
}

type MediaPreEditModalProps = {
  batchTag: string
  failedResults: UploadResult[]
  isUploading: boolean
  onAddBatchTag: () => void
  onBatchTagChange: (value: string) => void
  onCancel: () => void
  onClearQueue: () => void
  onRemoveBatchTag: () => void
  onRemoveItem: (localId: string) => void
  onRetryFailed: () => void
  onSave: () => void
  onToggleAll: (checked: boolean) => void
  onToggleSelected: (localId: string, selected: boolean) => void
  onUpdateAlt: (localId: string, alt: string) => void
  onAddRowTag: (localId: string, tag: string) => void
  onRemoveRowTag: (localId: string, index: number) => void
  progress: { current: number; total: number } | null
  queue: QueueItem[]
}

const CONCURRENCY = 3
const BLUE = '#3b82f6'
const BORDER = '#4b5563'
const MEDIA_PRE_EDIT_ENABLED = true
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm'])
const IMAGE_EXTENSIONS = new Set([
  'avif',
  'bmp',
  'gif',
  'heic',
  'heif',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
])
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm'])

const stripExt = (name: string): string => name.replace(/\.[^/.]+$/, '')

const fileExtension = (name: string): string => {
  const match = /\.([^.]+)$/.exec(name)
  return match?.[1]?.toLowerCase() || ''
}

const isImageFile = (file: File): boolean =>
  file.type.startsWith('image/') || IMAGE_EXTENSIONS.has(fileExtension(file.name))

const isVideoFile = (file: File): boolean =>
  VIDEO_MIME_TYPES.has(file.type) || VIDEO_EXTENSIONS.has(fileExtension(file.name))

const isAllowedMediaFile = (file: File, kind: MediaKind = 'all'): boolean => {
  if (kind === 'image') return isImageFile(file)
  if (kind === 'video') return isVideoFile(file)
  return isImageFile(file) || isVideoFile(file)
}

const makeLocalId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const topFolderFromPath = (path?: string): string | null => {
  if (!path) return null
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '')
  const parts = normalized.split('/').filter(Boolean)
  return parts.length > 1 ? parts[0] : null
}

const getRelativePath = (file: File): string | undefined =>
  (file as File & { webkitRelativePath?: string }).webkitRelativePath || undefined

const enableDirectoryPicker = (input: HTMLInputElement | null): void => {
  if (!input) return

  const directoryInput = input as DirectoryInput
  directoryInput.webkitdirectory = true
  directoryInput.directory = true
  input.setAttribute('webkitdirectory', '')
  input.setAttribute('directory', '')
}

const queueKey = (item: QueueItem): string =>
  `${item.relativePath || item.filename}:${item.file.size}:${item.file.lastModified}`

const toQueueItems = (files: FileWithPath[], kind: MediaKind = 'all'): QueueItem[] =>
  files
    .filter(({ file }) => isAllowedMediaFile(file, kind))
    .map(({ file, relativePath }) => {
      const path = relativePath || getRelativePath(file)
      const folderName = topFolderFromPath(path)
      return {
        localId: makeLocalId(),
        file,
        filename: file.name,
        relativePath: path,
        folderName,
        alt: stripExt(file.name),
        tags: folderName ? [folderName] : [],
        selected: false,
      }
    })

const tagsForPayload = (tags: string[]): { tag: string }[] =>
  tags.map((tag) => tag.trim()).filter(Boolean).map((tag) => ({ tag }))

const readAllDirectoryEntries = async (
  reader: FileSystemDirectoryReaderLike,
): Promise<FileSystemEntryLike[]> => {
  const entries: FileSystemEntryLike[] = []

  while (true) {
    const chunk = await new Promise<FileSystemEntryLike[]>((resolve, reject) => {
      reader.readEntries(resolve, reject)
    })
    if (chunk.length === 0) break
    entries.push(...chunk)
  }

  return entries
}

const getFilesFromDroppedEntry = async (
  entry: FileSystemEntryLike,
  basePath = '',
): Promise<FileWithPath[]> => {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntryLike
    const file = await new Promise<File>((resolve, reject) => {
      fileEntry.file(resolve, reject)
    })
    const entryPath = entry.fullPath.replace(/^\/+/, '')
    return [{ file, relativePath: basePath ? `${basePath}${file.name}` : entryPath || file.name }]
  }

  if (entry.isDirectory) {
    const directoryEntry = entry as FileSystemDirectoryEntryLike
    const entries = await readAllDirectoryEntries(directoryEntry.createReader())
    const nextBasePath = `${basePath}${entry.name}/`
    const nested = await Promise.all(
      entries.map((childEntry) => getFilesFromDroppedEntry(childEntry, nextBasePath)),
    )
    return nested.flat()
  }

  return []
}

const getFilesFromDrop = async (dataTransfer: DataTransfer): Promise<FileWithPath[]> => {
  const items = Array.from(dataTransfer.items || []) as DataTransferItemWithWebkit[]
  const canReadEntries = items.some((item) => typeof item.webkitGetAsEntry === 'function')

  if (canReadEntries) {
    const filesFromEntries = await Promise.all(
      items
        .filter((item) => item.kind === 'file')
        .map(async (item) => {
          const entry = item.webkitGetAsEntry?.()
          if (!entry) return []
          try {
            return await getFilesFromDroppedEntry(entry)
          } catch {
            return []
          }
        }),
    )

    const files = filesFromEntries.flat()
    if (files.length > 0) return files
  }

  return Array.from(dataTransfer.files || []).map((file) => ({
    file,
    relativePath: getRelativePath(file),
  }))
}

const Thumbnail: React.FC<{ file: File; alt: string }> = ({ file, alt }) => {
  const [src, setSrc] = useState<string | null>(null)
  const isImage = isImageFile(file)

  useEffect(() => {
    if (!isImage) return
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  if (!isImage) {
    return (
      <div
        aria-label={alt}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '6px',
          background: '#111827',
          color: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        VIDEO
      </div>
    )
  }

  if (!src) return null

  return (
    <img
      alt={alt}
      src={src}
      style={{
        width: '56px',
        height: '56px',
        objectFit: 'cover',
        borderRadius: '6px',
        background: '#111827',
        flexShrink: 0,
      }}
    />
  )
}

const TagInput: React.FC<{
  disabled: boolean
  localId: string
  onAddTag: (localId: string, tag: string) => void
}> = ({ disabled, localId, onAddTag }) => {
  const [value, setValue] = useState('')

  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        const next = value.trim()
        if (!next) return
        onAddTag(localId, next)
        setValue('')
      }}
      disabled={disabled}
      placeholder="Add tag"
      style={{
        minWidth: '96px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '5px 7px',
        background: '#ffffff',
        color: '#374151',
        fontSize: '12px',
      }}
    />
  )
}

const MediaPreEditModal: React.FC<MediaPreEditModalProps> = ({
  batchTag,
  failedResults,
  isUploading,
  onAddBatchTag,
  onBatchTagChange,
  onCancel,
  onClearQueue,
  onRemoveBatchTag,
  onRemoveItem,
  onRetryFailed,
  onSave,
  onToggleAll,
  onToggleSelected,
  onUpdateAlt,
  onAddRowTag,
  onRemoveRowTag,
  progress,
  queue,
}) => {
  const selectedCount = queue.filter((item) => item.selected).length
  const allSelected = queue.length > 0 && selectedCount === queue.length
  const progressPercent =
    progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(0,0,0,0.58)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px',
      }}
    >
      <div
        style={{
          width: 'min(1180px, 96vw)',
          maxHeight: '90vh',
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', lineHeight: 1.2 }}>Edit media before upload</h2>
            <div style={{ marginTop: '4px', color: '#6b7280', fontSize: '13px' }}>
              {queue.length} media file(s), {selectedCount} selected
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClearQueue}
              disabled={isUploading}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: 'transparent',
                color: '#374151',
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: 'transparent',
                color: '#374151',
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isUploading || queue.length === 0}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                background: BLUE,
                color: '#fff',
                fontWeight: 700,
                cursor: isUploading || queue.length === 0 ? 'not-allowed' : 'pointer',
                opacity: isUploading || queue.length === 0 ? 0.65 : 1,
              }}
            >
              {isUploading ? `Saving ${progress?.current}/${progress?.total}` : 'Save to Media'}
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => onToggleAll(event.target.checked)}
              disabled={isUploading || queue.length === 0}
            />
            Select all
          </label>
          <input
            value={batchTag}
            onChange={(event) => onBatchTagChange(event.target.value)}
            disabled={isUploading || selectedCount === 0}
            placeholder="Batch tag"
            style={{
              width: '180px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '7px 9px',
              background: '#ffffff',
              color: '#374151',
            }}
          />
          <button
            type="button"
            onClick={onAddBatchTag}
            disabled={isUploading || selectedCount === 0}
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              border: 'none',
              background: '#10b981',
              color: '#fff',
              cursor: isUploading || selectedCount === 0 ? 'not-allowed' : 'pointer',
              opacity: isUploading || selectedCount === 0 ? 0.65 : 1,
            }}
          >
            Apply tag
          </button>
          <button
            type="button"
            onClick={onRemoveBatchTag}
            disabled={isUploading || selectedCount === 0}
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid #ef4444',
              background: 'transparent',
              color: '#fca5a5',
              cursor: isUploading || selectedCount === 0 ? 'not-allowed' : 'pointer',
              opacity: isUploading || selectedCount === 0 ? 0.65 : 1,
            }}
          >
            Remove tag
          </button>
        </div>

        {isUploading && progress && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: BLUE,
                  borderRadius: '999px',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        <div style={{ overflow: 'auto' }}>
          {queue.map((item) => (
            <div
              key={item.localId}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 64px minmax(180px, 1fr) minmax(180px, 260px) minmax(220px, 1.2fr) auto',
                gap: '12px',
                alignItems: 'center',
                padding: '10px 16px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(event) => onToggleSelected(item.localId, event.target.checked)}
                disabled={isUploading}
              />
              <Thumbnail file={item.file} alt={item.alt || item.filename} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.filename}
                </div>
                {item.relativePath && (
                  <div
                    style={{
                      marginTop: '3px',
                      color: '#9ca3af',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.relativePath}
                  </div>
                )}
              </div>
              <input
                value={item.alt}
                onChange={(event) => onUpdateAlt(item.localId, event.target.value)}
                disabled={isUploading}
                placeholder="ALT"
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '7px 9px',
                  background: '#ffffff',
                  color: '#374151',
                  minWidth: 0,
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {item.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 7px',
                      borderRadius: '999px',
                      background: '#dbeafe',
                      color: '#1e40af',
                      fontSize: '12px',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => onRemoveRowTag(item.localId, index)}
                      disabled={isUploading}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#1e40af',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        padding: 0,
                      }}
                    >
                      x
                    </button>
                  </span>
                ))}
                <TagInput disabled={isUploading} localId={item.localId} onAddTag={onAddRowTag} />
              </div>
              <button
                type="button"
                onClick={() => onRemoveItem(item.localId)}
                disabled={isUploading}
                style={{
                  padding: '6px 9px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: 'transparent',
                  color: '#374151',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {failedResults.length > 0 && !isUploading && (
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(239,68,68,0.35)',
              background: 'rgba(239,68,68,0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <strong style={{ color: '#fca5a5', fontSize: '13px' }}>
                {failedResults.length} file(s) failed
              </strong>
              <button
                type="button"
                onClick={onRetryFailed}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Retry failed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const BulkUploadButton: React.FC = () => {
  const router = useRouter()
  const folderInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [failedResults, setFailedResults] = useState<UploadResult[]>([])
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateLocalIds, setDuplicateLocalIds] = useState<Set<string>>(new Set())
  const [duplicateNames, setDuplicateNames] = useState<string[]>([])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [batchTag, setBatchTag] = useState('')

  useEffect(() => {
    enableDirectoryPicker(folderInputRef.current)
  }, [])

  const openFolderPicker = useCallback(() => {
    const input = folderInputRef.current
    enableDirectoryPicker(input)
    input?.click()
  }, [])

  const appendToQueue = useCallback((incomingFiles: FileWithPath[], kind: MediaKind = 'all') => {
    const incoming = toQueueItems(incomingFiles, kind)

    if (incoming.length === 0) {
      const fileType = kind === 'image' ? 'image files' : kind === 'video' ? 'MP4 or WebM videos' : 'image, MP4, or WebM files'
      alert(`No ${fileType} found.`)
      return
    }

    setFailedResults([])
    setQueue((prev) => {
      const keys = new Set(prev.map(queueKey))
      const uniqueIncoming = incoming.filter((item) => {
        const key = queueKey(item)
        if (keys.has(key)) return false
        keys.add(key)
        return true
      })
      return [...prev, ...uniqueIncoming]
    })

    if (MEDIA_PRE_EDIT_ENABLED) {
      setIsEditorOpen(true)
    }
  }, [])

  const checkDuplicateFilenames = useCallback(async (items: QueueItem[]): Promise<Set<string>> => {
    const duplicateIds = new Set<string>()
    const cache = new Map<string, boolean>()

    for (const item of items) {
      if (!cache.has(item.filename)) {
        try {
          const response = await fetch(
            `/api/media?where[filename][equals]=${encodeURIComponent(item.filename)}&limit=1&depth=0`,
            { credentials: 'include' },
          )
          if (!response.ok) {
            cache.set(item.filename, false)
          } else {
            const data = await response.json()
            cache.set(item.filename, Number(data?.totalDocs || 0) > 0)
          }
        } catch {
          cache.set(item.filename, false)
        }
      }

      if (cache.get(item.filename)) duplicateIds.add(item.localId)
    }

    return duplicateIds
  }, [])

  const uploadOne = useCallback(async (item: QueueItem): Promise<UploadResult> => {
    try {
      const formData = new FormData()
      const payload: { alt: string; tags?: { tag: string }[] } = {
        alt: item.alt.trim() || stripExt(item.filename),
      }
      const tags = tagsForPayload(item.tags)
      if (tags.length > 0) payload.tags = tags

      formData.append('file', item.file)
      formData.append('_payload', JSON.stringify(payload))

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        return {
          localId: item.localId,
          filename: item.filename,
          file: item.file,
          status: 'error',
          message: errorBody?.message || 'Upload failed',
        }
      }

      return { localId: item.localId, filename: item.filename, file: item.file, status: 'success' }
    } catch (error) {
      return {
        localId: item.localId,
        filename: item.filename,
        file: item.file,
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      }
    }
  }, [])

  const runUpload = useCallback(
    async (items: QueueItem[]) => {
      if (items.length === 0) {
        alert('No files to upload.')
        return
      }

      setIsUploading(true)
      setFailedResults([])
      setProgress({ current: 0, total: items.length })

      const results: UploadResult[] = []
      let completed = 0

      const uploadWithProgress = async (item: QueueItem) => {
        const result = await uploadOne(item)
        results.push(result)
        completed += 1
        setProgress({ current: completed, total: items.length })
      }

      for (let i = 0; i < items.length; i += CONCURRENCY) {
        const batch = items.slice(i, i + CONCURRENCY)
        await Promise.all(batch.map(uploadWithProgress))
      }

      const successfulIds = new Set(
        results.filter((result) => result.status === 'success').map((result) => result.localId),
      )
      const failed = results.filter((result) => result.status === 'error')

      setQueue((prev) => prev.filter((item) => !successfulIds.has(item.localId)))
      setFailedResults(failed)
      setIsUploading(false)
      setProgress(null)

      if (successfulIds.size > 0) router.refresh()
      if (failed.length === 0) setIsEditorOpen(false)
    },
    [router, uploadOne],
  )

  const handleUploadAll = useCallback(async () => {
    if (queue.length === 0) {
      alert('Please add media files to upload queue first.')
      return
    }

    const duplicateIds = await checkDuplicateFilenames(queue)
    if (duplicateIds.size > 0) {
      setDuplicateLocalIds(duplicateIds)
      setDuplicateNames(
        queue
          .filter((item) => duplicateIds.has(item.localId))
          .map((item) => item.relativePath || item.filename),
      )
      setShowDuplicateModal(true)
      return
    }

    await runUpload(queue)
  }, [checkDuplicateFilenames, queue, runUpload])

  const retryFailed = useCallback(async () => {
    if (failedResults.length === 0) return

    const failedIds = new Set(failedResults.map((result) => result.localId))
    const failedItems = queue.filter((item) => failedIds.has(item.localId))
    await runUpload(failedItems)
  }, [failedResults, queue, runUpload])

  const removeQueueItem = useCallback((localId: string) => {
    setQueue((prev) => prev.filter((item) => item.localId !== localId))
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setFailedResults([])
    setIsEditorOpen(false)
  }, [])

  const updateQueueItem = useCallback((localId: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item)))
  }, [])

  const addRowTag = useCallback((localId: string, tag: string) => {
    const next = tag.trim()
    if (!next) return
    setQueue((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, tags: [...item.tags, next] } : item,
      ),
    )
  }, [])

  const removeRowTag = useCallback((localId: string, index: number) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? { ...item, tags: item.tags.filter((_, tagIndex) => tagIndex !== index) }
          : item,
      ),
    )
  }, [])

  const addBatchTag = useCallback(() => {
    const next = batchTag.trim()
    if (!next) return
    setQueue((prev) =>
      prev.map((item) => (item.selected ? { ...item, tags: [...item.tags, next] } : item)),
    )
  }, [batchTag])

  const removeBatchTag = useCallback(() => {
    const target = batchTag.trim()
    if (!target) return
    setQueue((prev) =>
      prev.map((item) =>
        item.selected ? { ...item, tags: item.tags.filter((tag) => tag !== target) } : item,
      ),
    )
  }, [batchTag])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      const { dataTransfer } = event

      void (async () => {
        try {
          const files = await getFilesFromDrop(dataTransfer)
          appendToQueue(files, 'all')
        } catch {
          alert('Unable to read dropped files.')
        }
      })()
    },
    [appendToQueue],
  )

  const handleFolderInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []).map((file) => ({
        file,
        relativePath: getRelativePath(file),
      }))
      appendToQueue(files, 'all')
      event.target.value = ''
    },
    [appendToQueue],
  )

  const handleImageInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []).map((file) => ({ file }))
      appendToQueue(files, 'image')
      event.target.value = ''
    },
    [appendToQueue],
  )

  const handleVideoInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []).map((file) => ({ file }))
      appendToQueue(files, 'video')
      event.target.value = ''
    },
    [appendToQueue],
  )

  const progressPercent =
    progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          imageInputRef.current?.click()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            imageInputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? BLUE : BORDER}`,
          borderRadius: '8px',
          padding: '18px',
          background: isDragging ? 'rgba(59,130,246,0.08)' : 'transparent',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          marginBottom: '12px',
        }}
      >
        <input
          ref={folderInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onClick={(event) => event.stopPropagation()}
          onChange={handleFolderInputChange}
          disabled={isUploading}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onClick={(event) => event.stopPropagation()}
          onChange={handleImageInputChange}
          disabled={isUploading}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm"
          multiple
          style={{ display: 'none' }}
          onClick={(event) => event.stopPropagation()}
          onChange={handleVideoInputChange}
          disabled={isUploading}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              imageInputRef.current?.click()
            }}
            disabled={isUploading}
            style={{
              padding: '9px 14px',
              background: BLUE,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: isUploading ? 0.6 : 1,
            }}
          >
            Upload Images
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              videoInputRef.current?.click()
            }}
            disabled={isUploading}
            style={{
              padding: '9px 14px',
              background: BLUE,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: isUploading ? 0.6 : 1,
            }}
          >
            Upload Video
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              openFolderPicker()
            }}
            disabled={isUploading}
            style={{
              padding: '9px 14px',
              background: BLUE,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: isUploading ? 0.6 : 1,
            }}
          >
            Upload Folder
          </button>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>
            {isDragging
              ? 'Release to add media'
              : 'Drop a folder, images, MP4, or WebM files here. Folders are parsed into media files.'}
          </span>
        </div>
      </div>

      {!MEDIA_PRE_EDIT_ENABLED && queue.length > 0 && (
        <div
          style={{
            border: '1px solid #374151',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '10px 12px',
              background: '#111827',
              color: '#f9fafb',
            }}
          >
            <strong style={{ fontSize: '13px' }}>{queue.length} media file(s) ready</strong>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={clearQueue}
                disabled={isUploading}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: '#f9fafb',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => void handleUploadAll()}
                disabled={isUploading}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  background: BLUE,
                  color: '#fff',
                  fontWeight: 600,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.6 : 1,
                }}
              >
                {isUploading ? `Uploading ${progress?.current}/${progress?.total}` : 'Upload Queue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploading && progress && !isEditorOpen && (
        <div style={{ marginBottom: '10px' }}>
          <div
            style={{
              height: '6px',
              background: '#1f2937',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: BLUE,
                borderRadius: '999px',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>
            {progressPercent}% - {progress.current} / {progress.total} files
          </div>
        </div>
      )}

      {failedResults.length > 0 && !isUploading && !isEditorOpen && (
        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '13px' }}>
              {failedResults.length} file(s) failed
            </span>
            <button
              type="button"
              onClick={() => void retryFailed()}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Retry Failed
            </button>
          </div>
        </div>
      )}

      {showDuplicateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '560px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', color: '#111827' }}>Duplicate Files Detected</h3>
            <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px' }}>
              {duplicateLocalIds.size} queued file(s) already exist by filename.
            </p>
            <ul style={{ margin: '0 0 14px 0', paddingLeft: '18px' }}>
              {duplicateNames.map((name, index) => (
                <li
                  key={`${name}-${index}`}
                  style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}
                >
                  {name}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#f9fafb',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false)
                  void runUpload(queue)
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Upload All
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false)
                  const nonDuplicates = queue.filter((item) => !duplicateLocalIds.has(item.localId))
                  if (nonDuplicates.length === 0) {
                    alert('No files left after skipping duplicates.')
                    return
                  }
                  void runUpload(nonDuplicates)
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: BLUE,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Skip Duplicates
              </button>
            </div>
          </div>
        </div>
      )}

      {MEDIA_PRE_EDIT_ENABLED && isEditorOpen && queue.length > 0 && (
        <MediaPreEditModal
          batchTag={batchTag}
          failedResults={failedResults}
          isUploading={isUploading}
          onAddBatchTag={addBatchTag}
          onBatchTagChange={setBatchTag}
          onCancel={() => setIsEditorOpen(false)}
          onClearQueue={clearQueue}
          onRemoveBatchTag={removeBatchTag}
          onRemoveItem={removeQueueItem}
          onRetryFailed={retryFailed}
          onSave={() => void handleUploadAll()}
          onToggleAll={(checked) =>
            setQueue((prev) => prev.map((item) => ({ ...item, selected: checked })))
          }
          onToggleSelected={(localId, selected) => updateQueueItem(localId, { selected })}
          onUpdateAlt={(localId, alt) => updateQueueItem(localId, { alt })}
          onAddRowTag={addRowTag}
          onRemoveRowTag={removeRowTag}
          progress={progress}
          queue={queue}
        />
      )}
    </div>
  )
}
