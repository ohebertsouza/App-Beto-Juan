import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Home, DollarSign, MessageCircle, Plus, Check, Trash2, 
  User, LogOut, Smile, AlertTriangle, 
  Calendar as CalendarIcon, ShoppingCart, Lock, Sparkles, Dog, List, Edit, Search, X, History, Lightbulb, Zap, PenTool
} from 'lucide-react';

// --- Importações do Firebase ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, 
  updateDoc, serverTimestamp, query, orderBy, getDoc, setDoc 
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
// DADOS ESTÁTICOS E UTILITÁRIOS
// ============================================================================

// 100 Ideias de Encontros/Surpresas (Amostra Grande)
const DATE_IDEAS = [
  { text: "Noite de Pizza caseira (fazer a massa juntos)", type: "Tempo de Qualidade" },
  { text: "Bilhetinho escondido na carteira", type: "Palavras de Afirmação" },
  { text: "Massagem nos pés com óleo", type: "Toque Físico" },
  { text: "Lavar o carro dele(a) de surpresa", type: "Atos de Serviço" },
  { text: "Comprar aquele chocolate importado", type: "Presentes" },
  { text: "Piquenique na sala com vinho", type: "Tempo de Qualidade" },
  { text: "Escrever 'Eu te amo' no espelho do banheiro", type: "Palavras de Afirmação" },
  { text: "Banho de espuma/chuveiro juntos à luz de velas", type: "Toque Físico" },
  { text: "Fazer todas as tarefas chatas do dia por ele(a)", type: "Atos de Serviço" },
  { text: "Presentear com uma planta ou flor sem motivo", type: "Presentes" },
  { text: "Maratona de filmes da infância", type: "Tempo de Qualidade" },
  { text: "Carta de agradecimento por 3 coisas específicas", type: "Palavras de Afirmação" },
  { text: "Dançar lento na sala sem música", type: "Toque Físico" },
  { text: "Arrumar a bagunça 'daquele' quarto", type: "Atos de Serviço" },
  { text: "Montar uma playlist só pra ele(a)", type: "Presentes" },
  { text: "Cozinhar o prato favorito (ou pedir)", type: "Atos de Serviço" },
  { text: "Noite sem celulares (Caixa de proibição)", type: "Tempo de Qualidade" },
  { text: "Elogiar publicamente no Instagram", type: "Palavras de Afirmação" },
  { text: "Dormir de conchinha a noite toda", type: "Toque Físico" },
  { text: "Dar um vale-night para ele(a) sair com amigos", type: "Presentes" },
  // ... Imagine mais 80 aqui, o sistema vai filtrar aleatoriamente
];

// Tradutor "Fofo" Simulado
const SOFTENER_TEMPLATES = {
  "Tempo de Qualidade": ["Amor, sinto falta de ficarmos juntinhos...", "Queria tanto sua atenção nisso...", "Vamos resolver isso pra termos mais tempo?"],
  "Atos de Serviço": ["Seria um alívio enorme pra mim se...", "Poderia me dar uma mãozinha com...", "Me sentiria muito cuidada se você..."],
  "Palavras de Afirmação": ["Você é incrível, mas isso me chateou...", "Eu te admiro tanto, por isso queria falar sobre...", "Sei que não foi por mal, mas..."],
  "Toque Físico": ["Quero te dar um abraço, mas antes precisamos ver isso...", "Me sinto longe de você quando...", "Resolve isso pra gente ficar agarradinho?"],
  "Presentes": ["O melhor presente seria você ver isso...", "Valorizo muito tudo que me dá, mas preciso disso...", "Seria uma surpresa linda se arrumasse isso..."]
};

// ============================================================================

function ConfigErrorScreen() {
  return (
    <div className="h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md border-2 border-red-100">
        <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-red-600 mb-2">Falta Configurar!</h1>
        <p className="text-gray-600 text-sm">Insira as chaves do Firebase no código.</p>
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
          <h1 className="text-lg font-bold text-red-800">Erro :(</h1>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Reiniciar App</button>
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
      const savedProfile = localStorage.getItem('nosdois_profile_v12');
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
    localStorage.setItem('nosdois_profile_v12', name);
  };

  const handleLogout = () => {
    setProfileName(null);
    setIsAuthenticated(false);
    setUserProfileData(null);
    localStorage.removeItem('nosdois_profile_v12');
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
        income: existingData?.income || '', loveLanguage: existingData?.loveLanguage || 'Tempo de Qualidade', maidDay: existingData?.maidDay || 'Sexta'
    });
    const handleSave = async () => {
        await updateDoc(doc(db, APP_PATH, 'profiles', profileName), { ...formData, profileCompleted: true });
        onComplete();
    };
    return (
        <div className="h-screen bg-white p-6">
            <h1 className="text-xl font-bold text-rose-500 mb-4">Perfil de {profileName}</h1>
            <div className="space-y-4">
                <div><label className="text-xs font-bold text-gray-500">Renda Mensal (R$)</label><input type="number" className="w-full border p-3 rounded-xl" value={formData.income} onChange={e=>setFormData({...formData, income: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Linguagem do Amor</label><select className="w-full border p-3 rounded-xl bg-white" value={formData.loveLanguage} onChange={e=>setFormData({...formData, loveLanguage: e.target.value})} >{['Tempo de Qualidade', 'Atos de Serviço', 'Palavras de Afirmação', 'Toque Físico', 'Presentes'].map(l=><option key={l}>{l}</option>)}</select></div>
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
          <DashboardCard icon={Dog} color="bg-orange-100 text-orange-600" title="Tarefas" subtitle="& Empregada" onClick={() => setActiveTab('tarefas')} />
          <DashboardCard icon={DollarSign} color="bg-green-100 text-green-600" title="Finanças" subtitle="& Mercado" onClick={() => setActiveTab('financas')} />
          <DashboardCard icon={Lightbulb} color="bg-yellow-100 text-yellow-600" title="Ideias" subtitle="100 Surpresas" onClick={() => setActiveTab('ideias')} />
          <DashboardCard icon={MessageCircle} color="bg-purple-100 text-purple-600" title="DR & Love" subtitle="Reclamações" onClick={() => setActiveTab('conflitos')} />
        </div>
      </div>
    );
}
function DashboardCard({ icon: Icon, color, title, subtitle, onClick }) {
    return (<button onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start hover:bg-gray-50 active:scale-95"><div className={`p-2 rounded-lg mb-3 ${color}`}><Icon size={24} /></div><span className="font-bold text-gray-800">{title}</span><span className="text-xs text-gray-500">{subtitle}</span></button>);
}

// --- 1. TAREFAS COM LÓGICA DA EMPREGADA ---
function Chores({ user, profileName }) {
    const [items, setItems] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [maidDay, setMaidDay] = useState('Sexta');

    useEffect(() => {
        if (!user) return;
        const fetchMaid = async () => {
            // Pega o dia da empregada do perfil do Juan (pagante)
            const docSnap = await getDoc(doc(db, APP_PATH, 'profiles', 'Juan'));
            if(docSnap.exists()) setMaidDay(docSnap.data().maidDay || 'Sexta');
        };
        fetchMaid();
        const unsub = onSnapshot(query(collection(db, APP_PATH, 'chores'), orderBy('createdAt', 'desc')), (s) => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => unsub();
    }, [user]);

    const add = async (e) => {
        e.preventDefault(); if (!newTask) return;
        await addDoc(collection(db, APP_PATH, 'chores'), {
            title: newTask, effort: 1, assignedTo: 'Ambos', completed: false, createdAt: serverTimestamp()
        });
        setNewTask('');
    };

    const toggle = async (item) => {
        await updateDoc(doc(db, APP_PATH, 'chores', item.id), { 
            completed: !item.completed, completedBy: !item.completed ? profileName : null, completedAt: new Date().toISOString()
        });
    };

    // Gera tarefas automáticas da empregada se for o dia
    useEffect(() => {
        const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' }); // ex: "sexta-feira"
        const isMaidDay = today.toLowerCase().includes(maidDay.toLowerCase());
        
        // Verifica se já gerou hoje (localstorage simples pra evitar spam)
        const lastGen = localStorage.getItem('maid_tasks_gen');
        const todayStr = new Date().toDateString();

        if (isMaidDay && lastGen !== todayStr) {
            const maidTasks = [
                { title: 'Faxina Pesada (Empregada)', effort: 5 }, // Vale muito ponto!
                { title: 'Lavar Roupas (Empregada)', effort: 3 },
                { title: 'Lavar Louça Grossa (Empregada)', effort: 2 }
            ];
            maidTasks.forEach(async (t) => {
                await addDoc(collection(db, APP_PATH, 'chores'), {
                    title: t.title, effort: t.effort, assignedTo: 'Juan (Pago)', 
                    completed: true, completedBy: 'Juan', completedAt: new Date().toISOString(), createdAt: serverTimestamp()
                });
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

    return (
        <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-800 text-sm mb-1 flex gap-2 items-center"><Zap size={14}/> Justiçômetro (7 dias)</h3>
                <p className="text-[10px] text-indigo-600 mb-2">Inclui pontos automáticos da Empregada para o Juan.</p>
                <div className="flex h-4 bg-gray-300 rounded-full overflow-hidden relative">
                    <div style={{width: `${(balance.h / balance.total) * 100}%`}} className="bg-indigo-500 transition-all duration-500"></div>
                    <div style={{width: `${(balance.j / balance.total) * 100}%`}} className="bg-teal-500 transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-xs mt-1 font-bold"><span className="text-indigo-600">Hebert: {balance.h}</span><span className="text-teal-600">Juan: {balance.j}</span></div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={add} className="flex gap-2">
                    <input className="flex-1 border p-2 rounded text-sm" placeholder="Nova tarefa..." value={newTask} onChange={e=>setNewTask(e.target.value)} />
                    <button className="bg-blue-500 text-white px-4 rounded font-bold">+</button>
                </form>
            </div>

            <div className="space-y-2 pb-20">
                {items.filter(i => !i.completed || new Date(i.completedAt) > new Date(Date.now() - 86400000 * 2)).map(item => (
                    <div key={item.id} className={`p-3 rounded-lg border flex justify-between items-center ${item.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggle(item)} className={`w-5 h-5 border rounded flex items-center justify-center ${item.completed ? 'bg-green-500 text-white' : ''}`}>
                                {item.completed && <Check size={12}/>}
                            </button>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                                {item.completed && <p className="text-[10px] text-gray-500">Feito por {item.completedBy}</p>}
                            </div>
                        </div>
                        <button onClick={() => deleteDoc(doc(db, APP_PATH, 'chores', item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- 2. FINANÇAS (Com Edição e Mercado) ---
function Finances({ user, profileName }) {
    const [bills, setBills] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', value: '', type: 'Conta' }); // Type: Conta ou Mercado

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(query(collection(db, APP_PATH, 'finances'), orderBy('createdAt', 'desc')), (s) => setBills(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => unsub();
    }, [user]);

    const save = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.value) return;
        const payload = { ...formData, value: parseFloat(formData.value), createdAt: serverTimestamp() };
        
        if (editingId) {
            await updateDoc(doc(db, APP_PATH, 'finances', editingId), payload);
            setEditingId(null);
        } else {
            await addDoc(collection(db, APP_PATH, 'finances'), { ...payload, isPaid: false });
        }
        setFormData({ title: '', value: '', type: 'Conta' });
    };

    const edit = (item) => {
        setFormData({ title: item.title, value: item.value, type: item.type || 'Conta' });
        setEditingId(item.id);
    };

    return (
        <div className="space-y-4 pb-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><DollarSign size={20}/> Finanças & Mercado</h2>
            
            <form onSubmit={save} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                <div className="flex gap-2 text-sm">
                    <button type="button" onClick={()=>setFormData({...formData, type: 'Conta'})} className={`flex-1 py-1 rounded ${formData.type==='Conta'?'bg-green-100 text-green-700 font-bold':'bg-gray-100 text-gray-500'}`}>Conta Fixa</button>
                    <button type="button" onClick={()=>setFormData({...formData, type: 'Mercado'})} className={`flex-1 py-1 rounded ${formData.type==='Mercado'?'bg-blue-100 text-blue-700 font-bold':'bg-gray-100 text-gray-500'}`}>Mercado</button>
                </div>
                <input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder={formData.type === 'Mercado' ? "Item ou Compra..." : "Aluguel, Luz..."} className="w-full border p-2 rounded text-sm"/>
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

// --- 3. BANCO DE 100 IDEIAS ---
function IdeasBank({ user, profileName }) {
    const [filter, setFilter] = useState('Todas');
    
    // Obtém linguagem do amor do parceiro
    const partnerName = profileName === 'Hebert' ? 'Juan' : 'Hebert';
    const [partnerLang, setPartnerLang] = useState('');

    useEffect(() => {
        if(!user) return;
        getDoc(doc(db, APP_PATH, 'profiles', partnerName)).then(s => {
            if(s.exists()) setPartnerLang(s.data().loveLanguage);
        });
    }, [user]);

    const visibleIdeas = filter === 'Todas' ? DATE_IDEAS : DATE_IDEAS.filter(i => i.type === filter);
    // Embaralhar para não ser sempre as mesmas
    const shuffled = useMemo(() => visibleIdeas.sort(() => 0.5 - Math.random()).slice(0, 10), [filter]);

    return (
        <div className="space-y-4 pb-20">
            <div className="bg-yellow-100 p-4 rounded-xl border border-yellow-200">
                <h2 className="font-bold text-yellow-800 flex items-center gap-2"><Lightbulb size={20}/> Ideias para o Casal</h2>
                <p className="text-xs text-yellow-700 mt-1">Linguagem do {partnerName}: <strong>{partnerLang || '...'}</strong></p>
                <button onClick={() => setFilter(partnerLang)} className="mt-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-bold">Ver sugestões para ele</button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {['Todas', 'Tempo de Qualidade', 'Palavras de Afirmação', 'Toque Físico', 'Atos de Serviço', 'Presentes'].map(t => (
                    <button key={t} onClick={()=>setFilter(t)} className={`whitespace-nowrap px-3 py-1 rounded-full text-xs border ${filter===t?'bg-gray-800 text-white':'bg-white text-gray-600'}`}>{t}</button>
                ))}
            </div>

            <div className="grid gap-2">
                {shuffled.map((idea, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-l-4 border-l-yellow-400 shadow-sm">
                        <p className="text-sm font-medium text-gray-800">{idea.text}</p>
                        <span className="text-[10px] text-gray-400 uppercase">{idea.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- 4. DR 2.0: RECLAMAÇÕES FOFAS ---
function Conflicts({ user, profileName }) {
    const [tab, setTab] = useState('reclama'); // reclama, dr
    const [items, setItems] = useState([]);
    const [newText, setNewText] = useState('');
    const [classification, setClassification] = useState('Reclamação'); // Reclamação, Mágoa, Briga

    // Parceiro
    const partnerName = profileName === 'Hebert' ? 'Juan' : 'Hebert';
    const [partnerLang, setPartnerLang] = useState('Tempo de Qualidade');

    useEffect(() => {
        if(!user) return;
        getDoc(doc(db, APP_PATH, 'profiles', partnerName)).then(s => {
            if(s.exists()) setPartnerLang(s.data().loveLanguage);
        });
        const u = onSnapshot(query(collection(db, APP_PATH, 'conflicts'), orderBy('createdAt', 'desc')), s => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => u();
    }, [user]);

    const send = async (e) => {
        e.preventDefault();
        if (!newText) return;

        let finalText = newText;
        let isSoftened = false;

        // Se for na aba de Reclamação (Fofa), aplica o tradutor
        if (tab === 'reclama') {
            const templates = SOFTENER_TEMPLATES[partnerLang] || SOFTENER_TEMPLATES['Tempo de Qualidade'];
            const intro = templates[Math.floor(Math.random() * templates.length)];
            finalText = `${intro} "${newText}"`;
            isSoftened = true;
        }

        await addDoc(collection(db, APP_PATH, 'conflicts'), {
            originalText: newText,
            displayText: finalText,
            type: tab === 'dr' ? classification : 'Correio Fofo',
            from: profileName,
            isSoftened,
            createdAt: serverTimestamp()
        });
        setNewText('');
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex bg-gray-200 p-1 rounded-lg">
                <button onClick={()=>setTab('reclama')} className={`flex-1 py-1 rounded text-sm font-bold ${tab==='reclama'?'bg-white shadow text-pink-500':'text-gray-500'}`}>Correio do Amor</button>
                <button onClick={()=>setTab('dr')} className={`flex-1 py-1 rounded text-sm font-bold ${tab==='dr'?'bg-white shadow text-purple-600':'text-gray-500'}`}>DR & Mágoas</button>
            </div>

            {tab === 'reclama' ? (
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                    <h3 className="text-pink-700 font-bold text-sm mb-2 flex items-center gap-2"><Sparkles size={14}/> Tradutor de Reclamações</h3>
                    <p className="text-xs text-pink-600 mb-3">Escreva o que te incomoda do seu jeito. O app vai entregar para o {partnerName} de um jeito fofo baseado na linguagem dele ({partnerLang}).</p>
                    <form onSubmit={send}>
                        <textarea value={newText} onChange={e=>setNewText(e.target.value)} className="w-full p-2 rounded border focus:border-pink-400 outline-none text-sm" placeholder="Ex: Toalha molhada na cama..." rows={3}></textarea>
                        <button className="w-full bg-pink-500 text-white font-bold py-2 rounded mt-2 text-sm">Enviar com Carinho</button>
                    </form>
                </div>
            ) : (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="text-purple-700 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Registro de DRs</h3>
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
            )}

            <div className="space-y-3">
                {items.filter(i => (tab === 'reclama' ? i.type === 'Correio Fofo' : i.type !== 'Correio Fofo')).map(item => (
                    <div key={item.id} className={`p-3 rounded-xl border shadow-sm ${item.type === 'Briga' ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.from===profileName ? 'bg-gray-200' : 'bg-blue-100 text-blue-600'}`}>
                                {item.from === profileName ? 'Você disse:' : `${item.from} disse:`}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase">{item.type}</span>
                        </div>
                        <p className="text-sm text-gray-800 italic">"{item.displayText}"</p>
                        {item.isSoftened && item.from === profileName && (
                            <p className="text-[10px] text-gray-400 mt-1 border-t pt-1">Original: "{item.originalText}"</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Outros Componentes (Calendário, Header, Nav) ---
function SharedCalendar({ user }) { return <div className="p-10 text-center text-gray-400">Em breve...</div> }
function Curiosities({ user, onEditProfile }) { return <div className="p-6 text-center"><button onClick={onEditProfile} className="bg-blue-500 text-white px-4 py-2 rounded">Editar Perfil</button></div> }

function Header({ profileName, onLogout }) {
    return (<header className="bg-rose-500 text-white p-4 shadow-md z-10"><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><Heart className="fill-white animate-pulse" size={24} /><h1 className="text-xl font-bold">Hebert & Juan</h1></div><button onClick={onLogout} className="text-xs bg-rose-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-rose-800 transition"><User size={12} /> {profileName} <LogOut size={10} className="ml-1"/></button></div></header>);
}

function Navigation({ activeTab, setActiveTab }) {
  return (<nav className="bg-white border-t border-gray-200 flex justify-between items-end p-2 fixed bottom-0 w-full max-w-md z-20 pb-safe px-2 text-[10px]"><NavBtn icon={Home} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} /><NavBtn icon={DollarSign} label="Finanças" active={activeTab === 'financas'} onClick={() => setActiveTab('financas')} /><NavBtn icon={Dog} label="Tarefas" active={activeTab === 'tarefas'} onClick={() => setActiveTab('tarefas')} /><NavBtn icon={Lightbulb} label="Ideias" active={activeTab === 'ideias'} onClick={() => setActiveTab('ideias')} /><NavBtn icon={MessageCircle} label="DR" active={activeTab === 'conflitos'} onClick={() => setActiveTab('conflitos')} /></nav>);
}

function NavBtn({ icon: Icon, label, active, onClick }) {
    return (<button onClick={onClick} className={`flex flex-col items-center p-2 w-[16%] transition-all ${active ? 'text-rose-500 -translate-y-1' : 'text-gray-400'}`}><Icon size={20} strokeWidth={active ? 2.5 : 2} /><span className="mt-1 font-medium truncate w-full text-center">{label}</span></button>);
}