import React, { useState, useEffect } from 'react';
import { Menu, Home as HomeIcon, BookOpen, Zap, ChevronRight, Plus, Share2, Download, X, Copy, Edit2, Trash2, AlertTriangle, LogIn, LogOut, ShieldCheck, Users } from 'lucide-react';
// ADICIONEI o arrayUnion para a importação funcionar
import { collection, addDoc, onSnapshot, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import './Home.css';

const Home = ({ onAbrirAlbum }) => {
  const [meusAlbuns, setMeusAlbuns] = useState([]); 
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [nomeNovoAlbum, setNomeNovoAlbum] = useState('');
  
  // Controle das abas inferiores
  const [abaAtiva, setAbaAtiva] = useState('inicio');

  // Estados de Edição/Exclusão
  const [albumEditando, setAlbumEditando] = useState(null);
  const [novoNomeEdicao, setNovoNomeEdicao] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Estados de Acesso (Gerenciar Compartilhamento)
  const [modalAcessoOpen, setModalAcessoOpen] = useState(null);

  // Estados de Perfil e Login
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [inputUser, setInputUser] = useState('');
  const [inputSenha, setInputSenha] = useState('');
  const [inputConfirmarSenha, setInputConfirmarSenha] = useState('');
  const [userLogado, setUserLogado] = useState(() => localStorage.getItem('we_album_user') || null);
  
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('we_album_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('we_album_device_id', id);
    }
    return id;
  });

  const meuId = userLogado || deviceId;

  // Lógica inteligente para buscar álbuns próprios E compartilhados
  useEffect(() => {
    if (meuId === 'robson') {
      const q = query(collection(db, "albuns"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, snap => setMeusAlbuns(snap.docs.map(d => ({id: d.id, ...d.data()}))));
      return () => unsub();
    } else {
      // Busca álbuns criados por mim
      const qProprios = query(collection(db, "albuns"), where("deviceId", "==", meuId));
      // Busca álbuns que outros compartilharam comigo
      const qCompartilhados = query(collection(db, "albuns"), where("compartilhadoCom", "array-contains", meuId));

      let albuns1 = [];
      let albuns2 = [];

      const updateList = () => {
        const map = new Map();
        [...albuns1, ...albuns2].forEach(a => map.set(a.id, a));
        const merged = Array.from(map.values()).sort((a,b) => b.createdAt - a.createdAt);
        setMeusAlbuns(merged);
      };

      const un1 = onSnapshot(qProprios, snap => { albuns1 = snap.docs.map(d => ({id: d.id, ...d.data()})); updateList(); });
      const un2 = onSnapshot(qCompartilhados, snap => { albuns2 = snap.docs.map(d => ({id: d.id, ...d.data()})); updateList(); });

      return () => { un1(); un2(); };
    }
  }, [meuId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const userLower = inputUser.trim().toLowerCase();
    
    if (userLower === 'robson' && inputSenha === 'supremo2026') {
      setUserLogado('robson');
      localStorage.setItem('we_album_user', 'robson');
      alert("Acesso Supremo Ativado com Sucesso!");
      setMenuOpen(false);
    } else {
      try {
        const q = query(collection(db, "usuarios"), where("usuario", "==", userLower), where("senha", "==", inputSenha));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserLogado(userLower);
          localStorage.setItem('we_album_user', userLower);
          alert(`Bem-vindo de volta, ${userLower}!`);
          setMenuOpen(false);
        } else {
          alert("Usuário ou senha incorretos.");
        }
      } catch (error) { alert("Erro ao realizar login no banco."); }
    }
    setInputUser(''); setInputSenha('');
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    const userLower = inputUser.trim().toLowerCase();
    if (inputSenha !== inputConfirmarSenha) { alert("As senhas não coincidem!"); return; }
    if (userLower === 'robson') { alert("Este nome de usuário é reservado!"); return; }

    try {
      const q = query(collection(db, "usuarios"), where("usuario", "==", userLower));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) { alert("Usuário já em uso!"); return; }

      await addDoc(collection(db, "usuarios"), { usuario: userLower, senha: inputSenha, createdAt: Date.now() });
      setUserLogado(userLower);
      localStorage.setItem('we_album_user', userLower);
      alert("Conta criada com sucesso!");
      setMenuOpen(false);
      setIsLoginMode(true);
    } catch (error) { alert("Erro ao cadastrar."); }
    setInputUser(''); setInputSenha(''); setInputConfirmarSenha('');
  };

  const handleLogout = () => {
    setUserLogado(null);
    localStorage.removeItem('we_album_user');
    setMenuOpen(false);
    setAbaAtiva('inicio');
    alert("Você saiu da conta.");
  };

  const copiarCodigo = (e, codigo) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codigo);
    alert("Código " + codigo + " copiado!");
  };

  const criarAlbum = async () => {
    if (nomeNovoAlbum.trim() === '') return;
    const duplicado = meusAlbuns.find(a => a.nome.toLowerCase() === nomeNovoAlbum.toLowerCase() && a.deviceId === meuId);
    if (duplicado) { alert("Nome duplicado!"); return; }

    try {
      await addDoc(collection(db, "albuns"), {
        nome: nomeNovoAlbum,
        codigo: Math.random().toString(36).substring(2, 10).toUpperCase(),
        deviceId: meuId, 
        compartilhadoCom: [], // Lista de usuários que importaram
        permissoes: {}, // Permissões (view/edit)
        concluido: 0,
        repetidas: 0,
        faltam: 994,
        ultimaAlteracao: 'Agora mesmo',
        createdAt: Date.now(),
        colecao: {}
      });
      setModalNovoOpen(false);
      setNomeNovoAlbum('');
    } catch (e) { alert("Erro ao criar álbum no banco."); }
  };

  const importarAlbum = async () => {
    const codigo = prompt("Digite o código de 8 dígitos do álbum:");
    if (!codigo) return;

    try {
      const q = query(collection(db, "albuns"), where("codigo", "==", codigo.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        const albumData = docRef.data();

        if (albumData.deviceId === meuId) {
           alert("Você já é o dono deste álbum!"); return;
        }
        if (albumData.compartilhadoCom && albumData.compartilhadoCom.includes(meuId)) {
           alert("Você já importou este álbum antes!"); return;
        }

        // Adiciona a pessoa na lista de importadores com permissão de visualização (view) padrão
        await updateDoc(docRef.ref, { 
           compartilhadoCom: arrayUnion(meuId),
           [`permissoes.${meuId}`]: 'view'
        });
        alert("Álbum importado com sucesso! Verifique a aba 'Álbum'.");
        setAbaAtiva('albuns'); // Joga a pessoa direto pra tela de Álbuns
      } else {
        alert("Código não encontrado.");
      }
    } catch (e) { alert("Erro ao importar."); }
  };

  const abrirModalEdicao = (e, album) => {
    e.stopPropagation(); 
    setAlbumEditando(album);
    setNovoNomeEdicao(album.nome);
    setShowConfirmDelete(false);
  };

  const salvarRenomear = async () => {
    if (novoNomeEdicao.trim() === '' || novoNomeEdicao === albumEditando.nome) { setAlbumEditando(null); return; }
    try {
      await updateDoc(doc(db, "albuns", albumEditando.id), { nome: novoNomeEdicao });
      setAlbumEditando(null);
    } catch (e) { alert("Erro ao renomear."); }
  };

  const confirmarExclusao = async () => {
    try {
      await deleteDoc(doc(db, "albuns", albumEditando.id));
      setAlbumEditando(null);
    } catch (e) { alert("Erro ao excluir."); }
  };

  const alterarPermissao = async (albumId, userId, novaPermissao) => {
    try {
      await updateDoc(doc(db, "albuns", albumId), {
        [`permissoes.${userId}`]: novaPermissao
      });
      // Atualiza o estado do modal local para ser imediato visualmente
      setModalAcessoOpen(prev => ({ ...prev, permissoes: { ...prev.permissoes, [userId]: novaPermissao } }));
    } catch (e) { alert("Erro ao alterar permissão."); }
  };

  // Separa os álbuns criados e os compartilhados
  const albunsProprios = meusAlbuns.filter(a => a.deviceId === meuId || meuId === 'robson');
  const albunsCompartilhados = meusAlbuns.filter(a => a.deviceId !== meuId && meuId !== 'robson');

  // Função para renderizar o Card sem duplicar código
  const renderAlbumCard = (album) => {
    const isOwner = album.deviceId === meuId || meuId === 'robson';
    const permissao = album.permissoes?.[meuId] || 'view';
    // Manda para o Album.jsx se o usuário atual só pode visualizar
    const bloqueiaEdicao = !isOwner && permissao !== 'edit';

    return (
      <div key={album.id} className="album-wrapper">
        <div className="album-card" onClick={() => onAbrirAlbum({ ...album, somenteLeitura: bloqueiaEdicao })}>
          <div className="album-cover"><img src="/img/capa-album.png" alt="Capa" className="album-image"/></div>
          <div className="album-info">
            <div className="album-title-row">
              <h3>{album.nome}</h3>
              {isOwner && (
                <>
                  <button className="btn-edit-icon" onClick={(e) => abrirModalEdicao(e, album)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-edit-icon" onClick={(e) => { e.stopPropagation(); setModalAcessoOpen(album); }}>
                    <Users size={16} />
                  </button>
                </>
              )}
              {!isOwner && bloqueiaEdicao && <span className="badge-leitura">Somente Leitura</span>}
            </div>

            <div className="progress-container">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${album.concluido}%` }}></div></div>
              <span className="progress-text">{album.concluido}%</span>
            </div>
            <p className="album-code" onClick={(e) => copiarCodigo(e, album.codigo)} onContextMenu={(e) => copiarCodigo(e, album.codigo)}>
              Código: <strong>{album.codigo}</strong> <Copy size={14} style={{marginLeft: '8px'}} />
            </p>
          </div>
          <ChevronRight className="arrow-icon" />
        </div>

        <div className="extra-info-home">
          <div className="info-box sticker-coladas">
            <span className="info-number">{Object.keys(album.colecao || {}).length}</span>
            <span className="info-label">Coladas</span>
          </div>
          <div className="info-box sticker-repetidas">
            <span className="info-number">{Object.values(album.colecao || {}).filter(q => q > 1).length}</span>
            <span className="info-label">Repetidas</span>
          </div>
          <div className="info-box sticker-faltam">
            <span className="info-number">{994 - Object.keys(album.colecao || {}).length}</span>
            <span className="info-label">Faltam</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      
      {/* MENU HAMBÚRGUER */}
      {menuOpen && (
        <div className="menu-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Menu Principal</h3>
              <button className="btn-fechar-drawer" onClick={() => setMenuOpen(false)}><X size={22} /></button>
            </div>
            <div className="drawer-body">
              {!userLogado ? (
                isLoginMode ? (
                  <form onSubmit={handleLogin} className="login-form">
                    <span className="login-title"><LogIn size={18} /> Fazer Login</span>
                    <input type="text" className="input-login" placeholder="Usuário Único" value={inputUser} onChange={e => setInputUser(e.target.value)} required />
                    <input type="password" className="input-login" placeholder="Senha" value={inputSenha} onChange={e => setInputSenha(e.target.value)} required />
                    <button type="submit" className="btn-concluir" style={{padding: '12px'}}>Entrar</button>
                    <p className="toggle-login-mode" onClick={() => { setIsLoginMode(false); setInputUser(''); setInputSenha(''); }}>Não tem conta? <strong>Cadastre-se</strong></p>
                  </form>
                ) : (
                  <form onSubmit={handleCadastro} className="login-form">
                    <span className="login-title"><Plus size={18} /> Criar Usuário</span>
                    <input type="text" className="input-login" placeholder="Usuário Único" value={inputUser} onChange={e => setInputUser(e.target.value)} required />
                    <input type="password" className="input-login" placeholder="Senha" value={inputSenha} onChange={e => setInputSenha(e.target.value)} required />
                    <input type="password" className="input-login" placeholder="Confirme a Senha" value={inputConfirmarSenha} onChange={e => setInputConfirmarSenha(e.target.value)} required />
                    <button type="submit" className="btn-concluir" style={{padding: '12px'}}>Cadastrar Conta</button>
                    <p className="toggle-login-mode" onClick={() => { setIsLoginMode(true); setInputUser(''); setInputSenha(''); setInputConfirmarSenha(''); }}>Já tem conta? <strong>Faça Login</strong></p>
                  </form>
                )
              ) : (
                <div className="perfil-box">
                  <div className="perfil-avatar">{userLogado.substring(0, 2).toUpperCase()}</div>
                  <h4>Olá, {userLogado}!</h4>
                  {userLogado === 'robson' && <div className="badge-supremo"><ShieldCheck size={16} /> Mestre Supremo</div>}
                  <button onClick={handleLogout} className="btn-deletar" style={{marginTop: '20px', padding: '12px'}}>
                    <LogOut size={16} style={{marginRight: '8px'}} /> Sair da Conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GERENCIAR ACESSO (O ÍCONE DE PERFIL NOS ÁLBUNS) */}
      {modalAcessoOpen && (
        <div className="modal-overlay" onClick={() => setModalAcessoOpen(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setModalAcessoOpen(null)}><X size={24} /></button>
            <h3 className="modal-title">Acesso ao Álbum</h3>
            <p className="modal-subtitle">Gerencie quem pode editar ou visualizar</p>
            
            <div className="lista-acessos">
              {modalAcessoOpen.compartilhadoCom && modalAcessoOpen.compartilhadoCom.length > 0 ? (
                modalAcessoOpen.compartilhadoCom.map(userId => (
                  <div key={userId} className="acesso-item">
                    <span className="acesso-nome">{userId}</span>
                    <select 
                      className="acesso-select"
                      value={modalAcessoOpen.permissoes?.[userId] || 'view'}
                      onChange={(e) => alterarPermissao(modalAcessoOpen.id, userId, e.target.value)}
                    >
                      <option value="view">Apenas Visualizar</option>
                      <option value="edit">Pode Editar</option>
                    </select>
                  </div>
                ))
              ) : (
                <p className="modal-subtitle">Ninguém importou este álbum ainda.</p>
              )}
            </div>
            
            <button className="btn-concluir" onClick={() => setModalAcessoOpen(null)} style={{marginTop: '20px'}}>Concluir</button>
          </div>
        </div>
      )}

      {/* OUTROS MODAIS */}
      {modalNovoOpen && (
        <div className="modal-overlay" onClick={() => setModalNovoOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setModalNovoOpen(false)}><X size={24} /></button>
            <h3 className="modal-title">Novo Álbum</h3>
            <input type="text" className="input-nome-album" placeholder="Nome do álbum" value={nomeNovoAlbum} onChange={(e) => setNomeNovoAlbum(e.target.value)} autoFocus />
            <button className="btn-concluir" onClick={criarAlbum}>Criar Álbum</button>
          </div>
        </div>
      )}

      {albumEditando && (
        <div className="modal-overlay" onClick={() => setAlbumEditando(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setAlbumEditando(null)}><X size={24} /></button>
            {!showConfirmDelete ? (
              <>
                <h3 className="modal-title">Editar Álbum</h3>
                <input type="text" className="input-nome-album" value={novoNomeEdicao} onChange={(e) => setNovoNomeEdicao(e.target.value)} autoFocus />
                <button className="btn-concluir" onClick={salvarRenomear} style={{ marginBottom: '12px' }}>Salvar Alterações</button>
                <button className="btn-deletar" onClick={() => setShowConfirmDelete(true)}><Trash2 size={18} style={{ marginRight: '8px' }} /> Excluir Álbum</button>
              </>
            ) : (
              <div className="delete-confirm-box">
                <AlertTriangle size={40} color="var(--neon-red)" style={{ marginBottom: '16px' }} />
                <h3 className="modal-title">Tem certeza?</h3>
                <p>Você está prestes a excluir o álbum <strong>{albumEditando.nome}</strong>. Todo o progresso será perdido!</p>
                <div className="modal-controls-row">
                  <button className="btn-cancelar" onClick={() => setShowConfirmDelete(false)}>Cancelar</button>
                  <button className="btn-deletar-confirm" onClick={confirmarExclusao}>Sim, Excluir</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="top-bar">
        <div className="header-left">
          <Menu className="menu-icon" strokeWidth={2.5} onClick={() => setMenuOpen(true)} />
          <span className="brand-text">FIFA WORLD CUP</span>
        </div>
        <Share2 className="header-action-icon" strokeWidth={2.5} size={24} />
      </header>

      {/* CONTEÚDO BASEADO NA ABA ATIVA */}
      <main className="main-content">
        {abaAtiva === 'inicio' && (
          <>
            <h2 className="section-title">Recentes</h2>
            <div className="album-section">
              {meusAlbuns.slice(0, 10).map(renderAlbumCard)}
            </div>

            <div className="divider"></div>
            <div className="add-new-section">
              <div className="add-new-card" onClick={() => setModalNovoOpen(true)}><Plus size={28} /><span>Criar novo álbum</span></div>
              <div className="add-new-card secondary-add" onClick={importarAlbum}><Download size={24} /><span>Importar álbum</span></div>
            </div>
          </>
        )}

        {abaAtiva === 'albuns' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="section-title" style={{margin: 0}}>Meus Álbuns</h2>
              <button className="btn-edit-icon" onClick={() => setModalNovoOpen(true)}><Plus size={20}/></button>
            </div>
            <div className="album-section">
              {albunsProprios.length > 0 ? albunsProprios.map(renderAlbumCard) : <p className="modal-subtitle">Você não criou nenhum álbum.</p>}
            </div>

            <div className="divider"></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="section-title" style={{margin: 0}}>Compartilhados Comigo</h2>
              <button className="btn-edit-icon" onClick={importarAlbum}><Download size={20}/></button>
            </div>
            <div className="album-section">
              {albunsCompartilhados.length > 0 ? albunsCompartilhados.map(renderAlbumCard) : <p className="modal-subtitle">Ninguém compartilhou um álbum com você ainda.</p>}
            </div>
          </>
        )}
      </main>

      <nav className="bottom-bar">
        <div className={`nav-item ${abaAtiva === 'inicio' ? 'active' : ''}`} onClick={() => setAbaAtiva('inicio')}>
          <HomeIcon size={24}/><span>Início</span>
        </div>
        <div className={`nav-item ${abaAtiva === 'albuns' ? 'active' : ''}`} onClick={() => setAbaAtiva('albuns')}>
          <BookOpen size={24}/><span>Álbum</span>
        </div>
        <div className="nav-item"><Zap size={24}/><span>Dinâmicas</span></div>
      </nav>
    </div>
  );
};

export default Home;