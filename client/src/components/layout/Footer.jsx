import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Globe, Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 transition-colors">
      {/* Main Links Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-soft">
                <Briefcase className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Skill<span className="text-primary-400">Hire</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The premier marketplace connecting world-class engineering, design, and AI talent with ambitious founders and fast-growing businesses.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.75-.79 1.75-1.76s-.78-1.75-1.75-1.75c-.97 0-1.76.78-1.76 1.75s.79 1.76 1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" aria-label="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2: For Clients */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">For Clients</h4>
            <ul className="space-y-2.5">
              <li><Link to="/freelancers" className="hover:text-white transition-colors">Find Freelancers</Link></li>
              <li><Link to="/dashboard/client/projects/new" className="hover:text-white transition-colors">Post a Project</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How Hiring Works</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">Explore Projects</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Talent</a></li>
            </ul>
          </div>

          {/* Col 3: For Freelancers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">For Freelancers</h4>
            <ul className="space-y-2.5">
              <li><Link to="/projects" className="hover:text-white transition-colors">Find Work</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Skill Categories</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Escrow Protection</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Freelancer Community</a></li>
            </ul>
          </div>

          {/* Col 4: Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Security & Trust</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fee Structure (5%)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} SkillHire Inc. All rights reserved. Built for top professionals.
          </p>

          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
