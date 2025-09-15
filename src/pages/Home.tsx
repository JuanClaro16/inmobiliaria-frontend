import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProperties, imageUrl, getCities, deleteProperty } from '../lib/api';
import type { Paginated, Property, Query } from '../types';
import Modal from '../components/Modal';
import CreatePropertyForm from '../components/CreatePropertyForm';

type Mode = '' | 'rent' | 'sale';

export default function Home() {
    const [items, setItems] = useState<Property[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    /** filtros */
    const [cities, setCities] = useState<string[]>([]);
    const [city, setCity] = useState<string>('');
    const [mode, setMode] = useState<Mode>('');
    const [minP, setMinP] = useState<string>(''); // como string
    const [maxP, setMaxP] = useState<string>('');

    const [roomsSel, setRoomsSel] = useState<number[]>([]);
    const toggleRoom = (n: number) =>
        setRoomsSel((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

    const [feat, setFeat] = useState({
        pool: false,
        elevator: false,
        dos: false,
        comunal: false,
    });
    const toggleFeat = (k: keyof typeof feat) => setFeat((p) => ({ ...p, [k]: !p[k] }));

    const roomsCSV = useMemo(
        () => (roomsSel.length ? roomsSel.slice().sort((a, b) => a - b).join(',') : undefined),
        [roomsSel]
    );
    const featuresCSV = useMemo(() => {
        const list: Array<keyof typeof feat> = [];
        if (feat.pool) list.push('pool');
        if (feat.elevator) list.push('elevator');
        if (feat.dos) list.push('dos');
        if (feat.comunal) list.push('comunal');
        return list.length ? list.join(',') : undefined;
    }, [feat]);

    const buildQuery = (pg: number): Query => ({
        page: pg,
        city: city || undefined,
        mode: mode || undefined,
        min_price: minP ? Number(minP) : undefined,
        max_price: maxP ? Number(maxP) : undefined,
        rooms: roomsCSV,
        features: featuresCSV,
    });

    const fetchData = useCallback(
        (pg: number = page) => {
            setLoading(true);
            setErr(null);
            getProperties(buildQuery(pg))
                .then((res: Paginated<Property>) => {
                    setItems(res.data);
                    setPage(res.current_page);
                })
                .catch((e: unknown) => {
                    const msg = e instanceof Error ? e.message : 'Network Error';
                    setErr(msg);
                })
                .finally(() => setLoading(false));
        },
        [page, city, mode, minP, maxP, roomsCSV, featuresCSV]
    );

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    useEffect(() => {
        getCities().then(setCities).catch(() => { });
    }, []);

    const applyFilters = () => {
        setPage(1);
        fetchData(1);
    };

    const clearFilters = () => {
        setCity('');
        setMode('');
        setMinP('');
        setMaxP('');
        setRoomsSel([]);
        setFeat({ pool: false, elevator: false, dos: false, comunal: false });
        setPage(1);
        fetchData(1);
    };

    /** Crear / Editar modal */
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Property | null>(null);

    const handleCreated = () => {
        setOpenCreate(false);
        // refresca ciudades por si llega una nueva ciudad
        getCities().then(setCities).catch(() => { });
        fetchData(1);
    };

    const handleEdited = () => {
        setEditTarget(null);
        getCities().then(setCities).catch(() => { });
        fetchData(page);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro que desea eliminar este inmueble?')) return;
        try {
            await deleteProperty(id);
            fetchData(page);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error eliminando');
        }
    };

    return (
        <div className="container">
            <h1 className="h1">
                Inmobiliaria <span className="brand">PSA</span>
            </h1>

            {/* Panel filtros */}
            <div className="panel">
                <div className="filters" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                    <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
                        <option value="">Ciudad (todas)</option>
                        {cities.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <select className="select" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                        <option value="">Modo (todos)</option>
                        <option value="rent">Arriendo</option>
                        <option value="sale">Venta</option>
                    </select>

                    <input
                        className="input"
                        placeholder="Min $"
                        type="number"
                        value={minP}
                        onChange={(e) => setMinP(e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="Max $"
                        type="number"
                        value={maxP}
                        onChange={(e) => setMaxP(e.target.value)}
                    />

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ opacity: 0.75, fontSize: 12 }}>Habitaciones</span>
                        {[1, 2, 3, 4].map((n) => (
                            <button
                                key={n}
                                type="button"
                                className={`seg__btn ${roomsSel.includes(n) ? 'is-active' : ''}`}
                                onClick={() => toggleRoom(n)}
                            >
                                {n}
                            </button>
                        ))}

                        <span style={{ opacity: 0.75, fontSize: 12, marginLeft: 12 }}>Características</span>
                        {(['pool', 'elevator', 'dos', 'comunal'] as const).map((k) => (
                            <button
                                key={k}
                                type="button"
                                className={`chip chip--toggle ${feat[k] ? 'is-on' : ''}`}
                                onClick={() => toggleFeat(k)}
                            >
                                {k === 'pool' ? 'piscina' : k === 'elevator' ? 'ascensor' : k === 'dos' ? 'parq dos' : 'parq comunal'}
                            </button>
                        ))}
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                        <button className="button" onClick={applyFilters}>
                            Aplicar filtros
                        </button>
                        <button className="button ghost" onClick={clearFilters}>
                            Limpiar
                        </button>

                        <div style={{ flex: 1 }} />
                        <button className="button" onClick={() => setOpenCreate(true)}>
                            + Crear inmueble
                        </button>
                    </div>
                </div>
            </div>

            {loading && <div className="panel">Cargando…</div>}
            {err && (
                <div className="panel" style={{ color: 'tomato' }}>
                    Error: {err}
                </div>
            )}

            {/* Grid */}
            <div className="grid">
                {items.map((p) => {
                    const first = imageUrl(p.images?.[0]?.url ?? p.images?.[0]?.path ?? undefined);
                    const price =
                        p.consignation_type === 'rent'
                            ? p.rent_price != null
                                ? `Canon $${p.rent_price.toLocaleString()}`
                                : ''
                            : p.sale_price != null
                                ? `Precio $${p.sale_price.toLocaleString()}`
                                : '';

                    return (
                        <div key={p.id} className="card">
                            <Link to={`/propiedad/${p.id}`} className="card__imglink">
                                {first ? <img className="card__img" src={first} alt={p.city} /> : <div className="card__img" />}
                            </Link>
                            <div className="card__body">
                                <div className="card__title">{p.city}</div>
                                <p className="card__sub">
                                    {p.rooms} hab • {p.bathrooms} baños
                                </p>
                                <div className="chips">
                                    <span className="chip accent">{p.consignation_type === 'rent' ? 'Arriendo' : 'Venta'}</span>
                                    {p.has_pool && <span className="chip">Piscina</span>}
                                    {p.has_elevator && <span className="chip">Ascensor</span>}
                                    {p.parking_type && <span className="chip">Parqueadero: {p.parking_type}</span>}
                                </div>
                                <div className="price">{price}</div>

                                <div className="card__actions">
                                    <button className="icon-btn" title="Editar" onClick={() => setEditTarget(p)}>
                                        ✏️
                                    </button>
                                    <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(p.id)}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal crear */}
            <Modal open={openCreate} title="Crear inmueble" onClose={() => setOpenCreate(false)}>
                <CreatePropertyForm onCancel={() => setOpenCreate(false)} onSuccess={handleCreated} />
            </Modal>

            {/* Modal editar */}
            <Modal open={!!editTarget} title="Editar inmueble" onClose={() => setEditTarget(null)}>
                {editTarget && (
                    <CreatePropertyForm initial={editTarget} onCancel={() => setEditTarget(null)} onSuccess={handleEdited} />
                )}
            </Modal>
        </div>
    );
}
