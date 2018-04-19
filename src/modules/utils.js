'use strict'

export function parseUrl(url) {
  const parts = url.replace('///', '//').split('//')
  let parsedUrl

  parts.length > 1 ? [, parsedUrl] = parts : [parsedUrl] = parts
  if (parsedUrl.startsWith('www.')) {
    parsedUrl = parsedUrl.replace('www.', '')
  }
  [parsedUrl] = parsedUrl.split('?')
  if (parsedUrl[parsedUrl.length - 1] === '/') {
    parsedUrl = parsedUrl.slice(0, -1)
  }

  return {
    domain: parsedUrl.split('/')[0],
    page: parsedUrl
  }
}
