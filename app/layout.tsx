import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'VoiceForge AI',
  description: 'A modern SaaS web platform for generating realistic AI voices from text.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" data-theme="nebula">
      <body className="bg-theme-bg text-zinc-50 antialiased min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-1000" suppressHydrationWarning>
        <ThemeProvider>
          {/* 3D Animated Background */}
          <div className="fixed inset-0 z-[-1] pointer-events-none perspective-container overflow-hidden bg-theme-bg transition-colors duration-1000">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-theme-primary/10 via-theme-bg to-theme-bg transition-colors duration-1000"></div>
            
            {/* 3D Grid */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid-plane"></div>
            </div>

            {/* Animated glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme-orb1 rounded-full blur-3xl animate-pulse transition-colors duration-1000"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-theme-orb2 rounded-full blur-3xl animate-pulse transition-colors duration-1000" style={{ animationDelay: '2s' }}></div>
          </div>

          <AuthProvider>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </AuthProvider>

          {/* Global Footer */}
          <footer className="py-6 text-center border-t border-theme-border bg-theme-bg/50 backdrop-blur-sm mt-auto transition-colors duration-1000">
            <p className="text-sm text-zinc-400">
              © {new Date().getFullYear()} VoiceForge AI. Made with ❤️ by <span className="text-theme-primary font-semibold tracking-wide">Shatarudra</span>.
            </p>
            <a 
              href="https://port-rudraindex.edgeone.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-theme-primary hover:text-theme-primary-hover transition-colors mt-2 inline-block"
            >
              Contact Owner
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
