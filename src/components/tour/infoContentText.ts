export function getInfoContentTextBlocks(value: unknown): string[] {
  if (typeof value === 'string') {
    const text = normalizeWhitespace(value)
    return text ? [text] : []
  }

  if (!isRecord(value)) return []

  const rootChildren = isRecord(value.root) && Array.isArray(value.root.children)
    ? value.root.children
    : null

  if (rootChildren) {
    const blockTexts = rootChildren
      .map((child) => normalizeWhitespace(extractText(child)))
      .filter(Boolean)

    if (blockTexts.length > 0) return blockTexts
  }

  const fallbackText = normalizeWhitespace(extractText(value))
  return fallbackText ? [fallbackText] : []
}

export function getInfoContentText(value: unknown): string {
  return getInfoContentTextBlocks(value).join('\n')
}

export function getInfoContentPreview(value: unknown, maxLength = 90): string {
  const text = normalizeWhitespace(getInfoContentTextBlocks(value).join(' '))
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
  return getInfoContentTextBlocks(value).length === 0
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

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
