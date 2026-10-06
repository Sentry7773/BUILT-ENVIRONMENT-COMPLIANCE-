import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  X, 
  Lock, 
  Unlock, 
  Smartphone, 
  RefreshCw,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { Architect, BiometricSessionState } from '../types';
import { rsaSignatureService, ARCHITECT_RSA4096_PUBLIC_KEY } from '../services/rsaSignatureService';

interface BiometricAuthModalProps {
  architect: Architect;
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (session: BiometricSessionState) => void;
  requiredForAction?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  architect,
  isOpen,
  onClose,
  onAuthenticated,
  requiredForAction
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'FIDO2_HARDWARE' | 'FINGERPRINT' | 'FACIAL_RECOGNITION'>('FIDO2_HARDWARE');
  const [authStep, setAuthStep] = useState<'prompt' | 'scanning' | 'deriving_rsa' | 'success'>('prompt');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [pinCode, setPinCode] = useState<string>('719042');

  useEffect(() => {
    if (isOpen) {
      setAuthStep('prompt');
      setScanProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartHandshake = () => {
    setAuthStep('scanning');
    setScanProgress(15);

    // Simulate progressive biometric hardware scanning & RSA key derivation
    const t1 = setTimeout(() => {
      setScanProgress(55);
      setAuthStep('deriving_rsa');
    }, 900);

    const t2 = setTimeout(() => {
      setScanProgress(100);
      setAuthStep('success');
      
      const newSession = rsaSignatureService.authenticateBiometric(selectedMethod, architect.nrcNumber);

      setTimeout(() => {
        onAuthenticated(newSession);
        onClose();
      }, 1000);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/90 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Biometric Identity Verification
              </h3>
              <p className="text-[10px] text-neutral-400">
                FIDO2 / RSA-4096 Secure Hardware Enclave Login
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
          >
            ✕
          </button>
        </div>

        {/* Action Notice if required for signing */}
        {requiredForAction && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 px-6 py-2.5 text-xs text-amber-200 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Authentication required to sign <strong>{requiredForAction}</strong>.
            </span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {authStep === 'prompt' && (
            <div className="space-y-4">
              {/* Architect Persona Summary */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Registered Signatory</span>
                  <strong className="text-white text-xs block mt-0.5">{architect.name}</strong>
                  <span className="text-[11px] text-emerald-400 font-mono">ZIA #{architect.ziaNumber} · NRC #{architect.nrcNumber}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">
                  ZIA
                </div>
              </div>

              {/* Biometric Factor Selection */}
              <div>
                <label className="text-[11px] text-neutral-400 font-mono block mb-2">
                  Select Biometric Hardware Token:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('FIDO2_HARDWARE')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'FIDO2_HARDWARE'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Key className="w-5 h-5" />
                    <span className="text-[10px] font-semibold leading-tight">YubiKey FIPS Token</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('FINGERPRINT')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'FINGERPRINT'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Fingerprint className="w-5 h-5" />
                    <span className="text-[10px] font-semibold leading-tight">Touch ID / TPM Enclave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('FACIAL_RECOGNITION')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'FACIAL_RECOGNITION'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Cpu className="w-5 h-5" />
                    <span className="text-[10px] font-semibold leading-tight">NRC 3D Face Match</span>
                  </button>
                </div>
              </div>

              {/* Hardware Security Specs Box */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-400 space-y-1">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Enclave Security:</span>
                  <span className="text-emerald-400 font-bold">FIPS 140-3 Level 3</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Key Modulus:</span>
                  <span className="text-white">RSA 4096-bit</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Target Enclave:</span>
                  <span className="text-neutral-400 truncate max-w-[180px]">{ARCHITECT_RSA4096_PUBLIC_KEY.hardwareEnclave}</span>
                </div>
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={handleStartHandshake}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/80 transition-all flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Initiate Biometric Verification &amp; Unlock Enclave</span>
              </button>
            </div>
          )}

          {(authStep === 'scanning' || authStep === 'deriving_rsa') && (
            <div className="text-center py-6 space-y-5">
              <div className="relative mx-auto w-28 h-28 rounded-full bg-emerald-950/40 border-2 border-emerald-500/80 flex items-center justify-center text-emerald-400 overflow-hidden shadow-xl shadow-emerald-500/20">
                <Fingerprint className="w-16 h-16 animate-pulse" />
                {/* Visual laser scan bar */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-lg shadow-emerald-400" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {authStep === 'scanning' ? 'Verifying Biometric Fingerprint...' : 'Deriving RSA-4096 Private Key...'}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  {authStep === 'scanning'
                    ? `Matching liveness challenge against NRC #${architect.nrcNumber}`
                    : 'Unlocking 4096-bit private key in memory enclave (PKCS#1 v1.5)'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <div className="text-[11px] font-mono text-emerald-400 animate-pulse">
                Handshake in progress · Hardware challenge 0x7e81... matched
              </div>
            </div>
          )}

          {authStep === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Enclave Unlocked Successfully</h4>
                <p className="text-xs text-emerald-400 mt-1 font-mono">
                  ✓ Biometric Identity Confirmed · Session Token Active
                </p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl text-left font-mono text-[11px] space-y-1 border border-neutral-800 text-neutral-300">
                <div>Signatory: <strong className="text-white">{architect.name}</strong></div>
                <div>Status: <span className="text-emerald-400 font-bold">RSA-4096 SIGNING READY</span></div>
                <div className="truncate text-neutral-500">Key Fingerprint: {ARCHITECT_RSA4096_PUBLIC_KEY.keyFingerprint}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
