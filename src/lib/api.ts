import type { Query, Property, Paginated } from '../types';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';



export function imageUrl(path: string | null | undefined): string {
    if (!path) return '/placeholder.jpg'; // imagen por defecto
    if (path.startsWith('http')) return path; // ya es URL absoluta
    return `${API_URL}/storage/${path}`;
}


export async function getProperties(
    query: Query
): Promise<Paginated<Property>> {
    const url = new URL(`${API_URL}/properties`);

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            // Para arrays (ej: rooms: [1,2,3])
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(`${key}[]`, String(v)));
            } else {
                url.searchParams.append(key, String(value));
            }
        }
    });

    const resp = await fetch(url.toString());
    if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status}`);
    }

    return resp.json();
}


export async function getProperty(id: string | number): Promise<Property> {
    const resp = await fetch(`${API_URL}/properties/${id}`);
    if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status}`);
    }
    return resp.json();
}



function stripHtml(s: string) {
    return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function getCities(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/properties/cities`, {
    credentials: 'omit',
  });
  if (!res.ok) throw new Error('No se pudo obtener el listado de ciudades');
  return await res.json() as string[];
}

export async function createProperty(fd: FormData) {
    const url = `${BASE}/api/properties`;
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            // NUNCA pongas 'Content-Type' con FormData; el navegador agrega el boundary.
            Accept: 'application/json',
        },
        body: fd,
    });

    const ct = res.headers.get('content-type') ?? '';

    if (!res.ok) {
        try {
            if (ct.includes('application/json')) {
                const data = await res.json();
                // Laravel suele mandar { message, errors }
                const msg =
                    data?.message ??
                    (data?.errors ? JSON.stringify(data.errors) : 'Error creando el inmueble');
                throw new Error(msg);
            } else {
                const text = await res.text().catch(() => '');
                throw new Error(`Error ${res.status} ${res.statusText} - ${stripHtml(text)}`);
            }
        } catch {
            // por si el json falla a mitad
            const textFallback = await res.text().catch(() => '');
            throw new Error(`Error ${res.status} ${res.statusText} - ${stripHtml(textFallback)}`);
        }
    }

    // OK
    if (ct.includes('application/json')) {
        return await res.json();
    } else {
        // por si el backend devuelve texto
        const txt = await res.text();
        try {
            return JSON.parse(txt);
        } catch {
            throw new Error('Respuesta inesperada del servidor (no JSON).');
        }
    }
}

export async function updateProperty(id: number, fd: FormData): Promise<Property> {
    const res = await fetch(`${BASE}/api/properties/${id}`, {
        method: 'POST', // para que FormData viaje bien
        headers: { 'X-HTTP-Method-Override': 'PUT' },
        body: fd,
        credentials: 'include', // si tu backend usa cookies/csrf; si no, quítalo
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Error actualizando el inmueble');
    }
    return (await res.json()) as Property;
}

/** Elimina una propiedad. */
export async function deleteProperty(id: number): Promise<void> {
    const res = await fetch(`${BASE}/api/properties/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Error eliminando el inmueble');
    }
}