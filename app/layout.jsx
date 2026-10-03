import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-inter' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-plex-mono' });

export const metadata = {
  title: 'Meu Plano de Carreira · Mentoria WoMakersCode',
  description:
    'Exercícios da mentoria de carreira WoMakersCode: Radar de carreira, Career Gap, 30-60-90, Matriz Impacto × Esforço e Experimentos de carreira.',
};

export const viewport = { themeColor: '#16181b' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
