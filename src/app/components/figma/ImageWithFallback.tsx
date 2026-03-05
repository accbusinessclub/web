import React, { useState } from 'react'

// Grey person silhouette — Facebook-style deactivated user placeholder
const AVATAR_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23CBD5E1'/%3E%3Ccircle cx='50' cy='38' r='16' fill='%2394A3B8'/%3E%3Cellipse cx='50' cy='85' rx='28' ry='20' fill='%2394A3B8'/%3E%3C/svg%3E`

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const { src, alt, style, className, ...rest } = props

  const effectiveSrc = !src || src.trim() === '' ? null : src

  if (!effectiveSrc || didError) {
    return (
      <img
        src={AVATAR_PLACEHOLDER}
        alt={alt || 'No photo'}
        className={className}
        style={style}
        {...rest}
        onError={undefined}
      />
    )
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  )
}

