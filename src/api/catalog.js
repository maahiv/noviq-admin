import { dbDelete, dbGet, dbPut, firebaseConfigured } from './firebaseRest';
import { products as desiredProducts, categories as desiredCategories } from './seed';

const legacyCategoryIds = ['audio','mobile','wearables','computing','gaming','power','smart-home','cameras'];
const legacyProductNames = new Set([
  'PulsePods Air Pro','NovaSound Studio 45','OrbitWatch X2','AeroBook 14','VisionDock 27','HyperKey 75',
  'GameCore X Controller','ChargeFlex GaN 65W','VoltBank 20K','NestCam Mini 2K','SnapCam 4K Pocket','PixelOne 5G'
]);

function token(){return JSON.parse(localStorage.getItem('electrowave_admin_auth')||'{}').idToken}

function looksLikeLegacyCatalog(categories, products){
  const catIds = Object.keys(categories || {}).sort();
  const productList = Object.values(products || {});
  return catIds.length === legacyCategoryIds.length
    && legacyCategoryIds.every(id => catIds.includes(id))
    && productList.length === legacyProductNames.size
    && productList.every(p => legacyProductNames.has(p?.name));
}

async function seedDesiredCatalog(authToken){
  await Promise.all(desiredCategories.map(c => dbPut(`categories/${c.id}`, { name: c.name, emoji: c.emoji }, authToken)));
  await Promise.all(desiredProducts.map(product => {
    const { id, ...payload } = product;
    return dbPut(`products/${id}`, payload, authToken);
  }));
}

export async function ensureDesiredCatalog(){
  if(!firebaseConfigured()) return false;
  const authToken = token();
  if(!authToken) return false;
  const [categories, products] = await Promise.all([dbGet('categories', authToken), dbGet('products', authToken)]);
  const hasData = Object.keys(categories || {}).length || Object.keys(products || {}).length;
  if(hasData && !looksLikeLegacyCatalog(categories, products)) return false;

  if(looksLikeLegacyCatalog(categories, products)){
    await Promise.all(Object.keys(products || {}).map(id => dbDelete(`products/${id}`, authToken)));
    await Promise.all(Object.keys(categories || {}).map(id => dbDelete(`categories/${id}`, authToken)));
  }
  await seedDesiredCatalog(authToken);
  return true;
}
