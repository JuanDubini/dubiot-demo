import { FormEvent, useEffect, useRef, useState } from 'react';
import { CheckCheck, MessageSquare, Send } from 'lucide-react';
import { WhatsAppMessage } from '../types/telemetry';

interface WhatsAppAlertsPanelProps {
  messages: WhatsAppMessage[];
  onSendReply: (text: string) => void;
  facilityName: string;
}

const QUICK_REPLIES = ['En camino', 'Revisando tablero', 'Solucionado'];

export function WhatsAppAlertsPanel({
  messages,
  onSendReply,
  facilityName,
}: WhatsAppAlertsPanelProps) {
  const [draft, setDraft] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSendReply(draft);
    setDraft('');
  };

  return (
    <aside
      aria-label="Alertas Mantenimiento por WhatsApp"
      className="flex h-[540px] lg:h-[calc(100vh-148px)] lg:min-h-[580px] lg:max-h-[780px] lg:sticky lg:top-20 flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-[#0B141A]"
    >
      {/* WhatsApp group header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-[#202C33] px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00A884] text-[#0B141A]">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-sm font-semibold text-slate-50 truncate">
              Alertas Mantenimiento
            </h2>
            <p className="text-xs text-slate-300/80 truncate">
              {facilityName} · Guardia, Jefe Mant., DubIoT Bot
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable chat feed */}
      <div
        ref={scrollContainerRef}
        className="wa-chat-bg chat-scroll flex-1 space-y-3 overflow-y-auto px-3.5 py-4"
      >
        <div className="flex justify-center">
          <span className="rounded-md bg-[#182229] px-2.5 py-1 text-[11px] font-medium text-slate-300/90 border border-white/[0.04]">
            Hoy
          </span>
        </div>

        {messages.map((msg) => {
          const isOperator = msg.sender === 'Guardia Mantenimiento';

          const senderColor =
            msg.severity === 'critical'
              ? 'text-red-400'
              : msg.severity === 'warning'
                ? 'text-amber-400'
                : msg.severity === 'resolved'
                  ? 'text-emerald-400'
                  : 'text-[#53BDEB]';

          return (
            <div
              key={msg.id}
              className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-lg px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                  isOperator
                    ? 'bg-[#005C4B] text-slate-50 rounded-tr-none'
                    : 'bg-[#202C33] text-slate-100 rounded-tl-none border border-white/[0.04]'
                }`}
              >
                {!isOperator && (
                  <p className={`mb-0.5 text-[11px] font-semibold ${senderColor}`}>
                    {msg.sender}
                  </p>
                )}

                <p className="break-words text-slate-100">{msg.text}</p>

                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-300/75 font-mono tabular-nums">
                  <span>{msg.timestamp}</span>
                  {isOperator && <CheckCheck className="h-3.5 w-3.5 text-[#53BDEB]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick replies + message composer */}
      <div className="border-t border-white/[0.08] bg-[#202C33] p-2.5 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onSendReply(reply)}
              className="min-h-[32px] rounded-md border border-white/10 bg-[#111B21] px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:bg-[#2A3942] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {reply}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Responder al grupo de mantenimiento..."
            aria-label="Escribir mensaje en Alertas Mantenimiento"
            className="min-h-[42px] flex-1 rounded-lg bg-[#2A3942] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Enviar mensaje"
            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-[#00A884] text-[#0B141A] transition-colors hover:bg-[#06CF9C] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
