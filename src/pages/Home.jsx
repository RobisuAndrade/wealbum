import React, { useState, useEffect } from 'react';
import { Menu, Home as HomeIcon, BookOpen, Repeat, ChevronRight, Plus, Share2, Download, X, Copy, Edit2, Trash2, AlertTriangle, LogIn, LogOut, ShieldCheck, Users, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import Troca from './Troca';
import Sininho from '../components/Sininho';
import './Home.css';

const Home = ({ onAbrirAlbum, abaInicial = 'inicio', albumParaTroca = null }) => {
  const [meusAlbuns, setMeusAlbuns] = useState([]); 
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [nomeNovoAlbum, setNomeNovoAlbum] = useState('');
  
  const [abaAtiva, setAbaAtiva] = useState(abaInicial);

  useEffect(() => {
    setAbaAtiva(abaInicial);
  }, [abaInicial]);

  const [albumEditando, setAlbumEditando] = useState(null);
  const [novoNomeEdicao, setNovoNomeEdicao] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [modalAcessoOpen, setModalAcessoOpen] = useState(null);

  const [modalInfo, setModalInfo] = useState(null);
  const [inputModalValue, setInputModalValue] = useState('');

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

  useEffect(() => {
    if (meuId === 'robson') {
      const q = query(collection(db, "albuns"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, snap => setMeusAlbuns(snap.docs.map(d => ({id: d.id, ...d.data()}))));
      return () => unsub();
    } else {
      const qProprios = query(collection(db, "albuns"), where("deviceId", "==", meuId));
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
      setMenuOpen(false);
      setModalInfo({ tipo: 'sucesso', titulo: 'Acesso Supremo', mensagem: 'Modo de Mestre Supremo ativado com sucesso!' });
    } else {
      try {
        const q = query(collection(db, "usuarios"), where("usuario", "==", userLower), where("senha", "==", inputSenha));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserLogado(userLower);
          localStorage.setItem('we_album_user', userLower);
          setMenuOpen(false);
          setModalInfo({ tipo: 'sucesso', titulo: 'Bem-vindo(a)!', mensagem: `Que bom ter você de volta, ${userLower}.` });
        } else {
          setModalInfo({ tipo: 'erro', titulo: 'Acesso Negado', mensagem: 'Usuário ou senha incorretos, ou usuário não existe.' });
        }
      } catch (error) { 
        setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Ocorreu um erro ao conectar com o banco de dados.' });
      }
    }
    setInputUser(''); setInputSenha('');
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    const userLower = inputUser.trim().toLowerCase();
    
    if (inputSenha !== inputConfirmarSenha) { 
      setModalInfo({ tipo: 'aviso', titulo: 'Atenção', mensagem: 'As senhas não coincidem. Tente novamente.' });
      return; 
    }
    if (userLower === 'robson') { 
      setModalInfo({ tipo: 'aviso', titulo: 'Nome Inválido', mensagem: 'Este nome de usuário é reservado do sistema.' });
      return; 
    }

    try {
      const q = query(collection(db, "usuarios"), where("usuario", "==", userLower));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) { 
        setModalInfo({ tipo: 'aviso', titulo: 'Atenção', mensagem: 'Este nome de usuário já está sendo utilizado.' });
        return; 
      }

      await addDoc(collection(db, "usuarios"), { usuario: userLower, senha: inputSenha, createdAt: Date.now() });
      setUserLogado(userLower);
      localStorage.setItem('we_album_user', userLower);
      setMenuOpen(false);
      setIsLoginMode(true);
      setModalInfo({ tipo: 'sucesso', titulo: 'Sucesso', mensagem: 'Conta criada e ativada perfeitamente!' });
    } catch (error) { 
      setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Ocorreu um problema ao cadastrar sua conta.' });
    }
    setInputUser(''); setInputSenha(''); setInputConfirmarSenha('');
  };

  const handleLogout = () => {
    setUserLogado(null);
    localStorage.removeItem('we_album_user');
    setMenuOpen(false);
    setAbaAtiva('inicio');
    setModalInfo({ tipo: 'sucesso', titulo: 'Desconectado', mensagem: 'Você saiu da sua conta com segurança.' });
  };

  const copiarCodigo = (e, codigo) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codigo);
    setModalInfo({ tipo: 'sucesso', titulo: 'Copiado!', mensagem: `O código ${codigo} foi copiado para sua área de transferência.` });
  };

  const criarAlbum = async () => {
    if (nomeNovoAlbum.trim() === '') return;
    const duplicado = meusAlbuns.find(a => a.nome.toLowerCase() === nomeNovoAlbum.toLowerCase() && a.deviceId === meuId);
    if (duplicado) { 
      setModalInfo({ tipo: 'aviso', titulo: 'Atenção', mensagem: 'Você já possui um álbum com esse exato nome.' });
      return; 
    }

    try {
      await addDoc(collection(db, "albuns"), {
        nome: nomeNovoAlbum,
        codigo: Math.random().toString(36).substring(2, 10).toUpperCase(),
        deviceId: meuId, 
        compartilhadoCom: [],
        permissoes: {}, 
        concluido: 0,
        repetidas: 0,
        faltam: 994,
        ultimaAlteracao: 'Agora mesmo',
        createdAt: Date.now(),
        colecao: {}
      });
      setModalNovoOpen(false);
      setNomeNovoAlbum('');
      setModalInfo({ tipo: 'sucesso', titulo: 'Álbum Criado!', mensagem: 'Seu novo álbum está pronto para ser preenchido.' });
    } catch (e) { 
      setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Não foi possível criar o álbum no banco de dados.' });
    }
  };

  const abrirModalImportar = () => {
    setModalInfo({
      tipo: 'input',
      titulo: 'Importar Álbum',
      mensagem: 'Digite o código de 8 dígitos do álbum para importar:',
      placeholder: 'Ex: A1B2C3D4',
      onConfirm: (codigo) => processarImportacao(codigo)
    });
  };

  const processarImportacao = async (codigo) => {
    if (!codigo || codigo.trim() === '') return;

    try {
      const q = query(collection(db, "albuns"), where("codigo", "==", codigo.toUpperCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        const albumData = docRef.data();

        if (albumData.deviceId === meuId) {
           setModalInfo({ tipo: 'aviso', titulo: 'Atenção', mensagem: 'Você já é o dono deste álbum!' });
           return;
        }
        if (albumData.compartilhadoCom && albumData.compartilhadoCom.includes(meuId)) {
           setModalInfo({ tipo: 'aviso', titulo: 'Atenção', mensagem: 'Você já importou este álbum anteriormente.' });
           return;
        }

        // --- AQUI AVISAMOS QUE O ÁLBUM RECEBEU UM NOVO ACESSO ---
        await updateDoc(docRef.ref, { 
           compartilhadoCom: arrayUnion(meuId),
           [`permissoes.${meuId}`]: 'view',
           temNovoAcesso: true
        });
        
        setModalInfo({ tipo: 'sucesso', titulo: 'Importado!', mensagem: 'Álbum importado com sucesso! Verifique a aba "Álbum".' });
        setAbaAtiva('albuns');
      } else {
        setModalInfo({ tipo: 'erro', titulo: 'Não Encontrado', mensagem: 'Nenhum álbum encontrado com esse código.' });
      }
    } catch (e) { 
      setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Ocorreu um erro ao importar o álbum.' });
    }
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
      setModalInfo({ tipo: 'sucesso', titulo: 'Salvo', mensagem: 'O nome do álbum foi atualizado.' });
    } catch (e) { 
      setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Falha ao renomear o álbum.' });
    }
  };

  const confirmarExclusao = async () => {
    try {
      await deleteDoc(doc(db, "albuns", albumEditando.id));
      setAlbumEditando(null);
      setModalInfo({ tipo: 'sucesso', titulo: 'Excluído', mensagem: 'O álbum foi apagado permanentemente.' });
    } catch (e) { 
      setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Falha ao excluir o álbum.' });
    }
  };

  const alterarPermissao = async (albumId, userId, novaPermissao) => {
    try {
      await updateDoc(doc(db, "albuns", albumId), {
        [`permissoes.${userId}`]: novaPermissao
      });
      setModalAcessoOpen(prev => ({ ...prev, permissoes: { ...prev.permissoes, [userId]: novaPermissao } }));
    } catch (e) { 
      setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Falha ao atualizar permissões do usuário.' });
    }
  };

  const albunsProprios = meusAlbuns.filter(a => a.deviceId === meuId || meuId === 'robson');
  const albunsCompartilhados = meusAlbuns.filter(a => a.deviceId !== meuId && meuId !== 'robson');

  const renderAlbumCard = (album) => {
    const isOwner = album.deviceId === meuId || meuId === 'robson';
    const permissao = album.permissoes?.[meuId] || 'view';
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
                  
                  {/* --- O BOTÃO DE USUÁRIOS AGORA TEM A BOLINHA DE AVISO --- */}
                  <button 
                    className="btn-edit-icon" 
                    style={{ position: 'relative' }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setModalAcessoOpen(album); 
                      // Apaga a bolinha do banco de dados quando o dono clica
                      if (album.temNovoAcesso) {
                        updateDoc(doc(db, "albuns", album.id), { temNovoAcesso: false }).catch(() => {});
                      }
                    }}
                  >
                    <Users size={16} />
                    {album.temNovoAcesso && <span className="badge-novo-acesso"></span>}
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

      {modalInfo && (
        <div className="modal-overlay" onClick={() => { if (modalInfo.tipo !== 'input') setModalInfo(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => { setModalInfo(null); setInputModalValue(''); }}><X size={24} /></button>
            
            {modalInfo.tipo === 'confirmacao' && <AlertTriangle size={48} color="var(--neon-yellow)" style={{marginBottom: '16px'}} />}
            {(modalInfo.tipo === 'erro' || modalInfo.tipo === 'aviso') && <AlertTriangle size={48} color="var(--neon-red)" style={{marginBottom: '16px'}} />}
            {modalInfo.tipo === 'sucesso' && <CheckCircle2 size={48} color="var(--neon-green)" style={{marginBottom: '16px'}} />}
            {modalInfo.tipo === 'input' && <Download size={48} color="var(--fifa-blue)" style={{marginBottom: '16px'}} />}

            <h3 className="modal-title">{modalInfo.titulo}</h3>
            <p className="modal-subtitle" style={{marginBottom: '24px'}}>{modalInfo.mensagem}</p>

            {modalInfo.tipo === 'input' && (
              <input 
                type="text" 
                className="input-nome-album" 
                placeholder={modalInfo.placeholder} 
                value={inputModalValue} 
                onChange={(e) => setInputModalValue(e.target.value)} 
                autoFocus 
                style={{ marginBottom: '24px' }}
              />
            )}

            {modalInfo.tipo === 'confirmacao' || modalInfo.tipo === 'input' ? (
              <div className="modal-controls-row">
                <button className="btn-cancelar" onClick={() => { setModalInfo(null); setInputModalValue(''); }}>Cancelar</button>
                <button className="btn-confirmar-acao" onClick={() => { 
                  if (modalInfo.tipo === 'input') {
                    modalInfo.onConfirm(inputModalValue);
                    setInputModalValue('');
                  } else {
                    modalInfo.onConfirm(); 
                  }
                  setModalInfo(null); 
                }}>
                  {modalInfo.tipo === 'input' ? 'Importar' : 'Sim, Continuar'}
                </button>
              </div>
            ) : (
              <button className="btn-concluir" onClick={() => setModalInfo(null)}>OK, Entendi</button>
            )}
          </div>
        </div>
      )}
      
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
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Sininho meuId={meuId} />
          <Share2 className="header-action-icon" strokeWidth={2.5} size={24} />
        </div>
      </header>

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
              
              <div className="add-new-card secondary-add" onClick={abrirModalImportar}>
                <Download size={24} /><span>Importar álbum</span>
              </div>
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
              <button className="btn-edit-icon" onClick={abrirModalImportar}><Download size={20}/></button>
            </div>
            <div className="album-section">
              {albunsCompartilhados.length > 0 ? albunsCompartilhados.map(renderAlbumCard) : <p className="modal-subtitle">Ninguém compartilhou um álbum com você ainda.</p>}
            </div>
          </>
        )}

        {abaAtiva === 'troca' && (
          <Troca meusAlbuns={meusAlbuns} meuId={meuId} albumParaTroca={albumParaTroca} />
        )}

      </main>

      <nav className="bottom-bar">
        <div className={`nav-item ${abaAtiva === 'inicio' ? 'active' : ''}`} onClick={() => setAbaAtiva('inicio')}>
          <HomeIcon size={24}/><span>Início</span>
        </div>
        <div className={`nav-item ${abaAtiva === 'albuns' ? 'active' : ''}`} onClick={() => setAbaAtiva('albuns')}>
          <BookOpen size={24}/><span>Álbum</span>
        </div>
        <div className={`nav-item ${abaAtiva === 'troca' ? 'active' : ''}`} onClick={() => setAbaAtiva('troca')}>
          <Repeat size={24}/><span>Troca</span>
        </div>
      </nav>
    </div>
  );
};

export default Home;