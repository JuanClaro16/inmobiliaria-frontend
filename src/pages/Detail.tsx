import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProperty, imageUrl } from '../lib/api';
import type { Property } from '../types';

export default function Detail() {
    const { id } = useParams();
    const [p, setP] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setErr(null);
        getProperty(id)
            .then(setP)
            .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Error'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="panel" style={{ maxWidth: 1100, margin: '24px auto' }}>Cargando…</div>;
    }
    if (err) {
        return (
            <div className="panel" style={{ maxWidth: 1100, margin: '24px auto', color: 'tomato' }}>
                Error: {err}
            </div>
        );
    }
    if (!p) return null;

    const first = imageUrl(p.images?.[0]?.url ?? p.images?.[0]?.path ?? undefined);

    const price =
        p.consignation_type === 'rent'
            ? p.rent_price != null
                ? `Precio $${p.rent_price.toLocaleString()}`
                : ''
            : p.sale_price != null
                ? `Precio $${p.sale_price.toLocaleString()}`
                : '';

    return (
        <div className="detail">
            <div style={{ maxWidth: 1100, margin: '16px auto 0' }}>
                <Link to="/" className="btn back">{'← Volver'}</Link>
            </div>

            {/* Imagen grande, centrada y proporcional */}
            <div className="detail__hero">
                {first ? (
                    <img className="detail__img" src={first} alt={p.city} />
                ) : (
                    <div className="detail__img" />
                )}
            </div>

            {/* Panel resumen */}
            <section className="detail__summary">
                <h1 className="detail__title">{p.city}</h1>

                <div className="detail__grid">
                    {/* Métricas */}
                    <div className="detail__stats card">
                        <div className="stat">
                            <span>Habitaciones</span>
                            <strong>{p.rooms}</strong>
                        </div>
                        <div className="stat">
                            <span>Baños</span>
                            <strong>{p.bathrooms}</strong>
                        </div>
                        <div className="stat">
                            <span>Tipo</span>
                            <strong>{p.consignation_type === 'rent' ? 'Arriendo' : 'Venta'}</strong>
                        </div>
                    </div>

                    {/* Precio destacado */}
                    <div className="detail__price card">
                        <div className="price-lg">{price || '—'}</div>
                        <div className="chips" style={{ marginTop: 8 }}>
                            <span className="chip tone">{p.consignation_type === 'rent' ? 'Arriendo' : 'Venta'}</span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="detail__features card">
                        <div className="featline">
                            <span className="featlabel">Piscina:</span>
                            <span className="chip">{p.has_pool ? 'Sí' : 'No'}</span>
                        </div>
                        <div className="featline">
                            <span className="featlabel">Ascensor:</span>
                            <span className="chip">{p.has_elevator ? 'Sí' : 'No'}</span>
                        </div>
                        <div className="featline">
                            <span className="featlabel">Parqueadero:</span>
                            <span className="chip">{p.parking_type || '—'}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
