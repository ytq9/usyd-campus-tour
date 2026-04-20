'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type FileWithPath = {
  file: File
  relativePath?: string
}

type QueueItem = {
  localId: string
  file: File
  filename: string
  folderName: string | null
  alt: string
  tags: string[]
  duplicate?: boolean
}

type UploadResult = {
  localId: string
  filename: string
  status: 'success' | 'error'
  message?: string
  uploadedId?: string
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

type TagEditorProps = {
  tags: string[]
  existingTags: string[]
  placeholder?: string
  disabled?: boolean
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

const BLUE = '#3b82f6'
const BORDER = '#4b5563'
const LIGHT_BLUE = '#dbeafe'
const LIGHT_BLUE_BORDER = '#93c5fd'
const DARK_GRAY = '#374151'

const stripExt = (name: string): string => name.replace(/\.[^/.]+$/, '')

const topFolderFromPath = (path?: string): string | null => {
  if (!path) return null
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '')
  const parts = normalized.split('/').filter(Boolean)
  if (parts.length > 1) return parts[0]
  return null
}

const isImageFile = (file: File): boolean => file.type.startsWith('image/')

const makeLocalId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const normalizeTag = (tag: string): string => tag.trim()

const toSortedUniqueTags = (tags: string[]): string[] =>
  Array.from(new Set(tags.map(normalizeTag).filter(Boolean))).sort((a, b) => a.localeCompare(b))

const TagEditor: React.FC<TagEditorProps> = ({
  tags,
  existingTags,
  placeholder,
  disabled,
  onAddTag,
  onRemoveTag,
}) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const available = useMemo(() => {
    const set = new Set(tags)
    return existingTags
      .filter((tag) => !set.has(tag) && tag.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
  }, [existingTags, query, tags])

  const addFromInput = useCallback(() => {
    const value = normalizeTag(query)
    if (!value) return
    onAddTag(value)
    setQuery('')
    setOpen(false)
  }, [onAddTag, query])

  useEffect(() => {
    if (!open) return
    const onClickAway = (ev: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(ev.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [open])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div
        style={{
          minHeight: '36px',
          border: `1px solid ${LIGHT_BLUE_BORDER}`,
          borderRadius: '6px',
          background: LIGHT_BLUE,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 6px',
          flexWrap: 'wrap',
        }}
      >
        {/* ▼ 实心三角形按钮：宽度是高度的2倍，整体呈长方形 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={disabled}
          style={{
            border: 'none',
            borderRadius: '4px',
            background: '#93c5fd',
            color: DARK_GRAY,
            padding: '4px 10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '20px',
            flexShrink: 0,
          }}
        >
          {/* 用 border trick 画实心向下三角，宽度是高度的2倍 */}
          <span
            style={{
              display: 'inline-block',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid ${DARK_GRAY}`,
            }}
          />
        </button>

        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#bfdbfe',
              color: DARK_GRAY,
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '12px',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              disabled={disabled}
              style={{
                border: 'none',
                background: 'transparent',
                color: DARK_GRAY,
                cursor: disabled ? 'not-allowed' : 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              x
            </button>
          </span>
        ))}

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addFromInput()
            }
          }}
          placeholder={placeholder || 'Search or create tag'}
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: '80px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: DARK_GRAY,
            fontSize: '12px',
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            left: 0,
            right: 0,
            marginTop: '4px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: '#fff',
            maxHeight: '180px',
            overflowY: 'auto',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          }}
        >
          {available.length === 0 ? (
            <div style={{ padding: '8px', fontSize: '12px', color: '#6b7280' }}>
              Press Enter to create new tag
            </div>
          ) : (
            available.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onAddTag(tag)
                  setQuery('')
                  setOpen(false)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: '#fff',
                  padding: '8px 10px',
                  fontSize: '12px',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export const BulkUploadButton: React.FC = () => {
  const router = useRouter()

  const [isDragging, setIsDragging] = useState(false)
  const [globalTags, setGlobalTags] = useState<string[]>([])
  const [existingTags, setExistingTags] = useState<string[]>([])

  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [failedResults, setFailedResults] = useState<UploadResult[]>([])

  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateLocalIds, setDuplicateLocalIds] = useState<Set<string>>(new Set())
  const [duplicateNames, setDuplicateNames] = useState<string[]>([])

  const [uploadedIds, setUploadedIds] = useState<Set<string>>(new Set())

  const folderInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  // UPLOAD PREVIEW 独立滚动容器
  const previewScrollRef = useRef<HTMLDivElement>(null)

  const loadExistingTags = useCallback(async () => {
    try {
      const tagSet = new Set<string>()
      let page = 1
      let hasNextPage = true

      while (hasNextPage && page <= 5) {
        const res = await fetch(`/api/media?limit=100&page=${page}&depth=0`, {
          credentials: 'include',
        })
        if (!res.ok) break

        const data = await res.json()
        const docs = Array.isArray(data?.docs) ? data.docs : []

        for (const doc of docs) {
          const tags = Array.isArray(doc?.tags) ? doc.tags : []
          for (const t of tags) {
            const value = normalizeTag(String(t?.tag ?? ''))
            if (value) tagSet.add(value)
          }
        }

        hasNextPage = Boolean(data?.hasNextPage)
        page += 1
      }

      setExistingTags(Array.from(tagSet).sort((a, b) => a.localeCompare(b)))
    } catch {
      setExistingTags([])
    }
  }, [])

  useEffect(() => {
    loadExistingTags()
  }, [loadExistingTags])

  // 独立滚动：鼠标在 preview 区域内时阻止页面滚动
  useEffect(() => {
    const el = previewScrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const atTop = scrollTop === 0 && e.deltaY < 0
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0

      if (!atTop && !atBottom) {
        e.stopPropagation()
        e.preventDefault()
        el.scrollTop += e.deltaY
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const appendToQueue = useCallback((incoming: QueueItem[]) => {
    setQueue((prev) => {
      const existingKeySet = new Set(
        prev.map(
          (item) =>
            `${item.filename}:${item.file.size}:${item.file.lastModified}:${item.folderName ?? ''}:${item.tags.join(',')}`,
        ),
      )

      const uniqueIncoming = incoming.filter((item) => {
        const key = `${item.filename}:${item.file.size}:${item.file.lastModified}:${item.folderName ?? ''}:${item.tags.join(',')}`
        if (existingKeySet.has(key)) return false
        existingKeySet.add(key)
        return true
      })

      return [...prev, ...uniqueIncoming]
    })
  }, [])

  // 移除 manualTag，散图不再有默认 tag
  const toQueueItems = useCallback((files: FileWithPath[]): QueueItem[] => {
    return files
      .filter(({ file }) => isImageFile(file))
      .map(({ file, relativePath }) => {
        const folderName = topFolderFromPath(
          relativePath || (file as File & { webkitRelativePath?: string }).webkitRelativePath,
        )

        const initialTags = toSortedUniqueTags(folderName ? [folderName] : [])

        return {
          localId: makeLocalId(),
          file,
          filename: file.name,
          folderName,
          alt: stripExt(file.name),
          tags: initialTags,
        }
      })
  }, [])

  const getFilesFromDroppedEntry = useCallback(
    async (entry: FileSystemEntryLike, basePath = ''): Promise<FileWithPath[]> => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntryLike
        const file = await new Promise<File>((resolve, reject) => {
          fileEntry.file(resolve, reject)
        })
        return [{ file, relativePath: `${basePath}${file.name}` }]
      }

      if (entry.isDirectory) {
        const directoryEntry = entry as FileSystemDirectoryEntryLike
        const reader = directoryEntry.createReader()
        const allEntries: FileSystemEntryLike[] = []

        while (true) {
          const chunk = await new Promise<FileSystemEntryLike[]>((resolve, reject) => {
            reader.readEntries(resolve, reject)
          })
          if (chunk.length === 0) break
          allEntries.push(...chunk)
        }

        const nextBase = `${basePath}${entry.name}/`
        const nested = await Promise.all(
          allEntries.map((childEntry) => getFilesFromDroppedEntry(childEntry, nextBase)),
        )
        return nested.flat()
      }

      return []
    },
    [],
  )

  const getFilesFromDrop = useCallback(
    async (e: React.DragEvent): Promise<FileWithPath[]> => {
      const items = Array.from(e.dataTransfer.items || []) as DataTransferItemWithWebkit[]
      const hasEntryAPI = items.some((item) => typeof item.webkitGetAsEntry === 'function')

      if (hasEntryAPI) {
        const filesFromEntries = await Promise.all(
          items
            .filter((item) => item.kind === 'file')
            .map(async (item) => {
              const entry = item.webkitGetAsEntry?.()
              if (!entry) return []
              return getFilesFromDroppedEntry(entry)
            }),
        )

        const flattened = filesFromEntries.flat()
        if (flattened.length > 0) return flattened
      }

      const files = Array.from(e.dataTransfer.files || [])
      return files.map((file) => ({
        file,
        relativePath:
          (file as File & { webkitRelativePath?: string }).webkitRelativePath || undefined,
      }))
    },
    [getFilesFromDroppedEntry],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      void (async () => {
        const files = await getFilesFromDrop(e)
        const items = toQueueItems(files)
        if (items.length === 0) {
          alert('No image files found.')
          return
        }
        appendToQueue(items)
      })()
    },
    [appendToQueue, getFilesFromDrop, toQueueItems],
  )

  const handleFolderInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).map((file) => ({
        file,
        relativePath:
          (file as File & { webkitRelativePath?: string }).webkitRelativePath || undefined,
      }))

      const items = toQueueItems(files)
      if (items.length === 0) {
        alert('No image files found.')
        return
      }
      appendToQueue(items)
      e.target.value = ''
    },
    [appendToQueue, toQueueItems],
  )

  const handleImageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).map((file) => ({ file }))
      const items = toQueueItems(files)
      if (items.length === 0) {
        alert('No image files found.')
        return
      }
      appendToQueue(items)
      e.target.value = ''
    },
    [appendToQueue, toQueueItems],
  )

  const updateQueueItem = useCallback(
    (localId: string, patch: Partial<Pick<QueueItem, 'alt' | 'tags'>>) => {
      setQueue((prev) =>
        prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item)),
      )
    },
    [],
  )

  const addTagToRow = useCallback(
    (localId: string, tag: string) => {
      const value = normalizeTag(tag)
      if (!value) return
      updateQueueItem(localId, {
        tags: toSortedUniqueTags(
          (queue.find((item) => item.localId === localId)?.tags || []).concat(value),
        ),
      })
      setExistingTags((prev) => {
        if (prev.includes(value)) return prev
        return toSortedUniqueTags([...prev, value])
      })
    },
    [queue, updateQueueItem],
  )

  const removeTagFromRow = useCallback(
    (localId: string, tag: string) => {
      updateQueueItem(localId, {
        tags: (queue.find((item) => item.localId === localId)?.tags || []).filter(
          (t) => t !== tag,
        ),
      })
    },
    [queue, updateQueueItem],
  )

  const removeQueueItem = useCallback((localId: string) => {
    setQueue((prev) => prev.filter((item) => item.localId !== localId))
  }, [])

  const addGlobalTag = useCallback((tag: string) => {
    const value = normalizeTag(tag)
    if (!value) return
    setGlobalTags((prev) => toSortedUniqueTags(prev.concat(value)))
    setQueue((prev) =>
      prev.map((item) => ({ ...item, tags: toSortedUniqueTags(item.tags.concat(value)) })),
    )
  }, [])

  const removeGlobalTag = useCallback((tag: string) => {
    setGlobalTags((prev) => prev.filter((t) => t !== tag))
    setQueue((prev) => ({
      ...prev,
      tags: prev.map((item) => ({ ...item, tags: item.tags.filter((t) => t !== tag) })),
    }))
    setQueue((prev) => prev.map((item) => ({ ...item, tags: item.tags.filter((t) => t !== tag) })))
  }, [])

  const checkDuplicateByFilenameAndTags = useCallback(
    async (items: QueueItem[]): Promise<Set<string>> => {
      const duplicateSet = new Set<string>()
      const filenameCache = new Map<string, any[]>()

      for (const item of items) {
        if (!filenameCache.has(item.filename)) {
          try {
            const res = await fetch(
              `/api/media?where[filename][equals]=${encodeURIComponent(item.filename)}&limit=100&depth=0`,
              { credentials: 'include' },
            )
            if (!res.ok) {
              filenameCache.set(item.filename, [])
            } else {
              const data = await res.json()
              filenameCache.set(item.filename, Array.isArray(data?.docs) ? data.docs : [])
            }
          } catch {
            filenameCache.set(item.filename, [])
          }
        }

        const docs = filenameCache.get(item.filename) || []
        const itemTags = toSortedUniqueTags(item.tags)

        const isDup = docs.some((doc) => {
          const docTags = toSortedUniqueTags(
            Array.isArray(doc?.tags)
              ? doc.tags.map((t: { tag?: string }) => String(t?.tag ?? ''))
              : [],
          )
          return JSON.stringify(docTags) === JSON.stringify(itemTags)
        })

        if (isDup) duplicateSet.add(item.localId)
      }

      setQueue((prev) =>
        prev.map((item) => ({ ...item, duplicate: duplicateSet.has(item.localId) })),
      )

      return duplicateSet
    },
    [],
  )

  const uploadOne = useCallback(async (item: QueueItem): Promise<UploadResult> => {
    const payload: { alt: string; tags?: { tag: string }[] } = {
      alt: item.alt.trim() || stripExt(item.filename),
    }

    const normalizedTags = toSortedUniqueTags(item.tags)
    if (normalizedTags.length > 0) {
      payload.tags = normalizedTags.map((tag) => ({ tag }))
    }

    try {
      const formData = new FormData()
      formData.append('file', item.file)
      formData.append('_payload', JSON.stringify(payload))

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return {
          localId: item.localId,
          filename: item.filename,
          status: 'error',
          message: err?.message || 'Upload failed',
        }
      }

      const data = await res.json().catch(() => ({}))
      const uploadedId = String(data?.doc?.id ?? data?.id ?? '')

      return {
        localId: item.localId,
        filename: item.filename,
        status: 'success',
        uploadedId: uploadedId || undefined,
      }
    } catch (err) {
      return {
        localId: item.localId,
        filename: item.filename,
        status: 'error',
        message: String(err),
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
      const successIds: string[] = []
      let completed = 0
      const CONCURRENCY = 3

      const uploadWithProgress = async (item: QueueItem) => {
        const result = await uploadOne(item)
        results.push(result)
        if (result.status === 'success' && result.uploadedId) {
          successIds.push(result.uploadedId)
        }
        completed += 1
        setProgress({ current: completed, total: items.length })
      }

      for (let i = 0; i < items.length; i += CONCURRENCY) {
        const batch = items.slice(i, i + CONCURRENCY)
        await Promise.all(batch.map(uploadWithProgress))
      }

      setIsUploading(false)
      setProgress(null)

      const failed = results.filter((r) => r.status === 'error')
      setFailedResults(failed)

      const uploadedLocalIds = new Set(
        results.filter((r) => r.status === 'success').map((r) => r.localId),
      )

      setQueue((prev) => prev.filter((item) => !uploadedLocalIds.has(item.localId)))
      setUploadedIds(new Set(successIds))

      if (successIds.length > 0) {
        router.refresh()
        loadExistingTags()
      }
    },
    [loadExistingTags, router, uploadOne],
  )

  const handleUploadAll = useCallback(async () => {
    if (queue.length === 0) {
      alert('Please add images to upload queue first.')
      return
    }

    const dupSet = await checkDuplicateByFilenameAndTags(queue)

    if (dupSet.size > 0) {
      setDuplicateLocalIds(dupSet)
      setDuplicateNames(
        queue
          .filter((item) => dupSet.has(item.localId))
          .map(
            (item) =>
              `${item.folderName ? `${item.folderName}/` : ''}${item.filename} (tags: ${item.tags.join(', ') || 'empty'})`,
          ),
      )
      setShowDuplicateModal(true)
      return
    }

    await runUpload(queue)
  }, [checkDuplicateByFilenameAndTags, queue, runUpload])

  const retryFailed = useCallback(async () => {
    if (failedResults.length === 0) return

    const byLocalId = new Map(queue.map((item) => [item.localId, item]))
    const toRetry = failedResults
      .map((result) => byLocalId.get(result.localId))
      .filter((item): item is QueueItem => Boolean(item))

    if (toRetry.length === 0) return
    await runUpload(toRetry)
  }, [failedResults, queue, runUpload])

  useEffect(() => {
    if (uploadedIds.size === 0) return

    const clearPreviousHighlight = () => {
      const highlighted = document.querySelectorAll<HTMLElement>(
        '[data-media-upload-highlight="true"]',
      )
      highlighted.forEach((el) => {
        el.style.backgroundColor = ''
        el.removeAttribute('data-media-upload-highlight')
      })
    }

    const applyHighlight = () => {
      clearPreviousHighlight()

      uploadedIds.forEach((id) => {
        const link = document.querySelector<HTMLAnchorElement>(
          `a[href*="/admin/collections/media/${id}"]`,
        )
        if (!link) return

        const row =
          link.closest<HTMLElement>('tr') ||
          link.closest<HTMLElement>('[role="row"]') ||
          link.closest<HTMLElement>('li') ||
          link.closest<HTMLElement>('article')

        if (!row) return

        row.style.backgroundColor = 'rgba(59,130,246,0.12)'
        row.setAttribute('data-media-upload-highlight', 'true')
      })
    }

    applyHighlight()

    const observer = new MutationObserver(() => applyHighlight())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [uploadedIds])

  const progressPercent =
    progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  const previews = useMemo(
    () =>
      queue.map((item) => ({
        localId: item.localId,
        url: URL.createObjectURL(item.file),
      })),
    [queue],
  )

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  const previewMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of previews) map.set(p.localId, p.url)
    return map
  }, [previews])

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* 拖拽上传区域 */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? BLUE : BORDER}`,
          borderRadius: '8px',
          padding: '16px',
          background: isDragging ? 'rgba(59,130,246,0.08)' : 'transparent',
          marginBottom: '14px',
        }}
      >
        <input
          ref={folderInputRef}
          type="file"
          multiple
          {...({ webkitdirectory: 'true', directory: 'true' } as Record<string, string>)}
          style={{ display: 'none' }}
          onChange={handleFolderInputChange}
          disabled={isUploading}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageInputChange}
          disabled={isUploading}
        />

        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
          <strong>Recommended:</strong> Drop folders and/or images here to avoid security prompts. Folder files use folder-name as tag.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isUploading}
            style={{
              width: '100%',
              padding: '10px 12px',
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
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
            style={{
              width: '100%',
              padding: '10px 12px',
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
        </div>
      </div>

      {/* UPLOAD PREVIEW */}
      <div
        style={{
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
          UPLOAD PREVIEW
        </div>

        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
            Apply tag to all
          </div>
          <TagEditor
            tags={globalTags}
            existingTags={existingTags}
            disabled={isUploading}
            onAddTag={addGlobalTag}
            onRemoveTag={removeGlobalTag}
          />
        </div>

        {/* 独立滚动容器：鼠标在此区域内滚轮只滚动列表，不影响页面 */}
        <div
          ref={previewScrollRef}
          style={{
            overflowY: 'auto',
            maxHeight: '360px',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    fontSize: '12px',
                    padding: '8px',
                    borderBottom: '1px solid #374151',
                    position: 'sticky',
                    top: 0,
                    background: '#f9fafb',
                    zIndex: 10,
                  }}
                >
                  IMG
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    fontSize: '12px',
                    padding: '8px',
                    borderBottom: '1px solid #374151',
                    position: 'sticky',
                    top: 0,
                    background: '#f9fafb',
                    zIndex: 10,
                  }}
                >
                  Alt
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    fontSize: '12px',
                    padding: '8px',
                    borderBottom: '1px solid #374151',
                    position: 'sticky',
                    top: 0,
                    background: '#f9fafb',
                    zIndex: 10,
                  }}
                >
                  Tags
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    fontSize: '12px',
                    padding: '8px',
                    borderBottom: '1px solid #374151',
                    position: 'sticky',
                    top: 0,
                    background: '#f9fafb',
                    zIndex: 10,
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr
                  key={item.localId}
                  style={{
                    background: item.duplicate ? 'rgba(245,158,11,0.14)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '8px', borderBottom: '1px solid #374151' }}>
                    <img
                      src={previewMap.get(item.localId)}
                      alt={item.filename}
                      style={{
                        width: '56px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #4b5563',
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #374151' }}>
                    <input
                      value={item.alt}
                      onChange={(e) => updateQueueItem(item.localId, { alt: e.target.value })}
                      placeholder="alt"
                      disabled={isUploading}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${LIGHT_BLUE_BORDER}`,
                        background: LIGHT_BLUE,
                        color: DARK_GRAY,
                        fontSize: '12px',
                      }}
                    />
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #374151',
                      minWidth: '320px',
                    }}
                  >
                    <TagEditor
                      tags={item.tags}
                      existingTags={existingTags}
                      disabled={isUploading}
                      onAddTag={(tag) => addTagToRow(item.localId, tag)}
                      onRemoveTag={(tag) => removeTagFromRow(item.localId, tag)}
                    />
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #374151',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <button
                      onClick={() => removeQueueItem(item.localId)}
                      disabled={isUploading}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #6b7280',
                        borderRadius: '6px',
                        background: 'transparent',
                        color: '#4b5563',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {queue.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: '10px 8px', fontSize: '12px', color: '#9ca3af' }}
                  >
                    Queue is empty. Add folder(s) or images first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={() => {
              if (queue.length === 0) return
              if (confirm(`Are you sure you want to delete all ${queue.length} item(s)?`)) {
                setQueue([])
              }
            }}
            disabled={isUploading || queue.length === 0}
            style={{
              padding: '8px 16px',
              border: '1px solid #6b7280',
              borderRadius: '6px',
              background: 'transparent',
              color: '#ef4444',
              fontWeight: 600,
              cursor: isUploading || queue.length === 0 ? 'not-allowed' : 'pointer',
              opacity: isUploading || queue.length === 0 ? 0.6 : 1,
            }}
          >
            Delete All ({queue.length})
          </button>
          <button
            onClick={handleUploadAll}
            disabled={isUploading || queue.length === 0}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: '#10b981',
              color: '#fff',
              fontWeight: 600,
              cursor: isUploading || queue.length === 0 ? 'not-allowed' : 'pointer',
              opacity: isUploading || queue.length === 0 ? 0.6 : 1,
            }}
          >
            {isUploading ? 'Uploading...' : `Upload All (${queue.length})`}
          </button>
        </div>
      </div>

      {/* 进度条 */}
      {isUploading && progress && (
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
          <div
            style={{ marginTop: '4px', fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}
          >
            {progressPercent}% - {progress.current} / {progress.total}
          </div>
        </div>
      )}

      {/* 失败列表 */}
      {failedResults.length > 0 && !isUploading && (
        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: '8px',
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
              onClick={retryFailed}
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
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {failedResults.map((item) => (
              <li key={item.localId} style={{ fontSize: '12px', color: '#fca5a5' }}>
                {item.filename}
                {item.message ? ` - ${item.message}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 重复文件弹窗 */}
      {showDuplicateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
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
            <h3 style={{ margin: '0 0 12px 0', color: '#111827' }}>
              Duplicate Files Detected (filename + tags)
            </h3>
            <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px' }}>
              {duplicateLocalIds.size} queued file(s) already exist. Choose how to continue.
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
                onClick={async () => {
                  setShowDuplicateModal(false)
                  await runUpload(queue)
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
                onClick={async () => {
                  setShowDuplicateModal(false)
                  const toUpload = queue.filter((item) => !duplicateLocalIds.has(item.localId))
                  if (toUpload.length === 0) {
                    alert('No files left after skipping duplicates.')
                    return
                  }
                  await runUpload(toUpload)
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
    </div>
  )
}