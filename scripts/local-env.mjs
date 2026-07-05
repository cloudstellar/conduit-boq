import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function readLocalEnvFile(path = resolve(process.cwd(), 'supabase/.env.local')) {
  try {
    return parseEnvFile(readFileSync(path, 'utf8'))
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {}
    }
    throw error
  }
}

export function parseEnvFile(raw) {
  const values = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separator = trimmed.indexOf('=')
    if (separator < 1) {
      continue
    }

    values[trimmed.slice(0, separator).trim()] = parseEnvValue(
      trimmed.slice(separator + 1).trim(),
    )
  }

  return values
}

function parseEnvValue(value) {
  if (!value) {
    return ''
  }

  const quote = value[0]
  if (quote === '"' || quote === "'") {
    return parseQuotedEnvValue(value, quote)
  }

  const commentIndex = value.indexOf('#')
  return (commentIndex >= 0 ? value.slice(0, commentIndex) : value).trim()
}

function parseQuotedEnvValue(value, quote) {
  let escaped = false

  for (let index = 1; index < value.length; index += 1) {
    const character = value[index]
    if (escaped) {
      escaped = false
      continue
    }

    if (quote === '"' && character === '\\') {
      escaped = true
      continue
    }

    if (character === quote) {
      return value.slice(1, index)
    }
  }

  return value.slice(1)
}
