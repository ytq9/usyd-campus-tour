'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UploadResult {
  filename: string
  file: File
  status: 'success' | 'error'
  message?: string
}

export const BulkUploadButton: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [failedFiles, setFailedFiles] = useState<UploadResult[]>([])
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [originalFiles, setOriginalFiles] = useState<File[]>([])
  const [uniqueFiles, setUniqueFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const uploadOne = async (file: File): Promise<UploadResult> => {
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
        return { filename: file.name, file, status: 'error', message: err?.message || 'Upload failed' }
      }
      return { filename: file.name, file, status: 'success' }
    } catch (e) {
      return { filename: file.name, file, status: 'error', message: String(e) }
    }
  }

  const checkDuplicate = async (filename: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/media?where[filename][equals]=${encodeURIComponent(filename)}&limit=1`,
        { credentials: 'include' },
      )
      const data = await res.json()
      return data?.totalDocs > 0
    } catch {
      return false
    }
  }

  const handleUploadChoice = useCallback(async (uploadAll: boolean) => {
    setShowDuplicateModal(false)

    let filesToUploadFinal = uploadAll ? originalFiles : uniqueFiles

    if (!uploadAll && uniqueFiles.length === 0) {
      alert('All files are duplicates. Nothing to upload.')
      setIsUploading(false)
      setProgress(null)
      return
    }

    setProgress({ current: 0, total: filesToUploadFinal.length })

    const results: UploadResult[] = []
    let completed = 0
    const CONCURRENCY = 3

    const uploadOneWithProgress = async (file: File) => {
      const result = await uploadOne(file)
      results.push(result)
      completed++
      setProgress({ current: completed, total: filesToUploadFinal.length })
    }

    for (let i = 0; i < filesToUploadFinal.length; i += CONCURRENCY) {
      const batch = filesToUploadFinal.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map(uploadOneWithProgress))
    }

    setIsUploading(false)
    setProgress(null)

    const failed = results.filter((r) => r.status === 'error')
    setFailedFiles(failed)

    const successCount = results.filter((r) => r.status === 'success').length
    if (successCount > 0) {
      router.refresh()
    }
  }, [originalFiles, uniqueFiles, router])

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))
      if (imageFiles.length === 0) {
        alert('Please select image files.')
        return
      }

      setIsUploading(true)
      setFailedFiles([])

      // Keep existing uploads safe by asking before duplicate filenames are sent.
      const duplicates: string[] = []
      const uniqueFilesList: File[] = []
      for (const file of imageFiles) {
        const isDupe = await checkDuplicate(file.name)
        if (isDupe) {
          duplicates.push(file.name)
        } else {
          uniqueFilesList.push(file)
        }
      }

      if (duplicates.length > 0) {
        setDuplicateFiles(duplicates)
        setOriginalFiles(imageFiles)
        setUniqueFiles(uniqueFilesList)
        setShowDuplicateModal(true)
      } else {
        setProgress({ current: 0, total: imageFiles.length })

        const results: UploadResult[] = []
        let completed = 0
        const CONCURRENCY = 3

        const uploadOneWithProgress = async (file: File) => {
          const result = await uploadOne(file)
          results.push(result)
          completed++
          setProgress({ current: completed, total: imageFiles.length })
        }

        for (let i = 0; i < imageFiles.length; i += CONCURRENCY) {
          const batch = imageFiles.slice(i, i + CONCURRENCY)
          await Promise.all(batch.map(uploadOneWithProgress))
        }

        setIsUploading(false)
        setProgress(null)

        const failed = results.filter((r) => r.status === 'error')
        setFailedFiles(failed)

        const successCount = results.filter((r) => r.status === 'success').length
        if (successCount > 0) {
          router.refresh()
        }
      }
    },
    [router],
  )

  const retryFailed = useCallback(async () => {
    if (failedFiles.length === 0) return

    setIsUploading(true)
    setProgress({ current: 0, total: failedFiles.length })

    const retryResults: UploadResult[] = []
    let completed = 0

    for (const item of failedFiles) {
      const result = await uploadOne(item.file)
      retryResults.push(result)
      completed++
      setProgress({ current: completed, total: failedFiles.length })
    }

    setIsUploading(false)
    setProgress(null)

    const stillFailed = retryResults.filter((r) => r.status === 'error')
    setFailedFiles(stillFailed)

    const successCount = retryResults.filter((r) => r.status === 'success').length
    if (successCount > 0) router.refresh()
  }, [failedFiles, router])

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

  const progressPercent =
    progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#3b82f6' : '#4b5563'}`,
          borderRadius: '8px',
          padding: '20px 24px',
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
          {isUploading ? `Uploading... ${progress?.current}/${progress?.total}` : 'Bulk Upload Images'}
        </button>

        <span style={{ color: '#9ca3af', fontSize: '13px' }}>
          {isDragging
            ? 'Release to upload'
            : isUploading
              ? `Uploading ${progress?.current} of ${progress?.total} — filenames will be used as Alt text`
              : 'Or drag & drop multiple images here · Filename will be used as Alt text automatically'}
        </span>
      </div>

      {isUploading && progress && (
        <div style={{ marginTop: '10px' }}>
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
                background: '#3b82f6',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
            {progressPercent}% — {progress.current} / {progress.total} images
          </div>
        </div>
      )}

      {failedFiles.length > 0 && !isUploading && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
              {failedFiles.length} file{failedFiles.length > 1 ? 's' : ''} failed to upload
            </span>
            <button
              onClick={retryFailed}
              style={{
                padding: '4px 12px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Retry All
            </button>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
            {failedFiles.map((f) => (
              <li key={f.filename} style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>
                {f.filename}
                {f.message && (
                  <span style={{ color: '#6b7280', marginLeft: '8px' }}>— {f.message}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDuplicateModal && (
        <div style={{
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
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: 600,
              color: '#1f2937',
            }}>
              Duplicate Files Detected
            </h3>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#4b5563',
            }}>
              The following files already exist in the media library:
            </p>
            <ul style={{
              margin: '0 0 24px 0',
              padding: '0 0 0 20px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {duplicateFiles.map((filename, index) => (
                <li key={index} style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px',
                }}>
                  {filename}
                </li>
              ))}
            </ul>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => {
                  setShowDuplicateModal(false)
                  setIsUploading(false)
                  setProgress(null)
                }}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadChoice(true)}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                Upload All
              </button>
              <button
                onClick={() => handleUploadChoice(false)}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
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
