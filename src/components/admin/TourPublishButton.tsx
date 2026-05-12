'use client'

import type { PublishButtonClientProps } from 'payload'

import { FormSubmit, useConfig, useDocumentInfo, useForm, useFormModified, useLocale, useTranslation } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import * as qs from 'qs-esm'
import React, { useCallback, useState } from 'react'

type RelationshipValue =
  | string
  | number
  | { id?: string | number; value?: string | number }
  | null
  | undefined

type DraftSceneSummary = {
  id: string | number
  title: string
}

type DraftFloorSummary = {
  id: string | number
  title: string
}

const getRelationshipId = (value: RelationshipValue): string | null => {
  if (value == null) return null

  if (typeof value === 'object') {
    if (value.id != null) return String(value.id)
    if (value.value != null) return String(value.value)
    return null
  }

  return String(value)
}

const getRelationshipIds = (value: RelationshipValue | RelationshipValue[]): string[] => {
  if (!Array.isArray(value)) {
    const id = getRelationshipId(value)
    return id ? [id] : []
  }

  return value.map((entry) => getRelationshipId(entry)).filter((id): id is string => Boolean(id))
}

const readEndpointResponse = async <T,>(res: Response): Promise<T> => {
  const json = (await res.json().catch(() => null)) as T | null

  if (!res.ok) {
    const errorMessage =
      json && typeof json === 'object' && 'error' in json ? (json.error as string) : undefined
    const message = errorMessage || 'Unable to check draft tour content.'
    throw new Error(message)
  }

  return json as T
}

export function TourPublishButton({
  label: labelProp,
}: {
  label?: string
} & PublishButtonClientProps): React.JSX.Element | null {
  const {
    collectionSlug,
    hasPublishedDoc,
    hasPublishPermission,
    id,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
    unpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const { getData, submit } = useForm()
  const modified = useFormModified()
  const { code: localeCode } = useLocale()
  const { t } = useTranslation()
  const [checkingDraftContent, setCheckingDraftContent] = useState(false)

  const hasNewerVersions = unpublishedVersionCount > 0
  const canPublish =
    hasPublishPermission &&
    (modified || hasNewerVersions || !hasPublishedDoc) &&
    uploadStatus !== 'uploading'
  const label = labelProp || t('version:publishChanges')

  const postTourEndpoint = useCallback(
    async <T,>(path: string, body: Record<string, unknown>): Promise<T> => {
      if (!collectionSlug || !id) {
        throw new Error('Save this tour before publishing draft scenes.')
      }

      const endpoint = formatAdminURL({
        apiRoute: api,
        path: `/${collectionSlug}/${id}/${path}`,
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      return readEndpointResponse<T>(response)
    },
    [api, collectionSlug, id],
  )

  const publish = useCallback(async () => {
    if (uploadStatus === 'uploading' || checkingDraftContent) return

    setCheckingDraftContent(true)

    try {
      const formData = getData()
      const formHasFloors = Object.prototype.hasOwnProperty.call(formData, 'floors')
      const floorIds = getRelationshipIds((formData as any)?.floors as RelationshipValue[])
      const body = formHasFloors ? { floorIds } : {}

      if (id) {
        const draftFloorResult = await postTourEndpoint<{
          count: number
          floors: DraftFloorSummary[]
        }>('draft-floors', body)
        const draftSceneResult = await postTourEndpoint<{
          count: number
          scenes: DraftSceneSummary[]
        }>('draft-scenes', body)

        const draftContentCount = draftFloorResult.count + draftSceneResult.count
        if (draftContentCount > 0) {
          const listedFloors = draftFloorResult.floors
            .slice(0, 4)
            .map((floor) => `Draft floor: ${floor.title || `ID ${floor.id}`}`)
          const listedScenes = draftSceneResult.scenes
            .slice(0, 6)
            .map((scene) => `Draft scene: ${scene.title || `ID ${scene.id}`}`)
          const listedContent = [...listedFloors, ...listedScenes].join('\n')
          const remainingCount = draftContentCount - listedFloors.length - listedScenes.length
          const remainingText = remainingCount > 0 ? `\nAnd ${remainingCount} more draft item(s)` : ''
          const confirmed = window.confirm(
            `This tour includes ${draftContentCount} draft item(s).\n\n${listedContent}${remainingText}\n\nPublish these floors, scenes, and the tour now?`,
          )

          if (!confirmed) return

          if (draftFloorResult.count > 0) {
            await postTourEndpoint('publish-draft-floors', body)
          }
          if (draftSceneResult.count > 0) {
            await postTourEndpoint('publish-draft-scenes', body)
          }
        }
      }

      const params = qs.stringify(
        {
          depth: 0,
          locale: localeCode,
        },
        { addQueryPrefix: true },
      )
      const action = formatAdminURL({
        apiRoute: api,
        path: `/${collectionSlug}${id ? `/${id}` : ''}${params}`,
      })
      const result = await submit({
        action,
        overrides: {
          _status: 'published',
        },
      })

      if (result) {
        setUnpublishedVersionCount(0)
        setMostRecentVersionIsAutosaved(false)
        setHasPublishedDoc(true)
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to publish this tour.')
    } finally {
      setCheckingDraftContent(false)
    }
  }, [
    api,
    checkingDraftContent,
    collectionSlug,
    getData,
    id,
    localeCode,
    postTourEndpoint,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
    submit,
    uploadStatus,
  ])

  if (!hasPublishPermission) return null

  return (
    <FormSubmit
      buttonId="action-save"
      disabled={!canPublish || checkingDraftContent}
      onClick={publish}
      size="medium"
      type="button"
    >
      {checkingDraftContent ? 'Checking draft content...' : label}
    </FormSubmit>
  )
}
