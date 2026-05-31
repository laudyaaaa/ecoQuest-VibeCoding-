import { City, LevelInfo, HeroType } from './types';

export const INITIAL_CITIES: City[] = [
  { id: 'jkt', name: 'Jakarta', status: 'DANGER', completed: false, description: 'Ibukota dengan tantangan polusi udara dan sampah sungai.' },
  { id: 'sby', name: 'Surabaya', status: 'WARNING', completed: false, description: 'Kota pahlawan yang berjuang melawan suhu panas dan limbah industri.' },
  { id: 'bli', name: 'Bali', status: 'DANGER', completed: false, description: 'Pulau dewata yang pantainya terancam abrasi dan sampah plastik kiriman.' },
  { id: 'bdg', name: 'Bandung', status: 'WARNING', completed: false, description: 'Kota kembang yang menghadapi masalah alih fungsi lahan dan kemacetan.' },
  { id: 'mdn', name: 'Medan', status: 'DANGER', completed: false, description: 'Kota metropolitan Sumatera dengan isu deforestasi di sekitarnya.' },
];

export const LEVELS: LevelInfo[] = [
  { title: 'Pemula Hijau', minXp: 0 },
  { title: 'Pejuang Bumi', minXp: 1000 },
  { title: 'Guardian Nusantara', minXp: 2500 },
  { title: 'Pahlawan Bumi', minXp: 4500 },
  { title: 'Legenda Alam', minXp: 7000 },
];

export const HERO_TYPES: Record<HeroType, { name: string, icon: string, desc: string, focus: string }> = {
  SEA: { name: 'Penjaga Laut', icon: '🌊', desc: 'Ahli masalah sampah plastik & ekosistem lautan.', focus: 'laut, pantai, terumbu karang, sampah plastik air' },
  FOREST: { name: 'Penjaga Hutan', icon: '🌿', desc: 'Ahli reboisasi, flora fauna & keanekaragaman hayati.', focus: 'hutan, pohon, satwa liar, deforestasi, lahan gambut' },
  AIR: { name: 'Penjaga Udara', icon: '☀️', desc: 'Ahli polusi udara, emisi karbon & energi terbarukan.', focus: 'polusi udara, energi bersih, transportasi umum, emisi pabrik' }
};

export const BADGES = ['🌊', '🌿', '☀️', '♻️', '🐝', '🌺', '🦅'];
