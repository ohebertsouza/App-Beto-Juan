import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Home, DollarSign, MessageCircle, Plus, Check, Trash2, 
  User, LogOut, Smile, AlertTriangle, 
  Calendar as CalendarIcon, ShoppingCart, Lock, Sparkles, Dog, List, Edit, Search, X, History, Lightbulb, Zap, PenTool, Flag
} from 'lucide-react';

// --- Importações do Firebase ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, 
  updateDoc, serverTimestamp, query, orderBy, setDoc, getDoc 
} from 'firebase/firestore';

// ============================================================================
// ⚠️ CONFIGURAÇÃO DO FIREBASE ⚠️
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDXcyk0BgVPKVt4pOdaSzXCFnPfZGzHaQE",
  authDomain: "beto-e-juan.firebaseapp.com",
  projectId: "beto-e-juan",
  storageBucket: "beto-e-juan.firebasestorage.app",
  messagingSenderId: "968332184544",
  appId: "1:968332184544:web:9d91ef372493294df93985",
  measurementId: "G-WW9FPEGPWP"
};


const isConfigured = firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_PATH = 'apps/casal_nosdois'; 

// ============================================================================
// BANCO DE DADOS ESTÁTICO
// ============================================================================

// Banco de Tarefas (Mantido e Expandido)
const SUGGESTED_TASKS = [
// --- SUPER TRUNFO ---
  { category: 'Super Trunfo 🌟', title: 'Pagamento da Empregada (Faxina + Roupa + Louça)', effort: 15 },
  { category: 'Super Trunfo 🌟', title: 'Dia de Chef (Jantar Especial Completo)', effort: 10 },

  // --- ROMEU (Personalizado) ---
  { category: 'Romeu 🐶', title: 'Passeio Matinal Romeu', effort: 3 },
  { category: 'Romeu 🐶', title: 'Passeio Noturno Romeu', effort: 3 },
  { category: 'Romeu 🐶', title: 'Limpar Xixi/Cocô (Casa)', effort: 2 },
  { category: 'Romeu 🐶', title: 'Recolher Cocô (Rua)', effort: 2 },
  { category: 'Romeu 🐶', title: 'Dar Comida/Água', effort: 1 },
  { category: 'Romeu 🐶', title: 'Lavar Potes de Comida', effort: 1 },
  { category: 'Romeu 🐶', title: 'Banho no Romeu', effort: 5 },
  { category: 'Romeu 🐶', title: 'Escovar Pelo', effort: 2 },
  { category: 'Romeu 🐶', title: 'Lavar Caminha', effort: 3 },
  { category: 'Romeu 🐶', title: 'Levar no Veterinário', effort: 4 },
  { category: 'Romeu 🐶', title: 'Comprar Ração/Petiscos', effort: 2 },

  // --- COZINHA ---
  { category: 'Cozinha 🥘', title: 'Lavar Louça do Café', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Lavar Louça do Almoço', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Lavar Louça do Jantar', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Lavar Louça Grossa (Panelas)', effort: 3 },
  { category: 'Cozinha 🥘', title: 'Secar e Guardar Louça', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Limpar Pia e Torneira', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Limpar Fogão (Básico)', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Limpar Fogão (Faxina Pesada)', effort: 4 },
  { category: 'Cozinha 🥘', title: 'Limpar Micro-ondas', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Limpar Forno (Interno)', effort: 5 },
  { category: 'Cozinha 🥘', title: 'Limpar Geladeira (Externa)', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Faxina na Geladeira (Interna)', effort: 4 },
  { category: 'Cozinha 🥘', title: 'Organizar Despensa', effort: 3 },
  { category: 'Cozinha 🥘', title: 'Tirar Lixo Orgânico', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Lavar Lixeira da Cozinha', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Limpar Bancadas', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Fazer Lista de Compras', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Ir ao Supermercado (Compras do Mês)', effort: 5 },
  { category: 'Cozinha 🥘', title: 'Ir ao Mercado (Reposição Rápida)', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Limpar AirFryer', effort: 3 },

  // --- SALA DE ESTAR/JANTAR ---
  { category: 'Sala 🛋️', title: 'Varrer Sala', effort: 2 },
  { category: 'Sala 🛋️', title: 'Passar Pano Sala', effort: 3 },
  { category: 'Sala 🛋️', title: 'Aspirar Tapete', effort: 3 },
  { category: 'Sala 🛋️', title: 'Aspirar Sofá', effort: 3 },
  { category: 'Sala 🛋️', title: 'Limpar Tela da TV', effort: 1 },
  { category: 'Sala 🛋️', title: 'Tirar Pó dos Móveis', effort: 2 },
  { category: 'Sala 🛋️', title: 'Organizar Cabos e Eletrônicos', effort: 2 },
  { category: 'Sala 🛋️', title: 'Limpar Mesa de Jantar', effort: 1 },
  { category: 'Sala 🛋️', title: 'Regar Plantas Internas', effort: 1 },
  { category: 'Sala 🛋️', title: 'Limpar Ventilador/Ar Condicionado', effort: 3 },

  // --- QUARTO ---
  { category: 'Quarto 🛏️', title: 'Arrumar Cama', effort: 1 },
  { category: 'Quarto 🛏️', title: 'Trocar Lençóis', effort: 2 },
  { category: 'Quarto 🛏️', title: 'Trocar Fronhas', effort: 1 },
  { category: 'Quarto 🛏️', title: 'Varrer Quarto', effort: 2 },
  { category: 'Quarto 🛏️', title: 'Passar Pano Quarto', effort: 3 },
  { category: 'Quarto 🛏️', title: 'Organizar Guarda-Roupa', effort: 4 },
  { category: 'Quarto 🛏️', title: 'Guardar Roupas Espalhadas', effort: 1 },
  { category: 'Quarto 🛏️', title: 'Organizar Sapatos', effort: 2 },
  { category: 'Quarto 🛏️', title: 'Limpar Espelhos', effort: 2 },
  { category: 'Quarto 🛏️', title: 'Virar o Colchão', effort: 3 },

  // --- BANHEIRO ---
  { category: 'Banheiro 🚿', title: 'Lavar Vaso Sanitário', effort: 2 },
  { category: 'Banheiro 🚿', title: 'Limpar Assento Sanitário', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Lavar Box (Vidro e Azulejo)', effort: 4 },
  { category: 'Banheiro 🚿', title: 'Limpar Ralo (Cabelos)', effort: 2 },
  { category: 'Banheiro 🚿', title: 'Lavar Pia do Banheiro', effort: 2 },
  { category: 'Banheiro 🚿', title: 'Trocar Toalhas (Rosto/Banho)', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Lavar Tapete do Banheiro', effort: 2 },
  { category: 'Banheiro 🚿', title: 'Tirar Lixo do Banheiro', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Repor Papel e Sabonete', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Faxina Geral Banheiro', effort: 5 },

  // --- LAVANDERIA E ROUPAS ---
  { category: 'Lavanderia 🧺', title: 'Separar Roupas para Lavar', effort: 1 },
  { category: 'Lavanderia 🧺', title: 'Colocar Roupa na Máquina', effort: 1 },
  { category: 'Lavanderia 🧺', title: 'Estender Roupa no Varal', effort: 3 },
  { category: 'Lavanderia 🧺', title: 'Recolher Roupa Seca', effort: 1 },
  { category: 'Lavanderia 🧺', title: 'Dobrar Roupas', effort: 3 },
  { category: 'Lavanderia 🧺', title: 'Passar Roupas (Lote Pequeno)', effort: 3 },
  { category: 'Lavanderia 🧺', title: 'Passar Roupas (Lote Grande)', effort: 5 },
  { category: 'Lavanderia 🧺', title: 'Guardar Roupas nas Gavetas', effort: 2 },
  { category: 'Lavanderia 🧺', title: 'Lavar Tênis', effort: 3 },
  { category: 'Lavanderia 🧺', title: 'Limpar Tanque e Máquina', effort: 2 },

  // --- MANUTENÇÃO E GERAL ---
  { category: 'Manutenção 🛠️', title: 'Trocar Lâmpada Queimada', effort: 1 },
  { category: 'Manutenção 🛠️', title: 'Lavar Carro (Externo)', effort: 4 },
  { category: 'Manutenção 🛠️', title: 'Aspirar Carro (Interno)', effort: 3 },
  { category: 'Manutenção 🛠️', title: 'Limpar Vidros/Janelas', effort: 4 },
  { category: 'Manutenção 🛠️', title: 'Varrer Calçada/Varanda', effort: 3 },
  { category: 'Manutenção 🛠️', title: 'Tirar Pó de Rodapés', effort: 3 },
  { category: 'Manutenção 🛠️', title: 'Limpar Interruptores/Tomadas', effort: 1 },
  { category: 'Manutenção 🛠️', title: 'Pequenos Reparos (Apertar parafusos)', effort: 2 },
  { category: 'Manutenção 🛠️', title: 'Levar Lixo Reciclável', effort: 2 },
  { category: 'Manutenção 🛠️', title: 'Limpar Filtros (Ar/Exaustor)', effort: 2 },

  // --- ADMINISTRATIVO ---
  { category: 'Admin 💻', title: 'Pagar Contas do Mês', effort: 2 },
  { category: 'Admin 💻', title: 'Atualizar Planilha Financeira', effort: 3 },
  { category: 'Admin 💻', title: 'Organizar Correspondências', effort: 1 },
  { category: 'Admin 💻', title: 'Agendar Consultas Médicas', effort: 2 },
  { category: 'Admin 💻', title: 'Planejar Cardápio da Semana', effort: 2 },
  { category: 'Admin 💻', title: 'Planejar Próxima Viagem', effort: 4 },
  { category: 'Admin 💻', title: 'Backup de Fotos Celular', effort: 2 },
  { category: 'Admin 💻', title: 'Comprar Presentes (Aniversários)', effort: 3 },
];

// Ideias de Encontro (Expandido ~30 por categoria)
const DATE_IDEAS = [
  // Tempo de Qualidade
  { text: "Noite de Pizza caseira (fazer massa juntos)", type: "Tempo de Qualidade" },
  { text: "Piquenique na sala com vinho", type: "Tempo de Qualidade" },
  { text: "Maratona de filmes da infância", type: "Tempo de Qualidade" },
  { text: "Noite sem celulares (Caixa de proibição)", type: "Tempo de Qualidade" },
  { text: "Caminhada no parque sem destino", type: "Tempo de Qualidade" },
  { text: "Montar um quebra-cabeça juntos", type: "Tempo de Qualidade" },
  { text: "Responder perguntas de '36 questions to fall in love'", type: "Tempo de Qualidade" },
  { text: "Ver o pôr do sol em um lugar bonito", type: "Tempo de Qualidade" },
  { text: "Ler um livro juntos (um capítulo cada)", type: "Tempo de Qualidade" },
  { text: "Planejar a viagem dos sonhos (sem orçamento)", type: "Tempo de Qualidade" },
  { text: "Sair apenas para tomar um sorvete e conversar", type: "Tempo de Qualidade" },
  { text: "Jogar jogos de tabuleiro/cartas", type: "Tempo de Qualidade" },
  { text: "Cozinhar uma receita nova e complexa juntos", type: "Tempo de Qualidade" },
  { text: "Aula de dança ou yoga em casa (YouTube)", type: "Tempo de Qualidade" },
  { text: "Rever fotos antigas do namoro", type: "Tempo de Qualidade" },
  { text: "Café da manhã demorado na padaria", type: "Tempo de Qualidade" },
  { text: "Museu ou exposição de arte", type: "Tempo de Qualidade" },
  { text: "Andar de bicicleta", type: "Tempo de Qualidade" },
  { text: "Acampar na sala com lençóis", type: "Tempo de Qualidade" },
  { text: "Fazer uma playlist juntos ouvindo cada música", type: "Tempo de Qualidade" },

  // Palavras de Afirmação
  { text: "Bilhetinho escondido na carteira", type: "Palavras de Afirmação" },
  { text: "Escrever 'Eu te amo' no espelho do banheiro", type: "Palavras de Afirmação" },
  { text: "Carta de agradecimento por 3 coisas específicas", type: "Palavras de Afirmação" },
  { text: "Elogiar publicamente no Instagram", type: "Palavras de Afirmação" },
  { text: "Mandar um áudio de bom dia de 1 minuto elogiando", type: "Palavras de Afirmação" },
  { text: "Escrever 10 motivos pelos quais eu te amo", type: "Palavras de Afirmação" },
  { text: "Elogiar uma qualidade dele(a) na frente de amigos", type: "Palavras de Afirmação" },
  { text: "Deixar um post-it no computador/mesa dele(a)", type: "Palavras de Afirmação" },
  { text: "Enviar uma música que lembra ele(a) com legenda fofa", type: "Palavras de Afirmação" },
  { text: "Agradecer por algo rotineiro que ele(a) faz", type: "Palavras de Afirmação" },
  { text: "Criar um apelido carinhoso novo", type: "Palavras de Afirmação" },
  { text: "Dizer 'Estou orgulhoso de você' por algo pequeno", type: "Palavras de Afirmação" },
  { text: "Escrever uma carta para o 'Eu do Futuro' dele(a)", type: "Palavras de Afirmação" },
  { text: "Gravar um vídeo curto se declarando", type: "Palavras de Afirmação" },
  { text: "Deixar um bilhete na geladeira", type: "Palavras de Afirmação" },
  { text: "Elogiar a aparência dele(a) do nada", type: "Palavras de Afirmação" },
  { text: "Relembrar uma conquista dele(a) com admiração", type: "Palavras de Afirmação" },
  { text: "Enviar um SMS 'old school' romântico", type: "Palavras de Afirmação" },
  { text: "Escrever no vidro do carro (se estiver sujo ou embaçado)", type: "Palavras de Afirmação" },
  { text: "Fazer um brinde a ele(a) no jantar", type: "Palavras de Afirmação" },

  // Toque Físico
  { text: "Massagem nos pés com óleo", type: "Toque Físico" },
  { text: "Banho de espuma/chuveiro juntos", type: "Toque Físico" },
  { text: "Dançar lento na sala (corpo colado)", type: "Toque Físico" },
  { text: "Dormir de conchinha a noite toda", type: "Toque Físico" },
  { text: "Cafuné assistindo TV (sem pedir)", type: "Toque Físico" },
  { text: "Andar de mãos dadas o tempo todo no passeio", type: "Toque Físico" },
  { text: "Beijo longo de despedida (mínimo 10s)", type: "Toque Físico" },
  { text: "Abraço apertado quando ele(a) chegar (sem falar nada)", type: "Toque Físico" },
  { text: "Massagem nas costas/ombros após trabalho", type: "Toque Físico" },
  { text: "Fazer skincare juntos (tocar o rosto)", type: "Toque Físico" },
  { text: "Sentar no colo dele(a)", type: "Toque Físico" },
  { text: "Pentear o cabelo dele(a)", type: "Toque Físico" },
  { text: "Sessão de cócegas ou lutinha (com carinho)", type: "Toque Físico" },
  { text: "Dormir pelados (skin to skin)", type: "Toque Físico" },
  { text: "Pés entrelaçados no sofá", type: "Toque Físico" },
  { text: "Beijar a testa", type: "Toque Físico" },
  { text: "Lavar o cabelo dele(a) no banho", type: "Toque Físico" },
  { text: "Passar hidratante nas costas dele(a)", type: "Toque Físico" },
  { text: "Colo e carinho antes de dormir", type: "Toque Físico" },
  { text: "Mãos na perna dele(a) enquanto ele(a) dirige", type: "Toque Físico" },

  // Atos de Serviço
  { text: "Lavar o carro dele(a) de surpresa", type: "Atos de Serviço" },
  { text: "Fazer todas as tarefas chatas do dia por ele(a)", type: "Atos de Serviço" },
  { text: "Arrumar a bagunça 'daquele' quarto", type: "Atos de Serviço" },
  { text: "Cozinhar o prato favorito (ou pedir)", type: "Atos de Serviço" },
  { text: "Café da manhã na cama", type: "Atos de Serviço" },
  { text: "Levar o lixo dele(a) para fora", type: "Atos de Serviço" },
  { text: "Abastecer o carro dele(a)", type: "Atos de Serviço" },
  { text: "Consertar algo quebrado que ele(a) reclamou", type: "Atos de Serviço" },
  { text: "Preparar a marmita do dia seguinte", type: "Atos de Serviço" },
  { text: "Organizar a papelada/contas", type: "Atos de Serviço" },
  { text: "Buscar água quando ele(a) estiver deitado", type: "Atos de Serviço" },
  { text: "Limpar o cocô do Romeu no turno dele(a)", type: "Atos de Serviço" },
  { text: "Passar a roupa que ele(a) vai usar", type: "Atos de Serviço" },
  { text: "Fazer a cama impecável", type: "Atos de Serviço" },
  { text: "Buscar remédio na farmácia", type: "Atos de Serviço" },
  { text: "Resolver um problema burocrático (ligar na net)", type: "Atos de Serviço" },
  { text: "Deixar o café pronto na garrafa", type: "Atos de Serviço" },
  { text: "Arrumar a mala de viagem dele(a)", type: "Atos de Serviço" },
  { text: "Pagar uma conta surpresa", type: "Atos de Serviço" },
  { text: "Levar o celular para carregar", type: "Atos de Serviço" },

  // Presentes
  { text: "Comprar aquele chocolate importado", type: "Presentes" },
  { text: "Presentear com uma planta ou flor sem motivo", type: "Presentes" },
  { text: "Montar uma playlist só pra ele(a)", type: "Presentes" }, // Playlist pode ser presente digital
  { text: "Dar um vale-night para ele(a) sair com amigos", type: "Presentes" },
  { text: "Comprar a comida favorita no mercado surpresa", type: "Presentes" },
  { text: "Revelar uma foto nossa e emoldurar", type: "Presentes" },
  { text: "Comprar uma caneca nova pro café", type: "Presentes" },
  { text: "Dar um livro que ele(a) queria", type: "Presentes" },
  { text: "Trazer uma lembrancinha de uma viagem rápida", type: "Presentes" },
  { text: "Comprar uma roupa íntima nova", type: "Presentes" },
  { text: "Assinar um streaming que ele(a) gosta", type: "Presentes" },
  { text: "Dar um chaveiro fofo", type: "Presentes" },
  { text: "Comprar ingresso pra um show/cinema futuro", type: "Presentes" },
  { text: "Fazer um álbum de figurinhas nosso", type: "Presentes" },
  { text: "Dar um acessório pro Romeu", type: "Presentes" },
  { text: "Comprar uma cerveja/vinho especial", type: "Presentes" },
  { text: "Dar um voucher de massagem profissional", type: "Presentes" },
  { text: "Presentear com uma experiência (curso online)", type: "Presentes" },
  { text: "Encomendar um doce personalizado", type: "Presentes" },
  { text: "Comprar um item de decoração que ele(a) olhou", type: "Presentes" }
];

// Tradutor Fofo (Lógica Inteligente)
const getSoftenedMessage = (complaint, partnerLang) => {
  const intros = {
    "Tempo de Qualidade": [
      "Amor, sinto muita falta dos nossos momentos juntos...",
      "Valorizo tanto quando você me dá atenção...",
      "Adoro nossa conexão, por isso queria falar sobre..."
    ],
    "Atos de Serviço": [
      "Amor, você sabe que eu valorizo muito quando cuidamos das coisas juntos...",
      "Me sentiria muito cuidado(a) se você pudesse me ajudar com...",
      "Seria um gesto enorme de carinho se..."
    ],
    "Palavras de Afirmação": [
      "Você é incrível e eu te admiro muito...",
      "Sei que sua intenção é sempre boa...",
      "Gosto tanto de como a gente se entende, mas..."
    ],
    "Toque Físico": [
      "Quero ficar agarradinho com você, mas isso está me incomodando...",
      "Me sinto mais perto de você quando estamos alinhados...",
      "Um abraço seu resolve tudo, mas precisamos ver..."
    ],
    "Presentes": [
      "Você é meu maior presente, mas fiquei triste com...",
      "Valorizo muito o que você me proporciona...",
      "Seria uma surpresa maravilhosa se..."
    ]
  };

  const templates = intros[partnerLang] || intros['Tempo de Qualidade'];
  const intro = templates[Math.floor(Math.random() * templates.length)];
  
  // Constrói a mensagem "sanduíche" (Elogio/Vínculo -> Problema Suavizado -> Fechamento)
  return `${intro} "${complaint}". Podemos resolver isso juntos? Te amo! ❤️`;
};

// ============================================================================

function ConfigErrorScreen() {
  return (
    <div className="h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md border-2 border-red-100">
        <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-red-600 mb-2">Falta Configurar o Firebase!</h1>
        <p className="text-gray-600 text-sm mb-4">Vá em src/App.jsx e cole suas chaves API.</p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isConfigured) return <ConfigErrorScreen />;
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 h-screen flex flex-col items-center justify-center text-center">
          <h1 className="text-lg font-bold text-red-800">Erro no App</h1>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Reiniciar</button>
        </div>
      );
    }
    return this.props.children; 
  }
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedProfile = localStorage.getItem('nosdois_profile_v14');
      if (savedProfile) {
        setProfileName(savedProfile);
        setIsAuthenticated(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && profileName) {
        const fetchProfile = async () => {
            const docRef = doc(db, APP_PATH, 'profiles', profileName);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setUserProfileData(docSnap.data());
            else setUserProfileData(null); 
        };
        fetchProfile();
    }
  }, [user, profileName, isEditingProfile]);

  const handleAuthSuccess = (name) => {
    setProfileName(name);
    setIsAuthenticated(true);
    localStorage.setItem('nosdois_profile_v14', name);
  };

  const handleLogout = () => {
    setProfileName(null);
    setIsAuthenticated(false);
    setUserProfileData(null);
    localStorage.removeItem('nosdois_profile_v14');
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-rose-500 font-bold animate-pulse">Carregando...</div>;
  if (!isAuthenticated) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  if ((isAuthenticated && !userProfileData) || isEditingProfile) {
      return <ProfileSetup user={user} profileName={profileName} existingData={userProfileData} onComplete={() => { setIsEditingProfile(false); window.location.reload(); }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-2xl overflow-hidden font-sans">
      <Header profileName={profileName} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'dashboard' && <Dashboard user={user} profileName={profileName} setActiveTab={setActiveTab} />}
        {activeTab === 'financas' && <Finances user={user} profileName={profileName} />}
        {activeTab === 'tarefas' && <Chores user={user} profileName={profileName} />}
        {activeTab === 'mercado' && <MarketList user={user} profileName={profileName} />}
        {activeTab === 'ideias' && <IdeasBank user={user} profileName={profileName} />}
        {activeTab === 'calendario' && <SharedCalendar user={user} profileName={profileName} />}
        {activeTab === 'conflitos' && <Conflicts user={user} profileName={profileName} />}
        {activeTab === 'curiosidades' && <Curiosities user={user} onEditProfile={() => setIsEditingProfile(true)} />}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// --- Auth e Setup ---
function AuthScreen({ onAuthSuccess }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const docRef = doc(db, APP_PATH, 'profiles', name);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) await setDoc(docRef, { password, createdAt: serverTimestamp() });
            else if (docSnap.data().password !== password) throw new Error("Senha incorreta");
            onAuthSuccess(name);
        } catch (err) { alert(err.message); } finally { setLoading(false); }
    };
    return (
        <div className="h-screen flex flex-col items-center justify-center p-6 bg-rose-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
                <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Hebert & Juan</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Nome (Ex: Hebert)" value={name} onChange={e=>setName(e.target.value.trim())} />
                    <input className="w-full border p-3 rounded-xl" type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
                    <button disabled={loading} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold">{loading ? '...' : 'Entrar'}</button>
                </form>
            </div>
        </div>
    );
}

function ProfileSetup({ user, profileName, existingData, onComplete }) {
    const [formData, setFormData] = useState({
        income: existingData?.income || '', 
        loveLanguage: existingData?.loveLanguage || 'Tempo de Qualidade',
        secondaryLoveLanguage: existingData?.secondaryLoveLanguage || 'Toque Físico',
        maidDay: existingData?.maidDay || 'Sexta'
    });
    const handleSave = async () => {
        await updateDoc(doc(db, APP_PATH, 'profiles', profileName), { ...formData, profileCompleted: true });
        onComplete();
    };
    const options = ['Tempo de Qualidade', 'Atos de Serviço', 'Palavras de Afirmação', 'Toque Físico', 'Presentes'];
    return (
        <div className="h-screen bg-white p-6 overflow-y-auto">
            <h1 className="text-xl font-bold text-rose-500 mb-4">Perfil de {profileName}</h1>
            <div className="space-y-4">
                <div><label className="text-xs font-bold text-gray-500">Renda Mensal (R$)</label><input type="number" className="w-full border p-3 rounded-xl" value={formData.income} onChange={e=>setFormData({...formData, income: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Linguagem do Amor (Principal)</label><select className="w-full border p-3 rounded-xl bg-white" value={formData.loveLanguage} onChange={e=>setFormData({...formData, loveLanguage: e.target.value})} >{options.map(l=><option key={l}>{l}</option>)}</select></div>
                <div><label className="text-xs font-bold text-gray-500">Linguagem do Amor (Secundária)</label><select className="w-full border p-3 rounded-xl bg-white" value={formData.secondaryLoveLanguage} onChange={e=>setFormData({...formData, secondaryLoveLanguage: e.target.value})} >{options.map(l=><option key={l}>{l}</option>)}</select></div>
                <div><label className="text-xs font-bold text-gray-500">Dia da Empregada (Gera pontos pro Juan)</label><select className="w-full border p-3 rounded-xl bg-white" value={formData.maidDay} onChange={e=>setFormData({...formData, maidDay: e.target.value})} >{['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d=><option key={d}>{d}</option>)}</select></div>
                <button onClick={handleSave} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold mt-4">Salvar</button>
            </div>
        </div>
    );
}

// --- Dashboard ---
function Dashboard({ user, profileName, setActiveTab }) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <Dog className="absolute bottom-0 right-4 text-white/20" size={80} />
          <h2 className="text-lg font-medium opacity-90">Olá, {profileName}!</h2>
          <p className="text-xl font-bold mt-1">Bem-vindo ao lar.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DashboardCard icon={Dog} color="bg-orange-100 text-orange-600" title="Tarefas" subtitle="& Pontos" onClick={() => setActiveTab('tarefas')} />
          <DashboardCard icon={DollarSign} color="bg-green-100 text-green-600" title="Finanças" subtitle="& Mercado" onClick={() => setActiveTab('financas')} />
          <DashboardCard icon={Lightbulb} color="bg-yellow-100 text-yellow-600" title="Ideias" subtitle="Surpresas" onClick={() => setActiveTab('ideias')} />
          <DashboardCard icon={MessageCircle} color="bg-purple-100 text-purple-600" title="DR & Love" subtitle="Conversas" onClick={() => setActiveTab('conflitos')} />
        </div>
      </div>
    );
}
function DashboardCard({ icon: Icon, color, title, subtitle, onClick }) {
    return (<button onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start hover:bg-gray-50 active:scale-95"><div className={`p-2 rounded-lg mb-3 ${color}`}><Icon size={24} /></div><span className="font-bold text-gray-800">{title}</span><span className="text-xs text-gray-500">{subtitle}</span></button>);
}

// --- 1. TAREFAS ---
function Chores({ user, profileName }) {
    const [items, setItems] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [completionModal, setCompletionModal] = useState(null);
    const [manualTask, setManualTask] = useState('');
    const [manualEffort, setManualEffort] = useState('1');
    const [manualAssignee, setManualAssignee] = useState('Ambos');
    const [maidDay, setMaidDay] = useState('Sexta');

    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, APP_PATH, 'profiles', 'Juan')).then(docSnap => {
            if(docSnap.exists()) setMaidDay(docSnap.data().maidDay || 'Sexta');
        });
        const unsub = onSnapshot(query(collection(db, APP_PATH, 'chores'), orderBy('createdAt', 'desc')), (s) => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => unsub();
    }, [user]);

    const addManualTask = async (e) => {
        e.preventDefault(); if (!manualTask) return;
        await addDoc(collection(db, APP_PATH, 'chores'), {
            title: manualTask, effort: parseInt(manualEffort), assignedTo: manualAssignee, completed: false, createdAt: serverTimestamp()
        });
        setManualTask('');
    };

    const addSuggested = async (task) => {
        await addDoc(collection(db, APP_PATH, 'chores'), {
            title: task.title, category: task.category, effort: task.effort, assignedTo: 'Ambos', completed: false, createdAt: serverTimestamp()
        });
        setShowSuggestions(false);
    };

    const confirmCompletion = async (who) => {
        if (!completionModal) return;
        await updateDoc(doc(db, APP_PATH, 'chores', completionModal.id), {
            completed: true, completedBy: who, completedAt: new Date().toISOString()
        });
        setCompletionModal(null);
    };

    useEffect(() => {
        const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
        const isMaidDay = today.toLowerCase().includes(maidDay.toLowerCase());
        const lastGen = localStorage.getItem('maid_tasks_gen');
        const todayStr = new Date().toDateString();

        if (isMaidDay && lastGen !== todayStr) {
            addDoc(collection(db, APP_PATH, 'chores'), {
                title: 'Diária da Empregada (Automático)', effort: 15, assignedTo: 'Juan (Pago)', 
                completed: true, completedBy: 'Juan', completedAt: new Date().toISOString(), createdAt: serverTimestamp()
            });
            localStorage.setItem('maid_tasks_gen', todayStr);
        }
    }, [maidDay]);

    const balance = useMemo(() => {
        let h = 0, j = 0;
        const limitDate = new Date(); limitDate.setDate(limitDate.getDate() - 7);
        items.forEach(i => {
            if (i.completed && i.completedBy && new Date(i.completedAt) > limitDate) {
                if (i.completedBy === 'Hebert') h += i.effort || 1;
                if (i.completedBy === 'Juan') j += i.effort || 1;
            }
        });
        return { h, j, total: h + j || 1 };
    }, [items]);

    const filteredSuggestions = SUGGESTED_TASKS.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.category?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-800 text-sm mb-1 flex gap-2 items-center"><Zap size={14}/> Justiçômetro (7 dias)</h3>
                <div className="flex h-4 bg-gray-300 rounded-full overflow-hidden relative">
                    <div style={{width: `${(balance.h / balance.total) * 100}%`}} className="bg-indigo-500 transition-all duration-500"></div>
                    <div style={{width: `${(balance.j / balance.total) * 100}%`}} className="bg-teal-500 transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-xs mt-1 font-bold"><span className="text-indigo-600">Hebert: {balance.h} pts</span><span className="text-teal-600">Juan: {balance.j} pts</span></div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {!showSuggestions ? (
                    <button onClick={() => setShowSuggestions(true)} className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mb-4"><List size={18}/> Banco de Tarefas (100+)</button>
                ) : (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4 animate-fadeIn">
                        <div className="flex justify-between mb-2"><span className="text-xs font-bold uppercase">Selecione:</span><button onClick={()=>setShowSuggestions(false)}><X size={16}/></button></div>
                        <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filtrar..." className="w-full p-2 rounded border mb-2 text-sm" />
                        <div className="max-h-60 overflow-y-auto">
                            {filteredSuggestions.map((task, idx) => (
                                <button key={idx} onClick={() => addSuggested(task)} className="w-full text-left p-2 border-b last:border-0 hover:bg-rose-100 text-xs flex justify-between items-center group">
                                    <div><span className="font-bold text-gray-500 block">{task.category}</span> {task.title}</div>
                                    <span className="font-bold text-orange-500">{task.effort} pts</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <form onSubmit={addManualTask} className="space-y-2 pt-2 border-t border-dashed">
                    <p className="text-xs font-bold text-gray-400">Ou adicione manualmente:</p>
                    <input className="w-full border p-2 rounded text-sm" placeholder="Nome da tarefa..." value={manualTask} onChange={e=>setManualTask(e.target.value)} />
                    <div className="flex gap-2">
                        <select className="border p-2 rounded text-sm bg-white" value={manualEffort} onChange={e=>setManualEffort(e.target.value)}><option value="1">Leve (1)</option><option value="2">Médio (2)</option><option value="3">Pesado (3)</option><option value="5">Muito Pesado (5)</option></select>
                        <select className="border p-2 rounded text-sm bg-white flex-1" value={manualAssignee} onChange={e=>setManualAssignee(e.target.value)}><option>Ambos</option><option>Hebert</option><option>Juan</option></select>
                    </div>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 rounded font-bold text-sm">Adicionar Manual</button>
                </form>
            </div>

            {completionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm animate-fadeIn">
                        <h3 className="text-lg font-bold text-center mb-4">Quem concluiu "{completionModal.title}"?</h3>
                        <div className="flex gap-4">
                            <button onClick={()=>confirmCompletion('Hebert')} className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-bold">Hebert</button>
                            <button onClick={()=>confirmCompletion('Juan')} className="flex-1 bg-teal-500 text-white py-3 rounded-xl font-bold">Juan</button>
                        </div>
                        <button onClick={()=>setCompletionModal(null)} className="w-full mt-4 text-gray-400 text-sm underline">Cancelar</button>
                    </div>
                </div>
            )}

            <div className="space-y-2 pb-20">
                {items.filter(i => !i.completed).map(item => (
                    <div key={item.id} className="p-3 rounded-lg border bg-white border-l-4 border-l-orange-400 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <button onClick={() => setCompletionModal(item)} className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-500 flex items-center justify-center"><Check size={14} className="text-transparent hover:text-green-500"/></button>
                            <div>
                                <span className="font-bold text-gray-800 text-sm block">{item.title}</span>
                                <div className="flex gap-2"><span className="text-[10px] bg-gray-100 px-1 rounded">{item.category || 'Manual'}</span><span className="text-[10px] text-orange-500 font-bold">{item.effort} pts</span></div>
                            </div>
                        </div>
                        <button onClick={() => deleteDoc(doc(db, APP_PATH, 'chores', item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                ))}
                {items.filter(i => i.completed).length > 0 && <p className="text-xs font-bold text-gray-400 mt-4 uppercase">Concluídas Recentemente</p>}
                {items.filter(i => i.completed).slice(0, 5).map(item => (
                    <div key={item.id} className="p-2 rounded-lg border bg-gray-50 opacity-60 flex justify-between items-center">
                        <span className="text-xs line-through text-gray-500">{item.title}</span>
                        <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded font-bold">Feito por {item.completedBy}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- 2. FINANÇAS ---
function Finances({ user, profileName }) {
    const [bills, setBills] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [incomeRatio, setIncomeRatio] = useState({ hebert: 0.5, juan: 0.5 });
    const [formData, setFormData] = useState({ title: '', value: '', type: 'Conta' });

    useEffect(() => {
        if (!user) return;
        const fetchIncomes = async () => {
            const h = await getDoc(doc(db, APP_PATH, 'profiles', 'Hebert'));
            const j = await getDoc(doc(db, APP_PATH, 'profiles', 'Juan'));
            if (h.exists() && j.exists()) {
                const total = (parseFloat(h.data().income) || 0) + (parseFloat(j.data().income) || 0);
                if (total > 0) setIncomeRatio({ hebert: (parseFloat(h.data().income) || 0) / total, juan: (parseFloat(j.data().income) || 0) / total });
            }
        };
        fetchIncomes();
        const unsub = onSnapshot(query(collection(db, APP_PATH, 'finances'), orderBy('createdAt', 'desc')), (s) => setBills(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => unsub();
    }, [user]);

    const save = async (e) => {
        e.preventDefault(); if (!formData.title || !formData.value) return;
        const payload = { ...formData, value: parseFloat(formData.value), createdAt: serverTimestamp() };
        if (editingId) { await updateDoc(doc(db, APP_PATH, 'finances', editingId), payload); setEditingId(null); }
        else { await addDoc(collection(db, APP_PATH, 'finances'), { ...payload, isPaid: false }); }
        setFormData({ title: '', value: '', type: 'Conta' });
    };

    const edit = (item) => { setFormData({ title: item.title, value: item.value, type: item.type || 'Conta' }); setEditingId(item.id); };

    return (
        <div className="space-y-4 pb-20">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-2"><DollarSign size={14}/> Divisão Justa (Baseada na Renda)</h3>
                <div className="flex h-6 bg-gray-300 rounded-full overflow-hidden mb-2 border border-green-200">
                    <div style={{width: `${incomeRatio.hebert * 100}%`}} className="bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">H: {(incomeRatio.hebert * 100).toFixed(0)}%</div>
                    <div style={{width: `${incomeRatio.juan * 100}%`}} className="bg-teal-500 flex items-center justify-center text-[10px] text-white font-bold">J: {(incomeRatio.juan * 100).toFixed(0)}%</div>
                </div>
            </div>
            <form onSubmit={save} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                <div className="flex gap-2 text-sm">
                    <button type="button" onClick={()=>setFormData({...formData, type: 'Conta'})} className={`flex-1 py-1 rounded ${formData.type==='Conta'?'bg-green-100 text-green-700 font-bold':'bg-gray-100 text-gray-500'}`}>Conta Fixa</button>
                    <button type="button" onClick={()=>setFormData({...formData, type: 'Mercado'})} className={`flex-1 py-1 rounded ${formData.type==='Mercado'?'bg-blue-100 text-blue-700 font-bold':'bg-gray-100 text-gray-500'}`}>Mercado</button>
                </div>
                <input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="Descrição..." className="w-full border p-2 rounded text-sm"/>
                <div className="flex gap-2">
                    <input type="number" value={formData.value} onChange={e=>setFormData({...formData, value: e.target.value})} placeholder="Valor R$" className="flex-1 border p-2 rounded text-sm"/>
                    <button className={`px-4 rounded font-bold text-white ${editingId ? 'bg-yellow-500' : 'bg-green-500'}`}>{editingId ? 'Salvar' : 'Add'}</button>
                </div>
            </form>
            <div className="space-y-2">
                {bills.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-1 rounded ${item.type==='Mercado'?'bg-blue-100 text-blue-600':'bg-green-100 text-green-600'}`}>{item.type}</span>
                                <span className="font-bold text-gray-700 text-sm">{item.title}</span>
                            </div>
                            <span className="text-xs text-gray-500">R$ {item.value.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={()=>edit(item)} className="text-gray-400 hover:text-yellow-500"><Edit size={14}/></button>
                            <button onClick={()=>deleteDoc(doc(db, APP_PATH, 'finances', item.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- 3. IDEIAS ---
function IdeasBank({ user, profileName }) {
    const [filter, setFilter] = useState('Todas');
    const partnerName = profileName === 'Hebert' ? 'Juan' : 'Hebert';
    const [partnerProfile, setPartnerProfile] = useState(null);

    useEffect(() => {
        if(!user) return;
        getDoc(doc(db, APP_PATH, 'profiles', partnerName)).then(s => { if(s.exists()) setPartnerProfile(s.data()); });
    }, [user]);

    // Lógica para filtrar por primária e secundária
    const visible = useMemo(() => {
        if (filter === 'Todas') return DATE_IDEAS;
        if (filter === 'Parceiro' && partnerProfile) {
            return DATE_IDEAS.filter(i => 
                i.type === partnerProfile.loveLanguage || 
                i.type === partnerProfile.secondaryLoveLanguage
            );
        }
        return DATE_IDEAS.filter(i => i.type === filter);
    }, [filter, partnerProfile]);

    const shuffled = useMemo(() => [...visible].sort(() => 0.5 - Math.random()).slice(0, 10), [visible]);

    return (
        <div className="space-y-4 pb-20">
            <div className="bg-yellow-100 p-4 rounded-xl border border-yellow-200">
                <h2 className="font-bold text-yellow-800 flex items-center gap-2"><Lightbulb size={20}/> Ideias para o Casal</h2>
                {partnerProfile && (
                    <button onClick={() => setFilter('Parceiro')} className="mt-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                        Sugestões para ele ({partnerProfile.loveLanguage} + {partnerProfile.secondaryLoveLanguage})
                    </button>
                )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">{['Todas', 'Tempo de Qualidade', 'Palavras de Afirmação', 'Toque Físico', 'Atos de Serviço', 'Presentes'].map(t => (<button key={t} onClick={()=>setFilter(t)} className={`whitespace-nowrap px-3 py-1 rounded-full text-xs border ${filter===t?'bg-gray-800 text-white':'bg-white text-gray-600'}`}>{t}</button>))}</div>
            <div className="grid gap-2">{shuffled.map((idea, idx) => (<div key={idx} className="bg-white p-3 rounded-lg border border-l-4 border-l-yellow-400 shadow-sm"><p className="text-sm font-medium text-gray-800">{idea.text}</p><span className="text-[10px] text-gray-400 uppercase">{idea.type}</span></div>))}</div>
        </div>
    );
}

// --- 4. DR & RECLAMAÇÕES ---
function Conflicts({ user, profileName }) {
    const [tab, setTab] = useState('dr'); 
    const [items, setItems] = useState([]);
    const [newText, setNewText] = useState('');
    const [classification, setClassification] = useState('Reclamação'); 
    const partnerName = profileName === 'Hebert' ? 'Juan' : 'Hebert';
    const [partnerProfile, setPartnerProfile] = useState(null);

    useEffect(() => {
        if(!user) return;
        getDoc(doc(db, APP_PATH, 'profiles', partnerName)).then(s => { if(s.exists()) setPartnerProfile(s.data()); });
        const u = onSnapshot(query(collection(db, APP_PATH, 'conflicts'), orderBy('createdAt', 'desc')), s => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => u();
    }, [user]);

    const send = async (e) => {
        e.preventDefault(); if (!newText) return;
        let finalText = newText;
        let isSoftened = false;
        let type = classification;

        if (tab === 'reclama') {
            const lang = partnerProfile?.loveLanguage || 'Tempo de Qualidade';
            finalText = getSoftenedMessage(newText, lang);
            isSoftened = true;
            type = 'Correio do Amor';
        }

        await addDoc(collection(db, APP_PATH, 'conflicts'), {
            originalText: newText, displayText: finalText, type, from: profileName, isSoftened, createdAt: serverTimestamp()
        });
        setNewText('');
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex bg-gray-200 p-1 rounded-lg">
                <button onClick={()=>setTab('dr')} className={`flex-1 py-1 rounded text-sm font-bold ${tab==='dr'?'bg-white shadow text-purple-600':'text-gray-500'}`}>DR & Sério</button>
                <button onClick={()=>setTab('reclama')} className={`flex-1 py-1 rounded text-sm font-bold ${tab==='reclama'?'bg-white shadow text-pink-500':'text-gray-500'}`}>Correio do Amor</button>
            </div>

            {tab === 'dr' ? (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="text-purple-700 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Classifique e Fale</h3>
                    <div className="flex gap-2 mb-2">
                        {['Reclamação', 'Mágoa', 'Briga'].map(t => (
                            <button key={t} onClick={()=>setClassification(t)} type="button" className={`flex-1 text-xs py-1 rounded border ${classification===t?'bg-purple-600 text-white':'bg-white text-gray-600'}`}>{t}</button>
                        ))}
                    </div>
                    <form onSubmit={send}>
                        <textarea value={newText} onChange={e=>setNewText(e.target.value)} className="w-full p-2 rounded border focus:border-purple-400 outline-none text-sm" placeholder="O que aconteceu?" rows={3}></textarea>
                        <button className="w-full bg-purple-600 text-white font-bold py-2 rounded mt-2 text-sm">Registrar</button>
                    </form>
                </div>
            ) : (
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                    <h3 className="text-pink-700 font-bold text-sm mb-2 flex items-center gap-2"><Sparkles size={14}/> Tradutor de Reclamações</h3>
                    <p className="text-xs text-pink-600 mb-3">Escreva "bruto". O app entrega "fofo" baseado na linguagem dele.</p>
                    <form onSubmit={send}>
                        <textarea value={newText} onChange={e=>setNewText(e.target.value)} className="w-full p-2 rounded border focus:border-pink-400 outline-none text-sm" placeholder="Ex: Toalha molhada..." rows={3}></textarea>
                        <button className="w-full bg-pink-500 text-white font-bold py-2 rounded mt-2 text-sm">Enviar com Carinho</button>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {items.filter(i => (tab === 'reclama' ? i.type === 'Correio do Amor' : i.type !== 'Correio do Amor')).map(item => (
                    <div key={item.id} className={`p-3 rounded-xl border shadow-sm ${item.type === 'Briga' ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.from===profileName ? 'bg-gray-200' : 'bg-blue-100 text-blue-600'}`}>{item.from === profileName ? 'Você:' : `${item.from}:`}</span>
                            <span className="text-[10px] text-gray-400 uppercase border px-1 rounded">{item.type}</span>
                        </div>
                        <p className="text-sm text-gray-800 italic">"{item.displayText}"</p>
                        {item.isSoftened && item.from === profileName && <p className="text-[10px] text-gray-400 mt-1 border-t pt-1">Original: "{item.originalText}"</p>}
                        <div className="flex justify-end mt-2"><button onClick={() => deleteDoc(doc(db, APP_PATH, 'conflicts', item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- MERCADO ---
function MarketList({ user, profileName }) {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    useEffect(() => { if (!user) return; const unsub = onSnapshot(query(collection(db, APP_PATH, 'shopping_list'), orderBy('completed')), (snap) => setItems(snap.docs.map(d => ({id: d.id, ...d.data()})))); return () => unsub(); }, [user]);
    const add = async (e) => { e.preventDefault(); if (!newItem) return; await addDoc(collection(db, APP_PATH, 'shopping_list'), { title: newItem, completed: false, createdAt: serverTimestamp() }); setNewItem(''); };
    const toggle = async (item) => await updateDoc(doc(db, APP_PATH, 'shopping_list', item.id), { completed: !item.completed });
    const del = async (id) => await deleteDoc(doc(db, APP_PATH, 'shopping_list', id));
    return (
        <div className="space-y-4 pb-20"><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={20}/> Lista de Compras</h2><div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><form onSubmit={add} className="flex gap-2"><input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="O que falta?" className="flex-1 border p-2 rounded text-sm outline-none" /><button type="submit" className="bg-blue-500 text-white px-4 rounded font-bold">+</button></form></div><div className="space-y-2">{items.map(item => (<div key={item.id} className={`p-3 rounded-lg border flex items-center justify-between ${item.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}><div className="flex items-center gap-3 overflow-hidden"><button onClick={() => toggle(item)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>{item.completed && <Check size={14} />}</button><span className={`font-medium text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.title}</span></div><button onClick={() => del(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button></div>))}</div></div>
    );
}

// --- Outros Componentes ---
function SharedCalendar({ user }) { return <div className="p-10 text-center text-gray-400">Em breve...</div> }
function Curiosities({ user, onEditProfile }) { return <div className="p-6 text-center"><button onClick={onEditProfile} className="bg-blue-500 text-white px-4 py-2 rounded">Editar Perfil</button></div> }

function Header({ profileName, onLogout }) {
    return (<header className="bg-rose-500 text-white p-4 shadow-md z-10"><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><Heart className="fill-white animate-pulse" size={24} /><h1 className="text-xl font-bold">Hebert & Juan</h1></div><button onClick={onLogout} className="text-xs bg-rose-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-rose-800 transition"><User size={12} /> {profileName} <LogOut size={10} className="ml-1"/></button></div></header>);
}

function Navigation({ activeTab, setActiveTab }) {
  return (<nav className="bg-white border-t border-gray-200 flex justify-between items-end p-2 fixed bottom-0 w-full max-w-md z-20 pb-safe px-2 text-[10px]"><NavBtn icon={Home} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} /><NavBtn icon={DollarSign} label="Finanças" active={activeTab === 'financas'} onClick={() => setActiveTab('financas')} /><NavBtn icon={Dog} label="Tarefas" active={activeTab === 'tarefas'} onClick={() => setActiveTab('tarefas')} /><NavBtn icon={ShoppingCart} label="Mercado" active={activeTab === 'mercado'} onClick={() => setActiveTab('mercado')} /><NavBtn icon={Lightbulb} label="Ideias" active={activeTab === 'ideias'} onClick={() => setActiveTab('ideias')} /><NavBtn icon={MessageCircle} label="DR" active={activeTab === 'conflitos'} onClick={() => setActiveTab('conflitos')} /></nav>);
}

function NavBtn({ icon: Icon, label, active, onClick }) {
    return (<button onClick={onClick} className={`flex flex-col items-center p-2 w-[16%] transition-all ${active ? 'text-rose-500 -translate-y-1' : 'text-gray-400'}`}><Icon size={20} strokeWidth={active ? 2.5 : 2} /><span className="mt-1 font-medium truncate w-full text-center">{label}</span></button>);
}