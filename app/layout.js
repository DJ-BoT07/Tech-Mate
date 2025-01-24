import { Providers } from './providers';
import { Navigation } from '../components/Navigation';
import "./globals.css";

export const metadata = {
  title: "TechMate Hunt",
  description: "Find your technical match and win exciting prizes!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bowlby+One+SC&family=Iceland&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Navigation />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
