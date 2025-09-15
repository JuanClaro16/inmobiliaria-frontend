import { useEffect, useRef, useState } from 'react';
import type { Property } from '../types';
import { createProperty, updateProperty } from '../lib/api';

type ParkingType = 'privado' | 'comunal' | 'dos' | '';

type Props = {
  /** Si viene, el formulario actúa en modo edición */
  initial?: Property;
  /** Callback al guardar OK (crear o actualizar) */
  onSuccess: (p: Property) => void;
  /** Cerrar modal */
  onCancel: () => void;
};

export default function CreatePropertyForm({ initial, onSuccess, onCancel }: Props) {
  // Campos
  const [city, setCity] = useState<string>(initial?.city ?? '');
  const [mode, setMode] = useState<'rent' | 'sale'>(initial?.consignation_type ?? 'rent');

  const [rooms, setRooms] = useState<number>(initial?.rooms ?? 1);
  const [bathrooms, setBathrooms] = useState<number>(initial?.bathrooms ?? 1);

  const [rent, setRent] = useState<number>(initial?.rent_price ?? 0);
  const [sale, setSale] = useState<number>(initial?.sale_price ?? 0);

  const [hasPool, setHasPool] = useState<boolean>(!!initial?.has_pool);
  const [hasElevator, setHasElevator] = useState<boolean>(!!initial?.has_elevator);
  const [parking, setParking] = useState<ParkingType>((initial?.parking_type as ParkingType) ?? '');

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    // por si cambias la prop initial sobre la marcha
    if (initial) {
      setCity(initial.city);
      setMode(initial.consignation_type);
      setRooms(initial.rooms);
      setBathrooms(initial.bathrooms);
      setRent(initial.rent_price ?? 0);
      setSale(initial.sale_price ?? 0);
      setHasPool(!!initial.has_pool);
      setHasElevator(!!initial.has_elevator);
      setParking((initial.parking_type as ParkingType) ?? '');
    }
  }, [initial]);

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.set('city', city);
    fd.set('rooms', String(rooms));
    fd.set('bathrooms', String(bathrooms));
    fd.set('consignation_type', mode);
    fd.set('rent_price', String(rent));
    fd.set('sale_price', String(sale));
    fd.set('has_pool', String(hasPool));
    fd.set('has_elevator', String(hasElevator));
    if (parking) fd.set('parking_type', parking);

    // Imagen principal (opcional)
    if (fileRef.current?.files && fileRef.current.files.length > 0) {
      // el backend espera un array 'images[]' o un 'images' simple, ajusta según tu controlador
      fd.append('images[]', fileRef.current.files[0]);
      fd.append('images_alt[]', `Imagen inmueble ${city}`);
    }
    return fd;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      alert('La ciudad es obligatoria');
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData();
      let saved: Property;
      if (isEdit && initial?.id) {
        saved = await updateProperty(initial.id, fd);
      } else {
        saved = await createProperty(fd);
      }
      onSuccess(saved);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error guardando el inmueble';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <div className="form-row">
        <label>Ciudad</label>
        <input
          className="input"
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Modo</label>
          <select className="select" value={mode} onChange={(e) => setMode(e.target.value as 'rent' | 'sale')}>
            <option value="rent">Arriendo</option>
            <option value="sale">Venta</option>
          </select>
        </div>
        <div>
          <label>Parqueadero</label>
          <select
            className="select"
            value={parking}
            onChange={(e) => setParking(e.target.value as ParkingType)}
          >
            <option value="">(ninguno)</option>
            <option value="privado">privado</option>
            <option value="comunal">comunal</option>
            <option value="dos">dos</option>
          </select>
        </div>
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Habitaciones</label>
          <input
            className="input"
            type="number"
            min={1}
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Baños</label>
          <input
            className="input"
            type="number"
            min={1}
            value={bathrooms}
            onChange={(e) => setBathrooms(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Precio (arriendo)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Precio (venta)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={sale}
            onChange={(e) => setSale(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-row" style={{ display: 'flex', gap: 16 }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={hasPool} onChange={() => setHasPool((v) => !v)} /> Piscina
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={hasElevator} onChange={() => setHasElevator((v) => !v)} /> Ascensor
        </label>
      </div>

      <div className="form-row">
        <label>Imagen principal</label>
        <input ref={fileRef} className="input" type="file" accept="image/*" />
      </div>

      <div className="form-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" className="button ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="button" disabled={submitting}>
          {isEdit ? 'Guardar cambios' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
