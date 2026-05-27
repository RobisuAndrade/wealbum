import React, { useState, useEffect } from 'react';
import { Menu, Home as HomeIcon, BookOpen, Zap, ChevronRight, Plus, Share2, Download, X, Copy } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './Home.css';

const Home = ({ onAbrirAlbum }) => {
  const [meusAlbuns, setMeusAlbuns] = useState([]); 
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [nomeNovoAlbum, setNomeNovoAlbum] = useState('');
  
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('we_album_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('we_album_device_id', id);
    }
    return id;
  });

  useEffect(() => {
    const q = query(collection(db, "albuns"), where("deviceId", "==", deviceId), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const albuns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeusAlbuns(albuns);
    });
    return () => unsubscribe();
  }, [deviceId]);

  // Função de cópia para o clipboard
  const copiarCodigo = (e, codigo) => {
    e.stopPropagation(); // Evita abrir o álbum ao clicar no ícone
    navigator.clipboard.writeText(codigo);
    alert("Código " + codigo + " copiado!");
  };

  const criarAlbum = async () => {
    if (nomeNovoAlbum.trim() === '') return;
    const duplicado = meusAlbuns.find(a => a.nome.toLowerCase() === nomeNovoAlbum.toLowerCase());
    if (duplicado) { alert("Nome duplicado!"); return; }

    try {
      await addDoc(collection(db, "albuns"), {
        nome: nomeNovoAlbum,
        codigo: Math.random().toString(36).substring(2, 10).toUpperCase(),
        deviceId: deviceId,
        concluido: 0,
        repetidas: 0,
        faltam: 994,
        ultimaAlteracao: 'Agora mesmo',
        createdAt: Date.now(),
        colecao: {}
      });
      setModalNovoOpen(false);
      setNomeNovoAlbum('');
    } catch (e) { alert("Erro ao criar."); }
  };

  return (
    <div className="app-layout">
      {/* --- MODAL --- */}
      {modalNovoOpen && (
        <div className="modal-overlay" onClick={() => setModalNovoOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setModalNovoOpen(false)}><X size={24} /></button>
            <h3 className="modal-title">Novo Álbum</h3>
            <input type="text" className="input-nome-album" placeholder="Ex: Copa 2026" value={nomeNovoAlbum} onChange={(e) => setNomeNovoAlbum(e.target.value)} autoFocus />
            <button className="btn-concluir" onClick={criarAlbum}>Criar Álbum</button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="top-bar">
        <div className="header-left">
          <Menu className="menu-icon" strokeWidth={2.5} />
          <img src="/img/logo-copa.png" alt="FIFA" className="app-logo" />
          <span className="brand-text">FIFA WORLD CUP</span>
        </div>
        <Share2 className="header-action-icon" strokeWidth={2.5} size={24} />
      </header>

      {/* --- CONTEÚDO --- */}
      <main className="main-content">
        <h2 className="section-title">Recentes</h2>
        
        <div className="album-section">
          {meusAlbuns.map((album) => (
            <div key={album.id} className="album-wrapper">
              <div className="album-card" onClick={() => onAbrirAlbum(album)}>
                <div className="album-cover"><img src="/img/capa-album.png" alt="Capa" className="album-image"/></div>
                <div className="album-info">
                  <h3>{album.nome}</h3>
                  {/* BARRA DE PROGRESSO VOLTOU */}
                  <div className="progress-container">
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${album.concluido}%` }}></div></div>
                    <span className="progress-text">{album.concluido}%</span>
                  </div>
                  {/* CÓDIGO COM BOTÃO DE COPIA (CLIQUE E SEGURE) */}
                  <p className="album-code" onClick={(e) => copiarCodigo(e, album.codigo)} onContextMenu={(e) => copiarCodigo(e, album.codigo)}>
                    Código: <strong>{album.codigo}</strong> <Copy size={14} style={{marginLeft: '8px'}} />
                  </p>
                </div>
                <ChevronRight className="arrow-icon" />
              </div>

              {/* RETÂNGULOS DE ESTATÍSTICAS VOLTARAM */}
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
          ))}
        </div>

        <div className="divider"></div>
        <div className="add-new-section">
          <div className="add-new-card" onClick={() => setModalNovoOpen(true)}><Plus size={28} /><span>Criar novo álbum</span></div>
          <div className="add-new-card secondary-add"><Download size={24} /><span>Importar álbum</span></div>
        </div>
      </main>

      <nav className="bottom-bar">
        <div className="nav-item active"><HomeIcon size={24}/><span>Início</span></div>
        <div className="nav-item"><BookOpen size={24}/><span>Álbum</span></div>
        <div className="nav-item"><Zap size={24}/><span>Dinâmicas</span></div>
      </nav>
    </div>
  );
};

export default Home;