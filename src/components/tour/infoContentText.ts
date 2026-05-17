const SELF_RENDERING_NODE_TYPES = new Set([
  'block',
  'horizontalrule',
  'inlineBlock',
  'relationship',
  'table',
  'upload',
])

export function isLexicalRichTextValue(value: unknown): value is Record<string, unknown> & {
  root: Record<string, unknown> & { children: unknown[] }
} {
  return isRecord(value) && isRecord(value.root) && Array.isArray(value.root.children)
}

export function hasRichTextContent(value: unknown): boolean {
  if (typeof value === 'string') return normalizeWhitespace(value).length > 0
  if (!isLexicalRichTextValue(value)) return false
  return value.root.children.some(hasRenderableNode)
}

export function getRichTextTextBlocks(value: unknown): string[] {
  if (typeof value === 'string') {
    const text = normalizeWhitespace(value)
    return text ? [text] : []
  }

  if (!isRecord(value)) return []

  const rootChildren = isLexicalRichTextValue(value) ? value.root.children : null

  if (rootChildren) {
    const blockTexts = rootChildren
      .map((child) => normalizeWhitespace(extractText(child)))
      .filter(Boolean)

    if (blockTexts.length > 0) return blockTexts
  }

  const fallbackText = normalizeWhitespace(extractText(value))
  return fallbackText ? [fallbackText] : []
}

export const getInfoContentTextBlocks = getRichTextTextBlocks

export function getInfoContentText(value: unknown): string {
  return getRichTextTextBlocks(value).join('\n')
}

export function getInfoContentPreview(value: unknown, maxLength = 90): string {
  const text = normalizeWhitespace(getRichTextTextBlocks(value).join(' '))
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}...`
}

export function getInfoContentType(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return 'array'
  if (isRecord(value) && isRecord(value.root)) return 'lexical'
  return typeof value
}

export function isInfoContentEmpty(value: unknown): boolean {
  return !hasRichTextContent(value)
}

function extractText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(extractText).join(' ')
  if (!isRecord(value)) return ''

  const ownText = typeof value.text === 'string' ? value.text : ''
  const childText = Array.isArray(value.children)
    ? value.children.map(extractText).join(' ')
    : ''

  return `${ownText} ${childText}`.trim()
}

function hasRenderableNode(value: unknown): boolean {
  if (typeof value === 'string') return normalizeWhitespace(value).length > 0
  if (Array.isArray(value)) return value.some(hasRenderableNode)
  if (!isRecord(value)) return false

  if (typeof value.text === 'string' && normalizeWhitespace(value.text).length > 0) {
    return true
  }

  if (typeof value.type === 'string' && SELF_RENDERING_NODE_TYPES.has(value.type)) {
    return true
  }

  return Array.isArray(value.children) && value.children.some(hasRenderableNode)
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
