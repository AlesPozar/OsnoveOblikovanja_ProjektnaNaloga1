import type { Metadata } from 'next'
import { Noto_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'

const _notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal'],
})
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CS2 Skins Theory — /color',
  description: 'Visualize hidden color links in CS2 skins through dominant, average, and weighted average color analysis using HSV space.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
