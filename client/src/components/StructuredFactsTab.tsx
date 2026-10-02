import React from 'react';
import { InvestigationReport } from '../types.js';
import {
  FileText,
  DollarSign,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface StructuredFactsTabProps {
  facts: InvestigationReport['consolidatedFacts'];
  timeline: InvestigationReport['timelineChronology'];
  onInspectEvidence: (docId: string, snippet: string, title: string) => void;
}

export const StructuredFactsTab: React.FC<StructuredFactsTabProps> = ({
  facts,
  timeline,
  onInspectEvidence,
}) => {
  return (
    <div className="space-y-8">
      {/* 1. Structured Facts Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Extracted Structured Facts & Covenants
          </h3>
          <p className="text-xs text-slate-400">
            Normalized contract parameters parsed from the primary employment documentation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Base Salary */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <DollarSign className="w-4 h-4" />
              <span>Base Compensation</span>
            </div>
            <div className="text-xl font-bold text-white">
              {facts.baseSalary ? facts.baseSalary.value.formatted : 'Not Documented'}
            </div>
            <p className="text-xs text-slate-400">
              Period: {facts.baseSalary?.value.period || 'Annual'} • Currency: USD
            </p>
            {facts.baseSalary && (
              <button
                onClick={() =>
                  onInspectEvidence(
                    facts.baseSalary!.sourceDocId,
                    facts.baseSalary!.rawSnippet,
                    facts.baseSalary!.sourceDocTitle
                  )
                }
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono pt-1 transition"
              >
                <ExternalLink className="w-3 h-3" />
                Source: {facts.baseSalary.sourceDocTitle}
              </button>
            )}
          </div>

          {/* Bonus Structure */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
              <DollarSign className="w-4 h-4" />
              <span>Annual Bonus & Incentives</span>
            </div>
            <div className="text-lg font-bold text-white">
              {facts.bonus ? facts.bonus.value.amountOrPercentage : 'No Bonus Stated'}
            </div>
            <p className="text-xs text-slate-400">
              Type: {facts.bonus ? facts.bonus.value.type.replace('_', ' ') : 'None'}
            </p>
            {facts.bonus?.value.criteria && (
              <p className="text-[11px] text-slate-400 italic">
                Criteria: {facts.bonus.value.criteria}
              </p>
            )}
          </div>

          {/* Work Location */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
              <MapPin className="w-4 h-4" />
              <span>Work Location Policy</span>
            </div>
            <div className="text-lg font-bold text-white capitalize">
              {facts.workLocation ? facts.workLocation.value.arrangement : 'Unspecified'}
            </div>
            <p className="text-xs text-slate-400">
              {facts.workLocation?.value.officeLocation
                ? `Office: ${facts.workLocation.value.officeLocation}`
                : 'Home Office / Remote'}
            </p>
            {facts.workLocation?.value.requiredDaysInOffice && (
              <p className="text-[11px] text-amber-300 font-medium">
                Mandatory {facts.workLocation.value.requiredDaysInOffice} days/week in-office
              </p>
            )}
          </div>

          {/* Equity & Stock Options */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400">
              <DollarSign className="w-4 h-4" />
              <span>Equity / Stock Options</span>
            </div>
            <div className="text-lg font-bold text-white">
              {facts.equity ? `${facts.equity.value.amount} ${facts.equity.value.grantType.toUpperCase()}` : 'No Equity Grant'}
            </div>
            <p className="text-xs text-slate-400">
              Vesting: {facts.equity ? facts.equity.value.vestingSchedule : 'N/A'}
            </p>
            <p className="text-[11px] text-slate-400">
              Cliff: {facts.equity ? facts.equity.value.cliff : 'N/A'}
            </p>
          </div>

          {/* Governance & Covenants */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400">
              <Briefcase className="w-4 h-4" />
              <span>Restrictive Covenants</span>
            </div>
            <div className="text-sm font-bold text-white">
              {facts.governance?.value.nonCompeteMonths
                ? `${facts.governance.value.nonCompeteMonths}-Month Non-Compete`
                : 'No Non-Compete Period Stated'}
            </div>
            <p className="text-xs text-slate-400">
              IP Scope: {facts.governance?.value.ipAssignmentScope === 'broad' ? 'Broad (Personal Hours Included)' : 'Standard Work-Hours'}
            </p>
            {facts.governance?.value.probationDays && (
              <p className="text-[11px] text-amber-300 font-medium">
                Probation: {facts.governance.value.probationDays} Days
              </p>
            )}
          </div>

          {/* Acceptance Deadline */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Decision Deadline</span>
            </div>
            <div className="text-sm font-bold text-white">
              {facts.deadline ? (facts.deadline.value.expirationDate || `${facts.deadline.value.timeLimitHours} hours`) : 'No Strict Deadline Stated'}
            </div>
            <p className="text-xs text-slate-400">
              {facts.deadline?.value.timeLimitHours
                ? 'Time-pressured decision window'
                : 'Standard review window'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Timeline Chronology */}
      {timeline && timeline.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Dossier Chronology & Communication Flow
            </h3>
            <p className="text-xs text-slate-400">
              Chronological sequence of outreach, screening, promises, and legal contract delivery
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline dot */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-800 border-2 border-emerald-400 group-hover:scale-125 transition-transform"></div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400">{event.date}</span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {event.docType.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{event.docTitle}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.eventSummary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
