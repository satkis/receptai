// Comprehensive ingredient icon mapping for Lithuanian ingredients

export interface IngredientIconMap {
  [key: string]: string;
}

// Main ingredient icon mapping
export const ingredientIcons: IngredientIconMap = {
  // Vegetables (Daržovės)
  'bulvės': '🥔',
  'bulvė': '🥔',
  'morka': '🥕',
  'morkos': '🥕',
  'svogūnas': '🧅',
  'svogūnai': '🧅',
  'česnakas': '🧄',
  'pomidoras': '🍅',
  'pomidorai': '🍅',
  'agurkas': '🥒',
  'agurkai': '🥒',
  'kopūstas': '🥬',
  'kopūstai': '🥬',
  'paprika': '🌶️',
  'paprikos': '🌶️',
  'burokėlis': '🟣',
  'burokėliai': '🟣',
  'ridikėlis': '🔴',
  'salotų lapai': '🥬',
  'salotos': '🥬',
  'petražolės': '🌿',
  'krapai': '🌿',
  'bazilikas': '🌿',
  'rūgštynės': '🌿',

  // Meat (Mėsa)
  'vištiena': '🐔',
  'kiauliena': '🐷',
  'jautiena': '🐄',
  'veršiena': '🐄',
  'dešra': '🌭',
  'dešros': '🌭',
  'šonkauliukai': '🥩',
  'mėsa': '🥩',
  'kumpio': '🥓',
  'kumpis': '🥓',
  'lašiniai': '🥓',

  // Fish (Žuvis)
  'žuvis': '🐟',
  'lašiša': '🐟',
  'silkė': '🐟',
  'menkė': '🐟',
  'lydeka': '🐟',

  // Dairy (Pieno produktai)
  'pienas': '🥛',
  'grietinė': '🥛',
  'grietinėlė': '🥛',
  'varškė': '🧀',
  'sūris': '🧀',
  'svietas': '🧈',
  'sviestas': '🧈',
  'jogurtas': '🥛',
  'kefyras': '🥛',

  // Eggs (Kiaušiniai)
  'kiaušinis': '🥚',
  'kiaušiniai': '🥚',
  'kiaušinio': '🥚',

  // Grains & Cereals (Grūdai)
  'miltai': '🌾',
  'kvietiniai miltai': '🌾',
  'rugių miltai': '🌾',
  'grikiai': '🌾',
  'ryžiai': '🍚',
  'avižos': '🌾',
  'miežiai': '🌾',
  'kruopos': '🌾',
  'duona': '🍞',
  'duonos': '🍞',

  // Legumes (Ankštiniai)
  'pupelės': '🫘',
  'žirniai': '🟢',
  'lęšiai': '🟤',
  'soja': '🫘',

  // Fruits (Vaisiai)
  'obuolys': '🍎',
  'obuoliai': '🍎',
  'kriaušė': '🍐',
  'kriaušės': '🍐',
  'braškės': '🍓',
  'mėlynės': '🫐',
  'spanguolės': '🔴',
  'citrina': '🍋',
  'citrinos': '🍋',
  'apelsinas': '🍊',
  'apelsinai': '🍊',
  'bananas': '🍌',
  'bananai': '🍌',

  // Nuts & Seeds (Riešutai ir sėklos)
  'riešutai': '🥜',
  'lazdyno riešutai': '🌰',
  'graikiniai riešutai': '🥜',
  'migdolai': '🥜',
  'saulėgrąžų sėklos': '🌻',
  'sezamo sėklos': '🌰',

  // Spices & Herbs (Prieskoniai)
  'druska': '🧂',
  'cukrus': '🍯',
  'medus': '🍯',
  'pipirai': '⚫',
  'kmynai': '🌿',
  'cinamonas': '🟤',
  'vanilė': '🟤',
  'imbiero': '🫚',
  'imbiras': '🫚',

  // Oils & Fats (Aliejai)
  'aliejus': '🫒',
  'saulėgrąžų aliejus': '🌻',
  'alyvuogių aliejus': '🫒',
  'rapsų aliejus': '🌻',

  // Beverages (Gėrimai)
  'vanduo': '💧',
  'sultys': '🧃',
  'vynas': '🍷',
  'alus': '🍺',
  'arbata': '🍵',
  'kava': '☕',

  // Pasta & Noodles (Makaronai)
  'makaronai': '🍝',
  'spagečiai': '🍝',
  'vermišeliai': '🍜',

  // Mushrooms (Grybai)
  'grybai': '🍄',
  'baravykai': '🍄',
  'voveraitės': '🍄',

  // Berries (Uogos)
  'uogos': '🫐',
  'aviečių': '🍓',
  'aviečės': '🍓',
  'serbentai': '🔴',

  // Condiments (Padažai)
  'majonezo': '🥄',
  'majonezas': '🥄',
  'garstyčios': '🟡',
  'kečupas': '🍅',
  'actas': '🍶',

  // Baking (Kepimo produktai)
  'mielės': '🟤',
  'kepimo milteliai': '🟤',
  'soda': '🟤',
};

// Category-based fallback icons
export const categoryIcons: IngredientIconMap = {
  // Common food categories
  'mėsa': '🥩',
  'žuvis': '🐟',
  'daržovė': '🥬',
  'vaisius': '🍎',
  'pieno': '🥛',
  'grūdai': '🌾',
  'prieskoniai': '🌿',
  'aliejus': '🫒',
  'riešutai': '🥜',
  'uogos': '🫐',
  'grybai': '🍄',
};

// List of common Lithuanian suffixes to remove (heuristically)
const LT_SUFFIXES = [
  'ių', 'iui', 'iais', 'ėmis', 'ėse', 'ėms',
  'os', 'oms', 'omis', 'ose',
  'es', 'ei', 'e', 'ę', 'ė',
  'ų', 'ui', 'us', 'u', 'o', 'ą', 'a',
  'is', 'ys', 'ių', 'iųjų', 'iam', 'iai',
];

function removeSuffix(word: string): string {
  for (const suffix of LT_SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

// Function to get ingredient icon
export function getIngredientIcon(ingredientName: string): string {
  if (!ingredientName) return '🥄'; // Default utensil icon

  // Convert to lowercase and remove extra spaces
  const cleanName = ingredientName.toLowerCase().trim();

  // Direct match
  if (ingredientIcons[cleanName]) {
    return ingredientIcons[cleanName];
  }

  // Partial match - check if ingredient name contains any key
  for (const [key, icon] of Object.entries(ingredientIcons)) {
    if (cleanName.includes(key)) {
      return icon;
    }
  }

  // Try after suffix removal
  const root = removeSuffix(cleanName);
  for (const [key, icon] of Object.entries(ingredientIcons)) {
    if (root === key || key.includes(root) || root.includes(key)) {
      return icon;
    }
  }

  // Category-based fallback
  for (const [category, icon] of Object.entries(categoryIcons)) {
    if (cleanName.includes(category)) {
      return icon;
    }
  }

  // Smart categorization based on common patterns
  if (cleanName.includes('mėsa') || cleanName.includes('kiauliena') || cleanName.includes('vištiena')) {
    return '🥩';
  }

  if (cleanName.includes('žuv') || cleanName.includes('lašiš') || cleanName.includes('silkė')) {
    return '🐟';
  }

  if (cleanName.includes('pien') || cleanName.includes('grietin') || cleanName.includes('sūr')) {
    return '🥛';
  }

  if (cleanName.includes('milt') || cleanName.includes('duon') || cleanName.includes('kruop')) {
    return '🌾';
  }

  if (cleanName.includes('daržov') || cleanName.includes('salot') || cleanName.includes('kopūst')) {
    return '🥬';
  }

  if (cleanName.includes('vais') || cleanName.includes('obuol') || cleanName.includes('kriaušė')) {
    return '🍎';
  }

  // Default fallback
  return '🥄';
}

// Function to get ingredient icon with multilingual support
export function getMultilingualIngredientIcon(ingredient: any): string {
  if (typeof ingredient === 'string') {
    return getIngredientIcon(ingredient);
  }
  
  if (ingredient?.name) {
    // Try Lithuanian first, then English, then any string value
    const ltName = ingredient.name.lt || ingredient.name.en || ingredient.name;
    return getIngredientIcon(ltName);
  }
  
  return '🥄'; // Default fallback
}
