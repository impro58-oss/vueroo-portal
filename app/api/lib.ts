// Shared fetch utility for vueroo-portal API routes
// Handles NaN sanitization from Python float('nan') in JSON

const VUEROO_DATA = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function fetchJSON(url: string): Promise<any> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    // Replace NaN with null (Python writes NaN which is invalid JSON)
    const cleaned = text.replace(/\bNaN\b/g, 'null');
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export { VUEROO_DATA };