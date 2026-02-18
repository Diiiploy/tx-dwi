
import React, { useRef, useState, useEffect } from 'react';
import { IconRefreshCw, IconCheckCircle, IconEdit, IconFileText } from './icons';

interface SignaturePadProps {
    onSave: (signatureUrl: string) => void;
    label?: string;
    studentName?: string;
    language: 'en' | 'es';
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, label, studentName = "", language }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<'draw' | 'type'>('draw');
    const [typedName, setTypedName] = useState(studentName);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [auditInfo, setAuditInfo] = useState({ date: '', ip: '73.115.220.***' });

    const t = {
        en: {
            eSignature: "e-signature",
            draw: "Draw",
            type: "Type",
            signHere: "Sign Here",
            clear: "Clear",
            confirm: "Confirm Signature",
            locked: "Signature Captured",
            typePlaceholder: "Type your name...",
            signedBy: "e-signed by {name} on {date} from IP {ip}",
            certificate: "Certificate"
        },
        es: {
            eSignature: "firma-electrónica",
            draw: "Dibujar",
            type: "Escribir",
            signHere: "Firme Aquí",
            clear: "Limpiar",
            confirm: "Confirmar Firma",
            locked: "Firma Capturada",
            typePlaceholder: "Escriba su nombre...",
            signedBy: "firmado electrónicamente por {name} el {date} desde IP {ip}",
            certificate: "Certificado"
        }
    }[language];

    useEffect(() => {
        // Set actual current date/time for audit trail
        const now = new Date();
        const formattedDate = now.toLocaleString(undefined, { 
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
        setAuditInfo(prev => ({ ...prev, date: formattedDate }));

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.strokeStyle = '#2563eb'; // Use a slightly more "ink" looking blue
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [mode]); // Re-initialize when switching modes

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (isLocked || mode !== 'draw') return;
        setIsDrawing(true);
        setHasSigned(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || isLocked || mode !== 'draw') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
        setIsLocked(false);
        if (mode === 'type') setTypedName('');
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        if (mode === 'type' && typedName.trim()) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // We need to account for DPR here since font size is in logical pixels
                const dpr = window.devicePixelRatio || 1;
                ctx.font = `bold 48px "Dancing Script", cursive`;
                ctx.fillStyle = "#2563eb";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(typedName, canvas.width / (2 * dpr), canvas.height / (2 * dpr));
                setHasSigned(true);
            }
        }

        if (hasSigned || (mode === 'type' && typedName.trim())) {
            const signatureUrl = canvas.toDataURL('image/png');
            setIsLocked(true);
            onSave(signatureUrl);
        }
    };

    return (
        <div className="space-y-4 font-sans max-w-xl mx-auto">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.eSignature}</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        type="button"
                        onClick={() => { if (!isLocked) setMode('draw'); }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'draw' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        disabled={isLocked}
                    >
                        {t.draw}
                    </button>
                    <button 
                        type="button"
                        onClick={() => { if (!isLocked) setMode('type'); }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'type' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        disabled={isLocked}
                    >
                        {t.type}
                    </button>
                </div>
            </div>

            <div className={`relative border-2 transition-all duration-300 ${isLocked ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                {mode === 'type' && !isLocked ? (
                    <div className="h-32 flex items-center justify-center p-4">
                        <input 
                            type="text" 
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            placeholder={t.typePlaceholder}
                            className="w-full bg-transparent text-center text-4xl font-signature text-blue-600 focus:outline-none placeholder-gray-300"
                            autoFocus
                        />
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className={`w-full h-32 cursor-crosshair touch-none ${isLocked ? 'pointer-events-none' : ''}`}
                    />
                )}

                {/* Audit Footer (matches screenshot) */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/80 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 italic">
                    <span>
                        {t.signedBy
                            .replace('{name}', (isLocked && mode === 'type' ? typedName : studentName).toLowerCase())
                            .replace('{date}', auditInfo.date)
                            .replace('{ip}', auditInfo.ip)}
                    </span>
                    <span className="text-blue-500 not-italic font-medium">- {t.certificate}</span>
                </div>

                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-50/40 backdrop-blur-[1px] pointer-events-none">
                         <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg scale-110 animate-fade-in">
                            <IconCheckCircle className="w-4 h-4" />
                            {t.locked}
                         </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-2">
                {!isLocked && (
                    <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                    >
                        <IconRefreshCw className="w-3.5 h-3.5" />
                        {t.clear}
                    </button>
                )}
                
                {!isLocked && (
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={mode === 'draw' ? !hasSigned : !typedName.trim()}
                        className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all flex items-center gap-2"
                    >
                        <IconEdit className="w-4 h-4" />
                        {t.confirm}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SignaturePad;
