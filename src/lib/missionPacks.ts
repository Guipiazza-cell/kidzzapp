// Mission Packs — produtos transacionais avulsos
export interface MissionPackItem {
  emoji: string;
  name: string;
  description: string;
  steps: string[];
}

export interface MissionPack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  duration: string;
  price: number;
  priceLabel: string;
  color: string;
  missions: MissionPackItem[];
}

export const MISSION_PACKS: MissionPack[] = [
  {
    id: "ferias",
    name: "Pack Férias em Família",
    emoji: "🏖️",
    description: "8 missões exclusivas para 7 dias juntos",
    duration: "7 dias",
    price: 9.9,
    priceLabel: "R$ 9,90",
    color: "from-amber-400 to-orange-500",
    missions: [
      { emoji: "🗺️", name: "Tesouros do Quintal", description: "Caça ao tesouro com pistas escritas à mão", steps: ["Esconda 5 objetos pela casa", "Crie um mapa simples", "Comemore cada descoberta"] },
      { emoji: "👨‍🍳", name: "Chefe da Família", description: "Cozinhem juntos uma receita escolhida pelo seu filho", steps: ["Deixe a criança escolher o prato", "Separe ingredientes simples", "Tirem uma foto do resultado"] },
      { emoji: "🚀", name: "Astronautas em Casa", description: "Construam uma nave espacial com almofadas", steps: ["Reúnam almofadas e cobertores", "Decorem o cockpit", "Inventem a missão da nave"] },
      { emoji: "🎬", name: "Cinema Caseiro", description: "Filme curta com a câmera do celular", steps: ["Escolham um tema simples", "Gravem 5 cenas", "Assistam juntos com pipoca"] },
      { emoji: "🌱", name: "Plante uma História", description: "Plantem uma sementinha e acompanhem o crescimento", steps: ["Escolham uma semente fácil", "Plantem em um copo", "Reguem todos os dias"] },
      { emoji: "📚", name: "Livro do Verão", description: "Criem um livrinho ilustrado das férias", steps: ["Dobrem 4 folhas A4", "Cada página = um dia memorável", "Desenhem juntos"] },
      { emoji: "🎨", name: "Galeria do Coração", description: "Façam uma exposição de arte na parede", steps: ["Pintem 3 quadros pequenos", "Colem na parede com fita", "Inaugurem com um brinde de suco"] },
      { emoji: "⭐", name: "Caça às Estrelas", description: "Observem o céu noturno e inventem constelações", steps: ["Saiam à noite (com segurança)", "Olhem para cima por 10 min", "Nomeiem uma estrela juntos"] },
    ],
  },
  {
    id: "natal",
    name: "Pack Magia do Natal",
    emoji: "🎄",
    description: "10 momentos mágicos de dezembro",
    duration: "Dezembro",
    price: 12.9,
    priceLabel: "R$ 12,90",
    color: "from-red-500 to-emerald-600",
    missions: [],
  },
  {
    id: "volta_aulas",
    name: "Pack Volta às Aulas",
    emoji: "🎒",
    description: "6 missões para começar o ano com ânimo",
    duration: "Primeira semana",
    price: 7.9,
    priceLabel: "R$ 7,90",
    color: "from-sky-400 to-indigo-500",
    missions: [],
  },
  {
    id: "aniversario",
    name: "Pack Aniversário",
    emoji: "🎂",
    description: "5 surpresas para o dia mais especial",
    duration: "Aniversário",
    price: 9.9,
    priceLabel: "R$ 9,90",
    color: "from-pink-400 to-purple-500",
    missions: [],
  },
];

const STORAGE_KEY = "kidzz_purchased_packs";

export function getPurchasedPacks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isPackPurchased(packId: string): boolean {
  return getPurchasedPacks().includes(packId);
}

export function markPackPurchased(packId: string): void {
  const owned = getPurchasedPacks();
  if (!owned.includes(packId)) {
    owned.push(packId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
  }
}

// Placeholder checkout — to be wired to Stripe/Pagar.me/Iugu/RevenueCat
export function openMissionPackCheckout(packId: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    const pack = MISSION_PACKS.find((p) => p.id === packId);
    if (!pack) return resolve({ success: false });
    // Simulate async checkout flow — to be replaced by real provider
    setTimeout(() => {
      markPackPurchased(packId);
      resolve({ success: true });
    }, 600);
  });
}
