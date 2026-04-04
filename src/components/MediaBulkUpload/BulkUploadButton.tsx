'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UploadResult {
  filename: string
  status: 'success' | 'error'
  message?: string
}

export const BulkUploadButton: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))
      if (imageFiles.length === 0) {
        alert('Please select image files.')
        return
      }

      setIsUploading(true)
      setProgress({ current: 0, total: imageFiles.length })

      const results: UploadResult[] = []
      let completed = 0
      const CONCURRENCY = 3

      const uploadOne = async (file: File) => {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('_payload', JSON.stringify({ alt: nameWithoutExt }))

          const res = await fetch('/api/media', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          })

          if (!res.ok) {
            const err = await res.json()
            results.push({ filename: file.name, status: 'error', message: err?.message })
          } else {
            results.push({ filename: file.name, status: 'success' })
          }
        } catch (e) {
          results.push({ filename: file.name, status: 'error', message: String(e) })
        }
        completed++
        setProgress({ current: completed, total: imageFiles.length })
      }

      for (let i = 0; i < imageFiles.length; i += CONCURRENCY) {
        const batch = imageFiles.slice(i, i + CONCURRENCY)
        await Promise.all(batch.map(uploadOne))
      }

      setIsUploading(false)
      setProgress(null)

      const successCount = results.filter((r) => r.status === 'success').length
      const errorCount = results.filter((r) => r.status === 'error').length

      if (successCount > 0) {
        alert(
          `✅ Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
        )
        router.refresh()
      } else {
        alert('❌ Upload failed. Please try again.')
      }
    },
    [router],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      uploadFiles(Array.from(e.dataTransfer.files))
    },
    [uploadFiles],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      uploadFiles(Array.from(e.target.files || []))
      e.target.value = ''
    },
    [uploadFiles],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? '#3b82f6' : '#4b5563'}`,
        borderRadius: '8px',
        padding: '20px 24px',
        marginBottom: '16px',
        background: isDragging ? 'rgba(59,130,246,0.08)' : 'transparent',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        style={{
          padding: '8px 16px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          opacity: isUploading ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {isUploading
          ? `Uploading... ${progress?.current}/${progress?.total}`
          : 'Bulk Upload Images'}
      </button>

      <span style={{ color: '#9ca3af', fontSize: '13px' }}>
        {isDragging
          ? 'Release to upload'
          : isUploading
            ? `Uploading ${progress?.current} of ${progress?.total} — filenames will be used as Alt text`
            : 'Or drag & drop multiple images here · Filename will be used as Alt text automatically'}
      </span>
    </div>
  )
}