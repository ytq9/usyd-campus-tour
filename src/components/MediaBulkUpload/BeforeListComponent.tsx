'use client'

import React, { useEffect } from 'react'
import { BulkUploadButton } from './BulkUploadButton'

export const MediaBeforeList: React.FC = () => {
  useEffect(() => {
    const hideDefaultCreateButton = () => {
      const createLink = document.querySelector<HTMLAnchorElement>('a[href$="/admin/collections/media/create"]')
      if (!createLink) return

      const container =
        createLink.closest('li') ||
        createLink.closest('.list-controls__actions') ||
        createLink.parentElement

      if (container instanceof HTMLElement) {
        container.style.display = 'none'
      }
    }

    hideDefaultCreateButton()

    const observer = new MutationObserver(() => {
      hideDefaultCreateButton()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return <BulkUploadButton />
}

export default MediaBeforeList
