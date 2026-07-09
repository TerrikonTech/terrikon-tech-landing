interface LogoMarkProps {
  className?: string
}

// Знак Террикона. Форма задаётся альфа-маской public/logo-mark.png,
// цвет — фоном (background) через className: светлый #BBCCD7 или чёрный.
export default function LogoMark({ className = '' }: LogoMarkProps) {
  return (
    <span
      role="img"
      aria-label="Террикон"
      className={`inline-block ${className}`}
      style={{
        WebkitMaskImage: 'url(/logo-mark.png)',
        maskImage: 'url(/logo-mark.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}
