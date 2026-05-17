import React, { type ReactNode } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { hasRichTextContent, isLexicalRichTextValue } from './infoContentText'

type Props = {
  value: unknown
  fallback?: ReactNode
}

export default function RichTextContent({ value, fallback = null }: Props) {
  if (isLexicalRichTextValue(value) && hasRichTextContent(value)) {
    return <RichText data={value as any} disableContainer />
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const paragraphs = value
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)

    return (
      <>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </>
    )
  }

  return <>{fallback}</>
}
