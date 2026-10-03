import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-inter' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-plex-mono' });

export const metadata = {
  title: 'Meu Plano de Carreira · Mentoria WoMakersCode',
  description:
    'Ferramentas da mentoria de carreira WoMakersCode para definir objetivos, identificar oportunidades de desenvolvimento e criar um plano de ação.',
};

export const viewport = { themeColor: '#16181b' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
