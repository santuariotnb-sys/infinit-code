'use client';

import { useState } from 'react';

interface ClaudeCodeGuideProps {
  onClose: () => void;
  onRunCommand: (command: string) => void;
}

export function ClaudeCodeGuide({ onClose, onRunCommand }: ClaudeCodeGuideProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Abra o Terminal',
      description: 'Clique no botão "Terminal" na barra superior para iniciar seu ambiente.',
      action: null,
    },
    {
      title: 'Inicie o Claude Code',
      description: 'No terminal, digite o comando abaixo. O Claude Code já está pré-instalado no seu ambiente.',
      command: 'claude',
      action: () => onRunCommand('claude'),
    },
    {
      title: 'Autentique sua conta',
      description: 'O Claude Code vai abrir um link no browser para autenticar com sua conta claude.ai. Faça login e volte ao terminal.',
      action: null,
    },
    {
      title: 'Pronto!',
      description: 'O Claude Code está conectado com suas skills Infinit Code pré-carregadas. Comece a codar!',
      skills: ['supabase-agent', 'token-optimizer', 'ui-ux-pro-max', 'frontend-design'],
      action: null,
    },
  ];

  const current = steps[step];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'monospace',
    }}
    onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0b0f1e',
          border: '1px solid #1c2340',
          borderRadius: 12,
          width: 440,
          padding: '28px 32px',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24, color: '#00ff88' }}>∞</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#e8e8e8' }}>Claude Code Setup</span>
          </div>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', color: '#5A6080', fontSize: 18 }}
          >×</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= step ? '#00ff88' : '#1c2340',
                transition: 'background .3s',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11,
            color: '#5A6080',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6,
          }}>
            Passo {step + 1} de {steps.length}
          </div>
          <h3 style={{ fontSize: 16, color: '#e8e8e8', margin: '0 0 8px', fontWeight: 600 }}>
            {current.title}
          </h3>
          <p style={{ fontSize: 13, color: '#AEB6D8', lineHeight: 1.6, margin: 0 }}>
            {current.description}
          </p>

          {current.command && (
            <div style={{
              background: '#0a0a0a',
              border: '1px solid #1c2340',
              borderRadius: 6,
              padding: '10px 14px',
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <code style={{ color: '#00ff88', fontSize: 14 }}>$ {current.command}</code>
              {current.action && (
                <button
                  onClick={current.action}
                  style={{
                    background: '#00ff88',
                    color: '#000',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  Executar
                </button>
              )}
            </div>
          )}

          {current.skills && (
            <div style={{
              background: '#0f1428',
              border: '1px solid #1c2340',
              borderRadius: 6,
              padding: '12px 14px',
              marginTop: 12,
            }}>
              <div style={{ fontSize: 11, color: '#5A6080', marginBottom: 8 }}>Skills pré-carregadas:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {current.skills.map(skill => (
                  <span key={skill} style={{
                    background: 'rgba(91,108,249,.12)',
                    color: '#5B6CF9',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                  }}>
                    /{skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            style={{
              background: 'transparent',
              border: '1px solid #1c2340',
              borderRadius: 4,
              color: step === 0 ? '#1c2340' : '#AEB6D8',
              padding: '8px 16px',
              fontSize: 12,
              cursor: step === 0 ? 'default' : 'pointer',
              fontFamily: 'monospace',
            }}
          >
            ← Anterior
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                background: '#00ff88',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                background: '#00ff88',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              Começar a codar →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
