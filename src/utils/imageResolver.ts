// Centralized food image resolver mapping menu items to finalized WebP folder assets.

const CATEGORY_MAP: Record<string, string> = {
  'chicken': 'Chicken',
  'beef': 'Beef',
  'pasta': 'Pasta',
  'pork': 'Pork',
  'seafood': 'Seafood',
  'vegetables': 'Veggies',
  'salad': 'Salad',
  'VEGGIES': 'Veggies',
  'SALAD': 'Salad',
  'CHICKEN': 'Chicken',
  'BEEF': 'Beef',
  'PORK': 'Pork',
  'SEAFOOD': 'Seafood',
  'PASTA': 'Pasta',
};

// Item name to uppercase filename mapping
const ITEM_TO_FILE: Record<string, string> = {
  // Veggies
  'CHOPSUEY SPECIAL': 'CHOPSUEY',
  'HOTOTAY': 'HOTOTAY',
  'LUMPIANG UBOD': 'UBOD',
  '7 KINDS': '7KINDS',
  'LAING': 'LAING',
  'AMPALAYA CON (BEEF) KARNE': 'AMPALAYA',
  'BAGNET PINAKBET': 'PINAKBET',
  'TALONG W/ BAGOONG W/ BAGNET PORK': 'TALONG',

  // Salad
  'POTATO SALAD': 'POTATO',
  'ENSALADANG TALONG': 'ENSALADA',
  'GARDEN SALAD': 'GARDEN',
  'CUCUMBER EGG SALAD': 'CUCUMBER',
  'KANI CRAB SALAD': 'KANI',

  // Chicken (lowercase filenames!)
  'CORDON BLEU': 'cordon',
  'FLAVORED WINGS': 'wings',
  'KOREAN CHICKEN': 'korean',
  'CHICKEN AFRITADA': 'afritada',
  'CHICKEN PASTEL': 'pastel',
  'CHICKEN CURRY': 'curry',
  'CALDERETANG MANOK': 'caldereta',
  'CHICKEN IN BBQ SAUCE': 'bbq',
  'CHICKEN ADOBO': 'adobo',
  'FRIED CHICKEN': 'fried',
  'CHICKEN INASAL ASSTD PARTS': 'inasal',
  'CHICKEN FILLET': 'fillet',
  'PININYAHANG MANOK': 'pineapple',
  'ATAY BALUNAN ASADO': 'asado',
  'CHICKEN SATE BREAST PART': 'satay',
  'CHICKEN TERIYAKI': 'teriyaki',

  // Pork
  'PORK SHANGHAI': 'SHANGHAI',
  'PORK BELLY IN BLUEBERRY SAUCE': 'BLUEBERRY',
  'PORK PICADILLO': 'PICADILLO',
  'PORK HAMONADO': 'HAMONADO',
  'MENUDO': 'MENUDO',
  'BICOL EXPRESS': 'BICOL',
  'SWEET & SOUR': 'SWEETSOUR',
  'TONKATSU': 'TONKATSU',
  'LECHON KAWALI': 'KAWALI',
  'PORK SISIG': 'SISIG',
  'BOPIS SPECIAL': 'BOPIS',
  'PORK AND TOFU': 'PORKTOFU',
  'PORK REBOSADO': 'REBOSADO',
  'LECHON PAKSIW': 'PAKSIW',
  'PORK SALPICAO': 'SISIG',
  'CALDERETA': 'CALDERETA',
  'CRISPY KARE KARE': 'KAREKARE',
  'KULAO': 'KULAO',
  'PORK HUMBA': 'HUMBA',
  'PORK BARBEQUE': 'BARBEQUE',

  // Beef
  'BEEF STROGANOFF': 'STROGANOFF',
  'MORCON': 'MORCON',
  'TAPA': 'TAPA',
  'BEEF W/ BROCCOLI': 'BROCCOLI',
  'KARE KARE': 'KAREKARE',
  'ROAST BEEF': 'ROAST',
  'BEEF STEAK': 'BISTEAK',
  'BURGER STEAK': 'BURGER',

  // Seafood
  'SEAFOOD BOIL IN CAJUN SAUCE': 'BOIL',
  'SHRIMP IN GARLIC AND BUTTER': 'SHRIMP',
  'STUFFED SQUID (GRILL)': 'SQUID',
  'FISH AND CHIPS': 'FISH',
  'STEAMED POMPANO': 'POMPANO',
  'TUNA KILAWIN': 'KILAWIN',

  // Pasta
  'BIHON': 'BIHON',
  'CANTON': 'CANTON',
  'SOTANGHON': 'SOTANGHON',
  'MIKI BIHON': 'MIKI',
  'BIHON / CANTON': 'BIHONCANTON',
  'MALABON': 'MALABON',
  'SPAGHETTI W/ MEATBALLS': 'SPAGHETTI',
  'CARBONARA': 'CARBONARA',
  'ALFREDO': 'ALFREDO',
  'BAKED MAC': 'BAKEDMAC',
  'LASAGNA': 'LASAGNA',
  'PASTA BOLOGNESE': 'BOLOGNESE',
  'TUNA PASTA': 'TUNA',
};

export const getFoodImage = (category: string, itemName: string): string => {
  if (!category || !itemName) return '/placeholder-food.webp';

  const folder = CATEGORY_MAP[category] || CATEGORY_MAP[category.toLowerCase()] || category;
  
  // Try exact lookup from normalized ITEM_TO_FILE mapping
  const trimmedUpperItem = itemName.trim().toUpperCase();
  const fileKey = ITEM_TO_FILE[trimmedUpperItem];
  
  if (fileKey) {
    return `/Mamshies-Food-Assets/${folder}/${fileKey}.webp`;
  }

  // Fallback: strip spaces and punctuation, convert based on category
  const normalized = itemName
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');

  const finalName = folder === 'Chicken' ? normalized.toLowerCase() : normalized.toUpperCase();
  return `/Mamshies-Food-Assets/${folder}/${finalName}.webp`;
};
