import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface SiteQrCodeProps {
  value: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  className?: string;
  includeControls?: boolean;
  downloadFilename?: string;
}

export const SiteQrCode: React.FC<SiteQrCodeProps> = ({
  value,
  size = 200,
  darkColor = '#000000',
  lightColor = '#ffffff',
  className = '',
  includeControls = false,
  downloadFilename = 'zape-site-plaque-qr'
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      width: Math.max(size * 2, 400), // High resolution for crystal clear mobile camera scanning
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'H' // High 30% redundancy for rugged outdoor construction hoards
    })
      .then(url => {
        setDataUrl(url);
        setError(false);
      })
      .catch(err => {
        console.error('QR Generation failed:', err);
        setError(true);
      });
  }, [value, size, darkColor, lightColor]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${downloadFilename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="flex items-center justify-center bg-neutral-800 text-red-400 text-xs font-mono p-2 text-center rounded-lg border border-neutral-700"
      >
        QR Render Error
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-neutral-800 animate-pulse rounded-lg border border-neutral-700 flex items-center justify-center text-neutral-500 text-xs font-mono" 
      >
        <QrIcon className="w-6 h-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <img 
        src={dataUrl} 
        alt={`Official QR verification code encoding ${value}`} 
        style={{ width: size, height: size }}
        className={`rounded-lg shadow-sm border border-neutral-300/40 bg-white ${className}`} 
      />

      {includeControls && (
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={handleDownload}
            type="button"
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono rounded flex items-center gap-1 transition-colors border border-neutral-700"
            title="Download High-Res 400x400 PNG for printing"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopy}
            type="button"
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono rounded flex items-center gap-1 transition-colors border border-neutral-700"
            title="Copy encoded passport verification string"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-400" />
                <span>Copy Payload</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
