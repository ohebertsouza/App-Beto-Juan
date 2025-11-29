import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Home, DollarSign, MessageCircle, Plus, Check, Trash2, 
  User, LogOut, Smile, AlertTriangle, 
  Calendar as CalendarIcon, ShoppingCart, Lock, Sparkles, Dog, List, Edit3, Search, X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, 
  updateDoc, serverTimestamp, query, orderBy, setDoc, getDoc, where 
} from 'firebase/firestore';

// --- Configuração do Firebase ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Frases Aleatórias do Dia ---
const DAILY_QUOTES = [
  "O segredo de um relacionamento feliz é duas pessoas perdoando muito.",
  "Amar é escolher a mesma pessoa todos os dias.",
  "Relacionamento não é só beijo e abraço, é também lavar a louça que o outro sujou.",
  "Em tempos de estresse, lembre-se: vocês são um time contra o problema, não um contra o outro.",
  "Ame, respeite e divida as contas proporcionalmente! 💸",
  "O amor é lindo, mas um pix inesperado do parceiro é maravilhoso.",
  "Cuidado: Fome causa 90% das brigas. Comam antes de discutir."
];

// --- Banco de Tarefas Expandido (100 Itens) ---
const SUGGESTED_TASKS = [
  // --- Romeu ---
  { category: 'Romeu 🐶', title: 'Passeio Matinal Romeu', effort: 3 },
  { category: 'Romeu 🐶', title: 'Passeio Noturno Romeu', effort: 3 },
  { category: 'Romeu 🐶', title: 'Limpar Xixi/Cocô Romeu (Casa)', effort: 2 },
  { category: 'Romeu 🐶', title: 'Recolher Cocô Romeu (Rua)', effort: 2 },
  { category: 'Romeu 🐶', title: 'Dar Comida Romeu', effort: 1 },
  { category: 'Romeu 🐶', title: 'Trocar Água Romeu', effort: 1 },
  { category: 'Romeu 🐶', title: 'Dar Banho no Romeu', effort: 3 },
  { category: 'Romeu 🐶', title: 'Escovar Pelos do Romeu', effort: 2 },
  { category: 'Romeu 🐶', title: 'Cortar Unhas do Romeu', effort: 3 },
  { category: 'Romeu 🐶', title: 'Lavar Caminha do Romeu', effort: 3 },
  { category: 'Romeu 🐶', title: 'Comprar Ração', effort: 2 },
  { category: 'Romeu 🐶', title: 'Levar ao Veterinário', effort: 3 },
  { category: 'Romeu 🐶', title: 'Dar Remédio de Verme/Pulga', effort: 1 },
  { category: 'Romeu 🐶', title: 'Limpar Potes de Comida', effort: 1 },
  { category: 'Romeu 🐶', title: 'Ensinar Truque Novo', effort: 2 },

  // --- Cozinha ---
  { category: 'Cozinha 🥘', title: 'Lavar Louça do Café', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Lavar Louça do Almoço', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Lavar Louça do Jantar', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Secar e Guardar Louça', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Limpar a Pia (Pós uso)', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Limpar Fogão (Superficial)', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Limpar Fogão (Pesada)', effort: 3 },
  { category: 'Cozinha 🥘', title: 'Limpar Microondas', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Limpar Geladeira (Por dentro)', effort: 3 },
  { category: 'Cozinha 🥘', title: 'Tirar Lixo Orgânico', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Tirar Lixo Reciclável', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Trocar Filtro de Água', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Organizar Armário de Potes', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Limpar Forno', effort: 3 },
  { category: 'Cozinha 🥘', title: 'Fazer Café da Manhã', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Fazer Almoço', effort: 3 },
  { category: 'Cozinha 🥘', title: 'Fazer Jantar', effort: 3 },
  { category: 'Cozinha 🥘', title: 'Guardar Compras de Mercado', effort: 2 },
  { category: 'Cozinha 🥘', title: 'Encher Garrafas de Água', effort: 1 },
  { category: 'Cozinha 🥘', title: 'Limpar Chão da Cozinha', effort: 2 },

  // --- Banheiro ---
  { category: 'Banheiro 🚿', title: 'Lavar Vaso Sanitário', effort: 2 },
  { category: 'Banheiro 🚿', title: 'Limpar Box/Vidro', effort: 3 },
  { category: 'Banheiro 🚿', title: 'Limpar Espelho', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Trocar Toalhas de Rosto', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Trocar Toalhas de Banho', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Tirar Lixo do Banheiro', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Limpar Ralo do Chuveiro', effort: 2 },
  { category: 'Banheiro 🚿', title: 'Repor Papel Higiênico', effort: 1 },
  { category: 'Banheiro 🚿', title: 'Lavar Tapetinho do Banheiro', effort: 2 },
  { category: 'Banheiro 🚿', title: 'Organizar Bancada da Pia', effort: 1 },

  // --- Quarto ---
  { category: 'Quarto 🛏️', title: 'Arrumar a Cama', effort: 1 },
  { category: 'Quarto 🛏️', title: 'Trocar Lençóis', effort: 2 },
  { category: 'Quarto 🛏️', title: 'Organizar Guarda-Roupa', effort: 3 },
  { category: 'Quarto 🛏️', title: 'Guardar Roupas Limpas', effort: 2 },
  { category: 'Quarto 🛏️', title: 'Separar Roupa Suja', effort: 1 },
  { category: 'Quarto 🛏️', title: 'Limpar Criado-Mudo', effort: 1 },
  { category: 'Quarto 🛏️', title: 'Organizar Sapatos', effort: 2 },
  { category: 'Quarto 🛏️', title: 'Virar o Colchão', effort: 2 },

  // --- Sala/Escritório ---
  { category: 'Sala 🛋️', title: 'Aspirar Sofá', effort: 2 },
  { category: 'Sala 🛋️', title: 'Organizar Almofadas', effort: 1 },
  { category: 'Sala 🛋️', title: 'Limpar TV/Eletrônicos', effort: 1 },
  { category: 'Sala 🛋️', title: 'Organizar Mesa de Centro', effort: 1 },
  { category: 'Escritório 💻', title: 'Organizar Mesa de Trabalho', effort: 1 },
  { category: 'Escritório 💻', title: 'Limpar Teclado/Mouse', effort: 1 },
  { category: 'Escritório 💻', title: 'Organizar Papéis/Contas', effort: 2 },
  { category: 'Escritório 💻', title: 'Tirar Lixo do Escritório', effort: 1 },

  // --- Área de Serviço/Geral ---
  { category: 'Geral 🧹', title: 'Varrer a Casa Toda', effort: 2 },
  { category: 'Geral 🧹', title: 'Passar Pano no Chão', effort: 3 },
  { category: 'Geral 🧹', title: 'Tirar Pó dos Móveis', effort: 2 },
  { category: 'Geral 🧹', title: 'Limpar Vidros/Janelas', effort: 3 },
  { category: 'Geral 🧹', title: 'Regar Plantas', effort: 1 },
  { category: 'Geral 🧹', title: 'Poda/Manutenção Plantas', effort: 2 },
  { category: 'Geral 🧹', title: 'Colocar Roupa pra Lavar', effort: 1 },
  { category: 'Geral 🧹', title: 'Estender Roupa', effort: 2 },
  { category: 'Geral 🧹', title: 'Recolher Roupa do Varal', effort: 1 },
  { category: 'Geral 🧹', title: 'Passar Roupa (Emergência)', effort: 2 },
  { category: 'Geral 🧹', title: 'Limpar Ventiladores/Ar', effort: 2 },
  { category: 'Geral 🧹', title: 'Trocar Lâmpada Queimada', effort: 2 },
  { category: 'Geral 🧹', title: 'Receber Encomenda/Delivery', effort: 1 },
  { category: 'Geral 🧹', title: 'Desmontar Caixa de Papelão', effort: 1 },
  { category: 'Geral 🧹', title: 'Limpar Interruptores/Maçanetas', effort: 1 },
  { category: 'Geral 🧹', title: 'Limpar Rodapés', effort: 3 },
  { category: 'Geral 🧹', title: 'Tirar Teias de Aranha (Teto)', effort: 1 },

  // --- Manutenção/Extra ---
  { category: 'Extra 🔧', title: 'Consertar algo quebrado', effort: 3 },
  { category: 'Extra 🔧', title: 'Pintar Parede (Retoque)', effort: 3 },
  { category: 'Extra 🔧', title: 'Organizar Dispensa', effort: 2 },
  { category: 'Extra 🔧', title: 'Limpar Parte de Cima Armários', effort: 3 },
  { category: 'Extra 🔧', title: 'Lavar Carro/Moto', effort: 3 },
  { category: 'Extra 🔧', title: 'Abastecer Carro', effort: 1 },
  { category: 'Extra 🔧', title: 'Levar Carro na Revisão', effort: 2 },
  { category: 'Extra 🔧', title: 'Planejar Cardápio da Semana', effort: 2 },
  { category: 'Extra 🔧', title: 'Fazer Lista de Compras', effort: 1 },
  { category: 'Extra 🔧', title: 'Pedir Gás/Água', effort: 1 },
  { category: 'Extra 🔧', title: 'Resolver B.O. de Internet/Luz', effort: 2 },
  { category: 'Extra 🔧', title: 'Costurar Botão/Rasgo', effort: 2 },
];

// --- Componente Principal ---
export default function NosDoisApp() {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedProfile = localStorage.getItem('nosdois_profile_v8');
      const savedAuth = localStorage.getItem('nosdois_auth_v8');
      
      if (savedProfile && savedAuth === 'true') {
        setProfileName(savedProfile);
        setIsAuthenticated(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Carregar dados do perfil
  useEffect(() => {
    if (user && profileName) {
        const fetchProfile = async () => {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profileName);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserProfileData(docSnap.data());
            } else {
                setUserProfileData(null); 
            }
        };
        fetchProfile();
    }
  }, [user, profileName, isEditingProfile]);

  const handleAuthSuccess = (name) => {
    setProfileName(name);
    setIsAuthenticated(true);
    localStorage.setItem('nosdois_profile_v8', name);
    localStorage.setItem('nosdois_auth_v8', 'true');
  };

  const handleLogout = () => {
    setProfileName(null);
    setIsAuthenticated(false);
    setUserProfileData(null);
    localStorage.removeItem('nosdois_profile_v8');
    localStorage.removeItem('nosdois_auth_v8');
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-rose-500 font-bold">Carregando Nós Dois...</div>;

  if (!isAuthenticated) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

  // Se estiver autenticado mas sem perfil, ou se estiver editando perfil
  if ((isAuthenticated && !userProfileData) || isEditingProfile) {
      return (
        <ProfileSetup 
            user={user} 
            profileName={profileName} 
            existingData={userProfileData}
            onComplete={() => {
                setIsEditingProfile(false);
                const fetchProfile = async () => {
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profileName);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) setUserProfileData(docSnap.data());
                };
                fetchProfile();
            }} 
        />
      );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-2xl overflow-hidden font-sans">
      <Header profileName={profileName} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'dashboard' && <Dashboard user={user} profileName={profileName} setActiveTab={setActiveTab} />}
        {activeTab === 'financas' && <Finances user={user} profileName={profileName} />}
        {activeTab === 'tarefas' && <Chores user={user} profileName={profileName} />}
        {activeTab === 'mercado' && <MarketList user={user} profileName={profileName} />}
        {activeTab === 'calendario' && <SharedCalendar user={user} profileName={profileName} />}
        {activeTab === 'conflitos' && <Conflicts user={user} profileName={profileName} />}
        {activeTab === 'curiosidades' && <Curiosities user={user} onEditProfile={() => setIsEditingProfile(true)} />}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// --- Autenticação (Login e Registro) ---

function AuthScreen({ onAuthSuccess }) {
    const [mode, setMode] = useState('login'); 
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNameChange = (e) => {
        // Bloqueia espaços
        const val = e.target.value.replace(/\s/g, '');
        setName(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!name || !password) throw new Error("Preencha todos os campos.");
            
            const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', name);
            const userDoc = await getDoc(userDocRef);

            if (mode === 'register') {
                if (userDoc.exists()) throw new Error("Este nome de usuário já existe.");
                if (password.length < 4) throw new Error("Senha deve ter no mínimo 4 caracteres.");
                
                await setDoc(userDocRef, {
                    username: name,
                    password: password,
                    createdAt: serverTimestamp()
                });
                onAuthSuccess(name);
            } else {
                if (!userDoc.exists()) throw new Error("Usuário não encontrado. Crie uma conta.");
                const data = userDoc.data();
                if (data.password !== password) throw new Error("Senha incorreta.");
                onAuthSuccess(name);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-rose-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
                <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4 fill-rose-100" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Hebert & Juan</h1>
                <p className="text-sm text-gray-500 mb-6">
                    {mode === 'login' ? 'Entre para acessar sua área.' : 'Crie seu perfil para começar.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Seu Nome (Sem espaços)</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Ex: Mauricio"
                            className="w-full border p-3 rounded-xl outline-none focus:border-rose-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Senha (Alfanumérica)</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha secreta"
                                className="w-full border p-3 rounded-xl outline-none focus:border-rose-500"
                            />
                            <Lock className="absolute right-3 top-3 text-gray-400" size={18} />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-rose-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button 
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                        className="text-sm text-rose-500 font-semibold hover:underline"
                    >
                        {mode === 'login' ? 'Não tem cadastro? Crie agora' : 'Já tem conta? Fazer Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProfileSetup({ user, profileName, existingData, onComplete }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        income: '', age: '', color: '', music: '', relationshipView: '', difficulties: '', loveQuizAnswers: {}
    });

    useEffect(() => {
        if (existingData) {
            setFormData({
                income: existingData.income || '',
                age: existingData.age || '',
                color: existingData.color || '',
                music: existingData.music || '',
                relationshipView: existingData.relationshipView || '',
                difficulties: existingData.difficulties || '',
                loveQuizAnswers: existingData.loveQuizAnswers || {}
            });
        }
    }, [existingData]);

    const handleSave = async () => {
        const dominantLanguage = formData.loveQuizAnswers['q1'] || 'Tempo de Qualidade'; 
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profileName), {
            ...formData,
            loveLanguage: dominantLanguage,
            profileCompleted: true,
            updatedAt: serverTimestamp()
        });
        onComplete();
    };

    return (
        <div className="h-screen bg-white p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold text-rose-500 mb-2">{existingData ? 'Editar Perfil' : 'Configurando Perfil'}</h1>
            <p className="text-gray-500 mb-6 text-sm">Olá, {profileName}! Para que a justiça do app funcione, precisamos de alguns dados.</p>
            
            {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                    <h2 className="font-bold text-lg text-gray-800">1. Financeiro (Regra 80/20)</h2>
                    <p className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-100">
                        O sistema usa sua renda líquida para calcular quanto você deve pagar das contas comuns. Isso garante que quem ganha mais, contribui mais, mas de forma proporcional.
                    </p>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Sua Renda Mensal Líquida (R$)</label>
                        <input type="number" className="w-full border-2 border-gray-200 p-3 rounded-xl text-lg outline-none focus:border-rose-500" placeholder="0.00" value={formData.income} onChange={e=>setFormData({...formData, income: e.target.value})} />
                    </div>
                    <button onClick={()=>setStep(2)} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold mt-4">Próximo</button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                    <h2 className="font-bold text-lg text-gray-800">2. Gostos Pessoais</h2>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Idade</label>
                        <input type="number" className="w-full border p-2 rounded" value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Cor Preferida</label>
                        <input type="text" className="w-full border p-2 rounded" value={formData.color} onChange={e=>setFormData({...formData, color: e.target.value})} />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500">Músicas/Bandas</label>
                        <textarea className="w-full border p-2 rounded" value={formData.music} onChange={e=>setFormData({...formData, music: e.target.value})} />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={()=>setStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Voltar</button>
                        <button onClick={()=>setStep(3)} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold">Próximo</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                    <h2 className="font-bold text-lg text-gray-800">3. Sentimentos</h2>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Visão do relacionamento hoje</label>
                        <textarea className="w-full border p-2 rounded h-20" placeholder="Seja sincero..." value={formData.relationshipView} onChange={e=>setFormData({...formData, relationshipView: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Maior dificuldade atual</label>
                        <textarea className="w-full border p-2 rounded h-20" placeholder="Ex: Divisão de tarefas, Tempo junto..." value={formData.difficulties} onChange={e=>setFormData({...formData, difficulties: e.target.value})} />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={()=>setStep(2)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Voltar</button>
                        <button onClick={()=>setStep(4)} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold">Próximo</button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                    <h2 className="font-bold text-lg text-gray-800">4. Linguagem do Amor</h2>
                    <p className="text-sm text-gray-600">Como você prefere receber carinho?</p>
                    <div className="space-y-2">
                        {['Palavras de Afirmação', 'Tempo de Qualidade', 'Presentes', 'Atos de Serviço', 'Toque Físico'].map(opt => (
                            <button key={opt} onClick={() => setFormData({...formData, loveQuizAnswers: { q1: opt }})} className={`w-full p-3 rounded border text-left ${formData.loveQuizAnswers.q1 === opt ? 'bg-rose-100 border-rose-500 font-bold' : 'bg-white'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={()=>setStep(3)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Voltar</button>
                        <button onClick={handleSave} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold">Salvar Perfil</button>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Dashboard e Funcionalidades ---

function Dashboard({ user, profileName, setActiveTab }) {
    const [daysWithoutFight, setDaysWithoutFight] = useState(0);
    const quote = useMemo(() => DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length], []);

    useEffect(() => {
        if (!user) return;
        const q = collection(db, 'artifacts', appId, 'public', 'data', 'conflicts');
        const unsub = onSnapshot(q, (snapshot) => {
          const dates = snapshot.docs
            .map(d => d.data().createdAt?.seconds)
            .filter(Boolean)
            .sort((a, b) => b - a);
          
          if (dates.length > 0) {
            const lastDate = new Date(dates[0] * 1000);
            const now = new Date();
            const diffTime = Math.abs(now - lastDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
            setDaysWithoutFight(diffDays);
          } else {
            setDaysWithoutFight(365); // Default se não houver brigas
          }
        });
    
        return () => unsub();
    }, [user]);

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Banner Romeu */}
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <Dog className="absolute bottom-0 right-4 text-white/20" size={80} />
          <h2 className="text-lg font-medium opacity-90">Olá, {profileName}!</h2>
          <p className="text-xl font-bold mt-1">Como está o Romeu hoje?</p>
          <div className="mt-3 bg-white/20 p-2 rounded-lg inline-flex items-center gap-2">
            <Smile size={18} className="text-yellow-300" />
            <span className="font-bold">{daysWithoutFight} dias</span>
            <span className="text-sm">sem brigas! 🎉</span>
          </div>
        </div>
  
        {/* Mensagem do Dia */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
            <h3 className="text-blue-800 font-bold text-xs uppercase mb-1">Dica / Piada do Dia</h3>
            <p className="text-blue-900 italic text-sm">"{quote}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DashboardCard icon={Dog} color="bg-orange-100 text-orange-600" title="Tarefas" subtitle="Romeu & Casa" onClick={() => setActiveTab('tarefas')} />
          <DashboardCard icon={DollarSign} color="bg-green-100 text-green-600" title="Finanças" subtitle="Regra 80/20" onClick={() => setActiveTab('financas')} />
          <DashboardCard icon={ShoppingCart} color="bg-blue-100 text-blue-600" title="Mercado" subtitle="Lista de Compras" onClick={() => setActiveTab('mercado')} />
          <DashboardCard icon={Sparkles} color="bg-purple-100 text-purple-600" title="Perfil" subtitle="Curiosidades" onClick={() => setActiveTab('curiosidades')} />
        </div>
      </div>
    );
}

function DashboardCard({ icon: Icon, color, title, subtitle, onClick }) {
    return (
      <button onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start hover:bg-gray-50 transition text-left active:scale-95">
        <div className={`p-2 rounded-lg mb-3 ${color}`}><Icon size={24} /></div>
        <span className="font-bold text-gray-800">{title}</span>
        <span className="text-xs text-gray-500">{subtitle}</span>
      </button>
    );
}

function Chores({ user, profileName }) {
    const [items, setItems] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Estados para adicionar tarefa manualmente
    const [manualTask, setManualTask] = useState('');
    const [manualEffort, setManualEffort] = useState('1');
    const [manualAssignee, setManualAssignee] = useState('Ambos');

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'chores'), orderBy('completed')), (snap) => {
            setItems(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });
        return () => unsub();
    }, [user]);

    const addManualTask = async (e) => {
        e.preventDefault();
        if (!manualTask) return;
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chores'), {
            title: manualTask,
            category: 'Personalizado',
            effort: parseInt(manualEffort),
            assignedTo: manualAssignee,
            completed: false,
            completedBy: null,
            createdAt: serverTimestamp()
        });
        setManualTask('');
    };

    const addSuggestedTask = async (task) => {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chores'), {
            title: task.title,
            category: task.category,
            effort: task.effort,
            assignedTo: 'Ambos',
            completed: false,
            completedBy: null,
            createdAt: serverTimestamp()
        });
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const toggle = async (item) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'chores', item.id), {
            completed: !item.completed,
            completedBy: !item.completed ? profileName : null 
        });
    };

    const deleteItem = async (id) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'chores', id));
    };

    const balance = useMemo(() => {
        let hebertPoints = 0;
        let juanPoints = 0;
        items.forEach(i => {
            if (i.completed && i.completedBy) {
                let pts = i.effort || 1;
                if (i.completedBy === 'Hebert') hebertPoints += pts;
                if (i.completedBy === 'Juan') juanPoints += pts;
            }
        });
        const total = hebertPoints + juanPoints || 1;
        return { hebert: hebertPoints, juan: juanPoints, total };
    }, [items]);

    const filteredSuggestions = SUGGESTED_TASKS.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 animate-fadeIn relative">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Dog size={20}/> Manutenção & Romeu</h2>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                <h3 className="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle size={14}/> Justiçômetro (Esforço Real)
                </h3>
                <p className="text-[10px] text-indigo-500 mb-2">
                    Contando apenas tarefas que a empregada não faz.
                </p>
                <div className="flex h-4 bg-gray-300 rounded-full overflow-hidden relative">
                    <div style={{width: `${(balance.hebert / balance.total) * 100}%`}} className="bg-indigo-500 transition-all duration-500"></div>
                    <div style={{width: `${(balance.juan / balance.total) * 100}%`}} className="bg-teal-500 transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-xs mt-1 font-bold">
                    <span className="text-indigo-600">Hebert: {balance.hebert} pts</span>
                    <span className="text-teal-600">Juan: {balance.juan} pts</span>
                </div>
            </div>

            {/* Ação Principal: Banco de Tarefas */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">Adicionar Tarefa</h3>
                
                {!showSuggestions ? (
                    <button 
                        onClick={() => setShowSuggestions(true)}
                        className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-rose-600 transition"
                    >
                        <List size={20} /> Buscar no Banco de Tarefas (100+)
                    </button>
                ) : (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 animate-fadeIn">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-600 text-xs uppercase">Selecione uma tarefa:</span>
                            <button onClick={()=>setShowSuggestions(false)} className="text-gray-400 hover:text-red-500"><X size={18}/></button>
                        </div>
                        
                        <div className="relative mb-2">
                            <input 
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Filtrar (ex: banheiro, louça...)"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 outline-none text-sm"
                            />
                            <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
                        </div>

                        <div className="max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-100">
                            {filteredSuggestions.map((task, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => addSuggestedTask(task)}
                                    className="w-full text-left p-3 border-b last:border-0 hover:bg-rose-50 flex justify-between items-center group"
                                >
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{task.category}</span>
                                        <span className="text-gray-800 text-sm font-medium">{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-1.5 rounded">
                                            {task.effort === 3 ? 'Pesado' : task.effort === 2 ? 'Médio' : 'Leve'}
                                        </span>
                                        <Plus size={16} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                            {filteredSuggestions.length === 0 && (
                                <div className="p-4 text-center text-gray-400 text-xs">Nenhuma tarefa encontrada no banco.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Secundário: Manual */}
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <details className="group">
                        <summary className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-rose-500 flex items-center gap-1 list-none">
                            <Plus size={14}/> Não encontrou o que precisava? Adicionar manualmente
                        </summary>
                        <form onSubmit={addManualTask} className="mt-3 space-y-2 animate-fadeIn">
                             <input 
                                value={manualTask} onChange={e => setManualTask(e.target.value)}
                                placeholder="Digite o nome da tarefa..."
                                className="w-full border p-2 rounded text-sm outline-none focus:border-rose-500"
                            />
                            <div className="flex gap-2">
                                <select value={manualEffort} onChange={e => setManualEffort(e.target.value)} className="w-1/3 border p-2 rounded text-sm bg-white">
                                    <option value="1">Leve (1)</option>
                                    <option value="2">Médio (2)</option>
                                    <option value="3">Pesado (3)</option>
                                </select>
                                <select value={manualAssignee} onChange={e => setManualAssignee(e.target.value)} className="w-2/3 border p-2 rounded text-sm bg-white">
                                    <option value="Ambos">Para Ambos</option>
                                    <option value="Hebert">Para Hebert</option>
                                    <option value="Juan">Para Juan</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 py-2 rounded text-sm font-bold">Adicionar Manualmente</button>
                        </form>
                    </details>
                </div>
            </div>

            <div className="space-y-2 pb-20">
                {items.map(item => (
                <div key={item.id} className={`p-3 rounded-lg border flex items-center justify-between ${item.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={() => toggle(item)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                        {item.completed && <Check size={14} />}
                    </button>
                    <div className="flex flex-col">
                        <span className={`font-medium text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.title}</span>
                         <div className="flex gap-1 mt-0.5">
                            {item.category && <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">{item.category}</span>}
                            <span className="text-[10px] text-orange-500">
                                {[...Array(parseInt(item.effort || 1))].map((_, i) => "🧹").join('')}
                            </span>
                        </div>
                    </div>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
                ))}
                {items.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">Nenhuma tarefa ativa.</p>}
            </div>
        </div>
    );
}

function MarketList({ user, profileName }) {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'shopping_list'), orderBy('completed')), (snap) => {
            setItems(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });
        return () => unsub();
    }, [user]);

    const add = async (e) => {
        e.preventDefault();
        if (!newItem) return;
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'shopping_list'), {
            title: newItem,
            completed: false,
            createdAt: serverTimestamp()
        });
        setNewItem('');
    };

    const toggle = async (item) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'shopping_list', item.id), {
            completed: !item.completed
        });
    };

    const deleteItem = async (id) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'shopping_list', id));
    };

    return (
        <div className="space-y-4 animate-fadeIn pb-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={20}/> Lista de Compras</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={add} className="flex gap-2">
                    <input 
                        value={newItem} onChange={e => setNewItem(e.target.value)}
                        placeholder="O que falta na geladeira?"
                        className="flex-1 border p-2 rounded text-sm focus:ring-2 outline-none"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 rounded font-bold">+</button>
                </form>
            </div>

            <div className="space-y-2">
                {items.map(item => (
                <div key={item.id} className={`p-3 rounded-lg border flex items-center justify-between ${item.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={() => toggle(item)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                        {item.completed && <Check size={14} />}
                    </button>
                    <span className={`font-medium text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.title}</span>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
                ))}
                {items.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">Tudo comprado! 🛒</p>}
            </div>
        </div>
    );
}

function Finances({ user, profileName }) {
    const [fixedBills, setFixedBills] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', value: '', responsible: 'Proporcional', isRomeu: false });
    const [incomeRatio, setIncomeRatio] = useState({ hebert: 0.5, juan: 0.5 }); // Default 50/50

    useEffect(() => {
        if (!user) return;
        const fetchIncomes = async () => {
            const h = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', 'Hebert'));
            const j = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', 'Juan'));
            if (h.exists() && j.exists()) {
                const incomeH = parseFloat(h.data().income) || 0;
                const incomeJ = parseFloat(j.data().income) || 0;
                const total = incomeH + incomeJ;
                if (total > 0) setIncomeRatio({ hebert: incomeH / total, juan: incomeJ / total });
            }
        };
        fetchIncomes();

        const unsubFixed = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'fixed_bills'), orderBy('dueDate')), (snap) => {
            setFixedBills(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });
        return () => unsubFixed();
    }, [user]);

    const addFixedBill = async (e) => {
        e.preventDefault();
        if (!newItem.title || !newItem.value) return;
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'fixed_bills'), {
            ...newItem, value: parseFloat(newItem.value), dueDate: 10, isPaid: false
        });
        setNewItem({ title: '', value: '', responsible: 'Proporcional', isRomeu: false });
    };

    const toggleBillPaid = async (bill) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fixed_bills', bill.id), { isPaid: !bill.isPaid });
    };

    const romeuCost = useMemo(() => {
        return fixedBills.filter(b => b.isRomeu).reduce((acc, curr) => acc + curr.value, 0);
    }, [fixedBills]);

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-2"><DollarSign size={14}/> Divisão Justa (Renda)</h3>
                <div className="flex h-4 bg-gray-300 rounded-full overflow-hidden mb-2">
                    <div style={{width: `${incomeRatio.hebert * 100}%`}} className="bg-indigo-500"></div>
                    <div style={{width: `${incomeRatio.juan * 100}%`}} className="bg-teal-500"></div>
                </div>
                <div className="flex justify-between text-xs text-green-700">
                    <span>Hebert: {(incomeRatio.hebert * 100).toFixed(0)}%</span>
                    <span>Juan: {(incomeRatio.juan * 100).toFixed(0)}%</span>
                </div>
            </div>

            {romeuCost > 0 && (
                 <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-800 flex items-center gap-2"><Dog size={16}/> Custo Mensal Romeu</span>
                    <span className="text-lg font-bold text-orange-600">R$ {romeuCost.toFixed(2)}</span>
                 </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">Adicionar Despesa</h3>
                <form onSubmit={addFixedBill} className="space-y-2">
                    <input value={newItem.title} onChange={e=>setNewItem({...newItem, title: e.target.value})} placeholder="Ex: Ração Romeu, Aluguel" className="w-full border p-2 rounded text-sm" />
                    <div className="flex gap-2">
                        <input type="number" value={newItem.value} onChange={e=>setNewItem({...newItem, value: e.target.value})} placeholder="R$" className="w-1/3 border p-2 rounded text-sm" />
                        <select value={newItem.responsible} onChange={e=>setNewItem({...newItem, responsible: e.target.value})} className="w-2/3 border p-2 rounded text-sm bg-white">
                            <option value="Proporcional">Proporcional (Justo)</option>
                            <option value="50/50">Igual (50/50)</option>
                            <option value="Hebert">Só Hebert</option>
                            <option value="Juan">Só Juan</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" id="isRomeu" checked={newItem.isRomeu} onChange={e=>setNewItem({...newItem, isRomeu: e.target.checked})} />
                        <label htmlFor="isRomeu" className="flex items-center gap-1 cursor-pointer select-none"><Dog size={14}/> É gasto com o Romeu?</label>
                    </div>
                    <button type="submit" className="w-full bg-green-500 text-white py-2 rounded text-sm font-bold">Salvar</button>
                </form>
            </div>

            <div className="space-y-2 pb-20">
                {fixedBills.map(bill => {
                    let hPay = 0, jPay = 0;
                    if (bill.responsible === 'Proporcional') {
                        hPay = bill.value * incomeRatio.hebert;
                        jPay = bill.value * incomeRatio.juan;
                    } else if (bill.responsible === '50/50') { hPay = bill.value / 2; jPay = bill.value / 2; } 
                    else if (bill.responsible === 'Hebert') { hPay = bill.value; } 
                    else { jPay = bill.value; }

                    return (
                        <div key={bill.id} className={`p-3 rounded-lg border flex justify-between items-center ${bill.isPaid ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleBillPaid(bill)} className={`w-5 h-5 rounded border flex items-center justify-center ${bill.isPaid ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400'}`}>
                                    {bill.isPaid && <Check size={12} />}
                                </button>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                                        {bill.title}
                                        {bill.isRomeu && <Dog size={12} className="text-orange-500"/>}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        H: R${hPay.toFixed(0)} | J: R${jPay.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-700">R$ {bill.value.toFixed(2)}</p>
                                <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fixed_bills', bill.id))} className="text-gray-300 hover:text-red-500 text-xs">x</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Outros Componentes ---
function Curiosities({ user, onEditProfile }) {
    const [profiles, setProfiles] = useState({});
    useEffect(() => {
        if (!user) return;
        const fetchProfiles = async () => {
            const hSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', 'Hebert'));
            const jSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', 'Juan'));
            setProfiles({ Hebert: hSnap.exists() ? hSnap.data() : null, Juan: jSnap.exists() ? jSnap.data() : null });
        };
        fetchProfiles();
    }, [user]);

    if (!profiles.Hebert || !profiles.Juan) return <div className="p-8 text-center text-gray-500">Aguardando ambos preencherem o perfil...</div>;

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg flex justify-between items-start">
                <div>
                    <h2 className="font-bold text-xl flex items-center gap-2"><Sparkles /> Raio-X do Casal</h2>
                    <p className="text-indigo-200 text-xs">Conhecendo melhor um ao outro.</p>
                </div>
                <button onClick={onEditProfile} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 text-xs flex items-center gap-1">
                    <Edit3 size={12}/> Editar Meu Perfil
                </button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Heart size={16} className="text-rose-500"/> Linguagens do Amor</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50 p-3 rounded-lg text-center">
                        <span className="block font-bold text-rose-700">Hebert</span>
                        <span className="text-sm text-gray-600">{profiles.Hebert.loveLanguage}</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <span className="block font-bold text-blue-700">Juan</span>
                        <span className="text-sm text-gray-600">{profiles.Juan.loveLanguage}</span>
                    </div>
                </div>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-2">Favoritos</h3>
                <ul className="text-sm space-y-2">
                    <li className="flex justify-between border-b pb-1">
                        <span className="text-gray-500">Cor Favorita</span>
                        <div className="flex gap-2">
                            <span className="text-rose-600 font-medium">{profiles.Hebert.color}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-blue-600 font-medium">{profiles.Juan.color}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}

function Conflicts({ user, profileName }) {
    const [conflicts, setConflicts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', feelings: '', solution: '' });
  
    useEffect(() => {
      if (!user) return;
      const ref = collection(db, 'artifacts', appId, 'public', 'data', 'conflicts');
      const unsubscribe = onSnapshot(query(ref, orderBy('createdAt', 'desc')), (snapshot) => {
        setConflicts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }, [user]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.title) return;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'conflicts'), {
        ...formData, createdBy: profileName, status: 'open', createdAt: serverTimestamp()
      });
      setFormData({ title: '', feelings: '', solution: '' });
      setShowForm(false);
    };

    const resolve = async (id, winner) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'conflicts', id), { status: 'resolved', winner });
    }
  
    return (
      <div className="space-y-4 animate-fadeIn pb-20">
        <div className="bg-purple-600 text-white p-4 rounded-xl shadow mb-4">
            <h2 className="font-bold flex items-center gap-2"><MessageCircle/> DR & Diálogo</h2>
            <p className="text-xs opacity-80 mt-1">Lugar seguro para desabafar e resolver.</p>
        </div>
        {!showForm ? (
             <button onClick={() => setShowForm(true)} className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-50"><Plus /> Nova Conversa</button>
        ) : (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-purple-200 space-y-3">
                <input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="Motivo..." className="w-full border p-2 rounded"/>
                <textarea value={formData.feelings} onChange={e=>setFormData({...formData, feelings: e.target.value})} placeholder="Eu sinto que..." className="w-full border p-2 rounded h-20"/>
                <textarea value={formData.solution} onChange={e=>setFormData({...formData, solution: e.target.value})} placeholder="Solução proposta..." className="w-full border p-2 rounded h-20"/>
                <div className="flex gap-2"><button type="button" onClick={()=>setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancelar</button><button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded font-bold">Enviar</button></div>
            </form>
        )}
        {conflicts.map(c => (
            <div key={c.id} className={`bg-white p-4 rounded-xl border-l-4 shadow-sm ${c.status === 'open' ? 'border-purple-500' : 'border-green-500 opacity-60'}`}>
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-gray-500">{c.createdBy}</span>{c.status==='open' && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Aberto</span>}</div>
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{c.feelings}</p>
                {c.status === 'open' && (
                    <div className="mt-3 pt-3 border-t flex gap-2">
                        <p className="text-xs text-gray-400 w-full text-center my-auto">Quem tem razão?</p>
                        <button onClick={()=>resolve(c.id, 'Hebert')} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">Hebert</button>
                        <button onClick={()=>resolve(c.id, 'Juan')} className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded">Juan</button>
                        <button onClick={()=>resolve(c.id, 'Ambos')} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Ambos</button>
                    </div>
                )}
            </div>
        ))}
      </div>
    );
}

function SharedCalendar({ user, profileName }) {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'compromisso' });
    useEffect(() => {
      if (!user) return;
      const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'calendar'), orderBy('date')), (snap) => {
        setEvents(snap.docs.map(d => ({id: d.id, ...d.data()})));
      });
      return () => unsub();
    }, [user]);
  
    const addEvent = async (e) => {
      e.preventDefault();
      if(!newEvent.title || !newEvent.date) return;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'calendar'), newEvent);
      setNewEvent({ title: '', date: '', type: 'compromisso' });
    };
  
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><CalendarIcon size={18}/> Novo Compromisso</h3>
          <form onSubmit={addEvent} className="space-y-2">
              <input type="text" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} placeholder="O que vamos fazer?" className="w-full border p-2 rounded text-sm"/>
              <div className="flex gap-2">
                  <input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent, date: e.target.value})} className="w-1/2 border p-2 rounded text-sm"/>
                  <select value={newEvent.type} onChange={e=>setNewEvent({...newEvent, type: e.target.value})} className="w-1/2 border p-2 rounded text-sm bg-white">
                      <option value="compromisso">Geral</option>
                      <option value="medico">Médico</option>
                      <option value="festa">Festa/Social</option>
                      <option value="viagem">Viagem</option>
                  </select>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded font-bold text-sm">Agendar</button>
          </form>
        </div>
        <div className="space-y-3 pb-20">
          {events.map(ev => (
              <div key={ev.id} className="bg-white p-3 rounded-lg border-l-4 border-orange-400 shadow-sm flex justify-between items-center">
                  <div>
                      <p className="text-gray-800 font-bold">{ev.title}</p>
                      <p className="text-sm text-gray-500">{new Date(ev.date).toLocaleDateString()} <span className="text-xs bg-gray-100 px-1 rounded ml-2 uppercase">{ev.type}</span></p>
                  </div>
                  <button onClick={()=>deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'calendar', ev.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
          ))}
        </div>
      </div>
    );
}

function Header({ profileName, onLogout }) {
    const today = new Date();
    const isAnniversary = today.getDate() === 24;
    return (
      <header className={`${isAnniversary ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-500' : 'bg-rose-500'} text-white p-4 shadow-md z-10`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Heart className={`fill-white ${isAnniversary ? 'animate-bounce' : 'animate-pulse'}`} size={24} />
            <h1 className="text-xl font-bold">Hebert & Juan</h1>
          </div>
          <button onClick={onLogout} className="text-xs bg-rose-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-rose-800 transition">
            <User size={12} /> {profileName} <LogOut size={10} className="ml-1"/>
          </button>
        </div>
        {isAnniversary && (
          <div className="text-xs bg-white/20 p-2 rounded text-center font-bold animate-pulse">
            🎉 Feliz dia 24! Feliz aniversário de namoro! 🎉
          </div>
        )}
      </header>
    );
}

function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-white border-t border-gray-200 flex justify-between items-end p-2 fixed bottom-0 w-full max-w-md z-20 pb-safe px-2 text-[10px]">
      <NavBtn icon={Home} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
      <NavBtn icon={DollarSign} label="Finanças" active={activeTab === 'financas'} onClick={() => setActiveTab('financas')} />
      <NavBtn icon={Dog} label="Tarefas" active={activeTab === 'tarefas'} onClick={() => setActiveTab('tarefas')} />
      <NavBtn icon={ShoppingCart} label="Mercado" active={activeTab === 'mercado'} onClick={() => setActiveTab('mercado')} />
      <NavBtn icon={Sparkles} label="Perfil" active={activeTab === 'curiosidades'} onClick={() => setActiveTab('curiosidades')} />
      <NavBtn icon={MessageCircle} label="DR" active={activeTab === 'conflitos'} onClick={() => setActiveTab('conflitos')} />
    </nav>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
    return (
      <button onClick={onClick} className={`flex flex-col items-center p-2 w-[16%] transition-all ${active ? 'text-rose-500 -translate-y-1' : 'text-gray-400'}`}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className="mt-1 font-medium truncate w-full text-center">{label}</span>
      </button>
    );
  }