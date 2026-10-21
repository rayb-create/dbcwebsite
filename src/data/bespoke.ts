export interface BespokeSilhouette {
  id: string;
  name: string;
  category: 'hoodies' | 'joggers' | 'tracksuits' | 'longsleeves' | 'tees' | 'outerwear';
  basePrice: number; // in DZD
  description: string;
  sketchUrl: string;
  image: string;
  cutDetails: string;
}

export interface BespokeFabric {
  id: string;
  name: string;
  mill: string;
  weight: string;
  color: string;
  hex: string;
  priceModifier: number; // in DZD
  description: string;
  textureUrl: string;
}

export interface BespokeHardware {
  id: string;
  name: string;
  addedPrice: number; // in DZD
  description: string;
  color: string;
  origin: string;
}

export const BESPOKE_SILHOUETTES: BespokeSilhouette[] = [
  {
    id: 'hoodie-420',
    name: 'Hoodie Oversize Lourd Molleton',
    category: 'hoodies',
    basePrice: 6500,
    description: 'Capuche double épaisseur, coupe droite tombante et poche kangourou renforcée.',
    sketchUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    cutDetails: 'Molleton brossé haute densité, bord-côte élasthanne aux poignets et à la taille.',
  },
  {
    id: 'jogger-heavy',
    name: 'Pantalon Jogger Molleton Coupe Relaxed',
    category: 'joggers',
    basePrice: 5800,
    description: 'Ceinture élastique avec cordon de serrage épais, poches zippées discrètes.',
    sketchUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    cutDetails: 'Poches profondes, coutures rabattues ultra solides et confortables.',
  },
  {
    id: 'tracksuit-full',
    name: 'Ensemble Complet Tracksuit Atelier DBC',
    category: 'tracksuits',
    basePrice: 11500,
    description: 'Ensemble coordonné hoodie + pantalon jogger assorti dans le même bain de teinture.',
    sketchUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    cutDetails: 'Coupe harmonisée, finition atelier DBC.',
  },
  {
    id: 'thermal-longsleeve',
    name: 'T-Shirt Manches Longues Thermal Waffle',
    category: 'longsleeves',
    basePrice: 4200,
    description: 'Maille gaufrée thermique offrant une isolation corporelle optimale.',
    sketchUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    cutDetails: 'Poignets resserrés, col rond doublé.',
  },
];

export const BESPOKE_FABRICS: BespokeFabric[] = [
  {
    id: 'fleece-black',
    name: 'Molleton Brossé Épais - Noir Profond',
    mill: 'Tricotage Haute Densité Algérie',
    weight: 'Heavyweight Fleece',
    color: 'Noir Intense',
    hex: '#18181B',
    priceModifier: 0,
    description: 'Coton peigné intérieur polaire ultra doux et chaud.',
    textureUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'fleece-grey',
    name: 'Molleton Coton Épais - Gris Chiné Vintage',
    mill: 'Tricotage Haute Précision Algérie',
    weight: 'Heavyweight Fleece',
    color: 'Gris Chiné',
    hex: '#71717A',
    priceModifier: 400,
    description: 'Mélange subtil de fils gris pour une texture streetwear raffinée.',
    textureUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'fleece-sand',
    name: 'Molleton Velours Chaud - Sable Désert',
    mill: 'Finition Sablée Artisanale',
    weight: 'Heavy Velvet Fleece',
    color: 'Sable Désert',
    hex: '#D7C4A5',
    priceModifier: 600,
    description: 'Toucher peau de pêche doux, teinte chaleureuse et lumineuse.',
    textureUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=400&q=80',
  },
];

export const BESPOKE_HARDWARE: BespokeHardware[] = [
  {
    id: 'metal-aglets',
    name: 'Embouts Métalliques Gravés & Oeillets Inox',
    addedPrice: 300,
    description: 'Cordon de capuche renforcé avec ferrets gravés DBC et finition mat.',
    color: 'Bronze & Noir Mat',
    origin: 'Atelier Algérie',
  },
  {
    id: 'tonal-drawstring',
    name: 'Cordons Tressés 100% Coton Ton sur Ton',
    addedPrice: 0,
    description: 'Cordon plat tressé assorti à la couleur du molleton.',
    color: 'Ton sur Ton',
    origin: 'Atelier Algérie',
  },
];
