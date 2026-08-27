import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import {
  ShieldCheck,
  Zap,
  Lock,
  DollarSign,
  CheckCircle2,
  FileCheck2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CreditCard,
  Scale
} from 'lucide-react';

export function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('client');

  const tabs = [
    { id: 'client', label: 'For Clients (Hiring Talent)' },
    { id: 'freelancer', label: 'For Freelancers (Finding Work)' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="sm">End-to-End Escrow Workflow</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How SkillHire Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          A modern, transparent marketplace engineered for trust, fast milestone delivery, and seamless collaboration.
        </p>
      </div>

      {/* Interactive Flow Switcher */}
      <div className="max-w-md mx-auto">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
      </div>

      {/* Client Workflow */}
      {activeTab === 'client' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Post a Project',
              desc: 'Define your project scope, tech stack, deliverables, budget (fixed or hourly), and estimated timeline.',
              icon: FileCheck2
            },
            {
              step: '2',
              title: 'Review Proposals',
              desc: 'Compare custom proposals from vetted freelancers, inspect past work, and message candidates directly.',
              icon: MessageSquare
            },
            {
              step: '3',
              title: 'Fund Escrow & Hire',
              desc: 'Accept a bid and deposit milestone payments into secure SkillHire Escrow. Funds are safely held.',
              icon: Lock
            },
            {
              step: '4',
              title: 'Approve & Release',
              desc: 'Review code deliverables, request revisions if required, and release escrow with a verified review.',
              icon: ShieldCheck
            }
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400">0{s.step}</span>
                  <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Freelancer Workflow */}
      {activeTab === 'freelancer' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Build Profile',
              desc: 'Showcase your portfolio, verified certifications, hourly rate, and specialized skill categories.',
              icon: Sparkles
            },
            {
              step: '2',
              title: 'Submit Proposals',
              desc: 'Browse hundreds of high-budget projects and submit tailored bids with your estimated timeline.',
              icon: FileCheck2
            },
            {
              step: '3',
              title: 'Work Protected',
              desc: 'Get hired with guaranteed escrow funding before you begin writing a single line of code.',
              icon: Lock
            },
            {
              step: '4',
              title: 'Fast Payouts',
              desc: 'Deliver work, receive client approval, and withdraw funds directly to your bank account or PayPal with just 5% fee.',
              icon: DollarSign
            }
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">0{s.step}</span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Escrow & Dispute Guarantees */}
      <div className="p-8 bg-slate-100/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why Escrow Protection Matters</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We hold contract funds in a neutral escrow vault, guaranteeing peace of mind for both parties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">For Clients</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You only pay when deliverables meet the agreed specifications. If something isn't right, you can request unlimited revisions before approving.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">For Freelancers</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Never worry about unpaid invoices. You can see confirmed escrow balances before starting work, guaranteeing timely payments.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dispute Mediation</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Our 24/7 dedicated platform administrators review evidence, milestone logs, and chat history to provide fair resolutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
