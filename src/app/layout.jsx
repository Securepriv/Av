export const metadata = {
  title: 'VABilling — Facturation pour assistantes virtuelles',
  description: 'Devis, factures, timer et rappels automatiques pour les assistantes virtuelles.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
