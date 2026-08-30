import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="py-16 bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-lg">FormFlow</span>
            </Link>
            <p className="text-sm text-zinc-400 mt-3">
              Build smarter forms.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/templates" className="text-sm text-zinc-400 hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="/analytics" className="text-sm text-zinc-400 hover:text-white transition-colors">Analytics</Link></li>
              <li><Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/api" className="text-sm text-zinc-400 hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="/guides" className="text-sm text-zinc-400 hover:text-white transition-colors">Guides</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-400 hover:text-white transition-colors">Contact</Link></li>
              <li><a href="https://github.com" className="text-sm text-zinc-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            © 2026 FormFlow. All rights reserved.
          </p>
          <p className="text-sm text-zinc-600">
            Built with Next.js, NestJS & PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
