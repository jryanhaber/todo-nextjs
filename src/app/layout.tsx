// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { LocalAuthProvider } from '@/components/LocalAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WorkflowCapture',
  description: 'Capture and organize your workflow'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LocalAuthProvider>{children}</LocalAuthProvider>
      </body>
    </html>
  );
}
