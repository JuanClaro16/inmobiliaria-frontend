import { useEffect } from 'react';

type ModalProps = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const onOverlay = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="modal__overlay"
            onMouseDown={onOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Dialog'}
        >
            <div className="modal__dialog">
                <div className="modal__header">
                    <h2 className="h2" style={{ margin: 0 }}>
                        {title ?? 'Dialog'}
                    </h2>
                    <button className="button ghost" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
                <div className="modal__body">{children}</div>
            </div>
        </div>
    );
}
