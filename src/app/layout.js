// File: src/app/layout.js
import './globals.css';

export const metadata = {
  title: 'Birthday Celebration',
  description: 'A website to celebrate a special birthday',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}