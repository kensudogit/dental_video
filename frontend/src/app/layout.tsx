import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { AppShell } from '@/components/AppShell'
import { GraphQLProviders } from '@/components/GraphQLProviders'
import { ui } from '@/lib/ui'
import './globals.css'

const noto = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: ui.metaTitle,
  description: ui.metaDesc,
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={noto.className}>
        <GraphQLProviders>
          <AppShell>{children}</AppShell>
        </GraphQLProviders>
      </body>
    </html>
  )
}
