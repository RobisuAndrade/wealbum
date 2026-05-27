import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Minus, Plus, X } from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './Album.css';

const Album = ({ onVoltar, albumData: albumAtivo }) => {
  const [colecao, setColecao] = useState({}); 
  const [filtroStatus, setFiltroStatus] = useState('todas'); 
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [mostrarFiltroGrupos, setMostrarFiltroGrupos] = useState(false);
  
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [termoInput, setTermoInput] = useState(''); 
  const [termosSalvos, setTermosSalvos] = useState([]); 

  const [stickerEditando, setStickerEditando] = useState(null); 
  const timerRef = useRef(null);
  const isLongPress = useRef(false);
  const hasMoved = useRef(false);

  const somenteLeitura = albumAtivo?.somenteLeitura || false;

  useEffect(() => {
    if (!albumAtivo || !albumAtivo.id) return;
    const docRef = doc(db, "albuns", albumAtivo.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setColecao(docSnap.data().colecao || {});
      }
    });
    return () => unsubscribe();
  }, [albumAtivo]);

  const salvarNoBanco = async (novaColecao) => {
    if (!albumAtivo || !albumAtivo.id) return;
    const docRef = doc(db, "albuns", albumAtivo.id);
    const totalColadas = Object.keys(novaColecao).length;
    const porcentagem = ((totalColadas / 994) * 100).toFixed(0);
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });

    try {
      await updateDoc(docRef, {
        colecao: novaColecao,
        concluido: porcentagem,
        ultimaAlteracao: `Hoje às ${horaAtual}`
      });
    } catch (error) { console.error("Erro ao salvar", error); }
  };

  const adicionarFigurinha = (id) => {
    if (somenteLeitura) { alert("Você tem apenas permissão de visualização neste álbum."); return; }
    setColecao(prev => {
      const nova = { ...prev, [id]: (prev[id] || 0) + 1 };
      salvarNoBanco(nova);
      return nova;
    });
  };

  const removerFigurinha = (id) => {
    if (somenteLeitura) { alert("Você tem apenas permissão de visualização neste álbum."); return; }
    setColecao(prev => {
      const atual = prev[id] || 0;
      const nova = { ...prev };
      if (atual <= 1) delete nova[id];
      else nova[id] = atual - 1;
      salvarNoBanco(nova);
      return nova;
    });
  };

  const handlePressStart = (id) => {
    if (somenteLeitura) { alert("Você tem permissão apenas de visualização."); return; }
    hasMoved.current = false;
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      if (!hasMoved.current) {
        isLongPress.current = true;
        setStickerEditando(id);
      }
    }, 500); 
  };

  const handleTouchMove = () => {
    hasMoved.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handlePressEnd = () => { 
    if (timerRef.current) clearTimeout(timerRef.current); 
  };

  const handleStickerClick = (id) => {
    if (!isLongPress.current && !hasMoved.current) {
      adicionarFigurinha(id);
    }
  };

  const albumData = [
    { id: 'pagina-inicial', titulo: 'Página Inicial', subtitulo: 'Especiais • 9 Figurinhas', selecoes: [{ id: 'FWC-INICIO', nome: 'FIFA World Cup™', figurinhasPersonalizadas: ['FWC 00', 'FWC 1', 'FWC 2', 'FWC 3', 'FWC 4', 'FWC 5', 'FWC 6', 'FWC 7', 'FWC 8'], gradiente: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #B38728 100%)', isCromada: true }] },
    { id: 'grupo-a', titulo: 'Grupo A', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'MEX', nome: 'México', total: 20, gradiente: 'linear-gradient(135deg, #006847 0%, #111111 40%, #ce1126 100%)' }, { id: 'RSA', nome: 'África do Sul', total: 20, gradiente: 'linear-gradient(135deg, #007749 0%, #111111 40%, #ffb81c 100%)' }, { id: 'KOR', nome: 'Coreia do Sul', total: 20, gradiente: 'linear-gradient(135deg, #c60c30 0%, #111111 40%, #003478 100%)' }, { id: 'CZE', nome: 'Rep. Tcheca', total: 20, gradiente: 'linear-gradient(135deg, #d7141a 0%, #111111 40%, #11457e 100%)' }] },
    { id: 'grupo-b', titulo: 'Grupo B', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'CAN', nome: 'Canadá', total: 20, gradiente: 'linear-gradient(135deg, #ff0000 0%, #111111 40%, #ffffff 100%)' }, { id: 'BIH', nome: 'Bósnia', total: 20, gradiente: 'linear-gradient(135deg, #002395 0%, #111111 40%, #fecb00 100%)' }, { id: 'QAT', nome: 'Catar', total: 20, gradiente: 'linear-gradient(135deg, #8a1538 0%, #111111 40%, #ffffff 100%)' }, { id: 'SUI', nome: 'Suíça', total: 20, gradiente: 'linear-gradient(135deg, #d52b1e 0%, #111111 40%, #ffffff 100%)' }] },
    { id: 'grupo-c', titulo: 'Grupo C', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'BRA', nome: 'Brasil', total: 20, gradiente: 'linear-gradient(135deg, #009c3b 0%, #111111 40%, #ffdf00 100%)' }, { id: 'MAR', nome: 'Marrocos', total: 20, gradiente: 'linear-gradient(135deg, #c1272d 0%, #111111 40%, #006233 100%)' }, { id: 'HAI', nome: 'Haiti', total: 20, gradiente: 'linear-gradient(135deg, #00209f 0%, #111111 40%, #d21034 100%)' }, { id: 'SCO', nome: 'Escócia', total: 20, gradiente: 'linear-gradient(135deg, #005eb8 0%, #111111 40%, #ffffff 100%)' }] },
    { id: 'grupo-d', titulo: 'Grupo D', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'USA', nome: 'Estados Unidos', total: 20, gradiente: 'linear-gradient(135deg, #b31942 0%, #111111 40%, #0a3161 100%)' }, { id: 'PAR', nome: 'Paraguai', total: 20, gradiente: 'linear-gradient(135deg, #d52b1e 0%, #111111 40%, #0038a8 100%)' }, { id: 'AUS', nome: 'Austrália', total: 20, gradiente: 'linear-gradient(135deg, #00008b 0%, #111111 40%, #ff0000 100%)' }, { id: 'TUR', nome: 'Turquia', total: 20, gradiente: 'linear-gradient(135deg, #e30a17 0%, #111111 40%, #ffffff 100%)' }] },
    { id: 'grupo-e', titulo: 'Grupo E', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'GER', nome: 'Alemanha', total: 20, gradiente: 'linear-gradient(135deg, #000000 0%, #111111 40%, #ffce00 100%)' }, { id: 'CUW', nome: 'Curaçao', total: 20, gradiente: 'linear-gradient(135deg, #002b7f 0%, #111111 40%, #f9e814 100%)' }, { id: 'CIV', nome: 'Costa do Marfim', total: 20, gradiente: 'linear-gradient(135deg, #ff8200 0%, #111111 40%, #009a44 100%)' }, { id: 'ECU', nome: 'Equador', total: 20, gradiente: 'linear-gradient(135deg, #ffdd00 0%, #111111 40%, #ed1c24 100%)' }] },
    { id: 'grupo-f', titulo: 'Grupo F', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'NED', nome: 'Holanda', total: 20, gradiente: 'linear-gradient(135deg, #ae1c28 0%, #111111 40%, #21468b 100%)' }, { id: 'JPN', nome: 'Japão', total: 20, gradiente: 'linear-gradient(135deg, #ffffff 0%, #111111 40%, #bc002d 100%)' }, { id: 'SWE', nome: 'Suécia', total: 20, gradiente: 'linear-gradient(135deg, #004b87 0%, #111111 40%, #ffcd00 100%)' }, { id: 'TUN', nome: 'Tunísia', total: 20, gradiente: 'linear-gradient(135deg, #e70013 0%, #111111 40%, #ffffff 100%)' }] },
    { id: 'grupo-g', titulo: 'Grupo G', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'BEL', nome: 'Bélgica', total: 20, gradiente: 'linear-gradient(135deg, #000000 0%, #111111 40%, #ed2939 100%)' }, { id: 'EGY', nome: 'Egito', total: 20, gradiente: 'linear-gradient(135deg, #ce1126 0%, #111111 40%, #000000 100%)' }, { id: 'IRN', nome: 'Irã', total: 20, gradiente: 'linear-gradient(135deg, #239f40 0%, #111111 40%, #da0000 100%)' }, { id: 'NZL', nome: 'Nova Zelândia', total: 20, gradiente: 'linear-gradient(135deg, #00247d 0%, #111111 40%, #cc142b 100%)' }] },
    { id: 'grupo-h', titulo: 'Grupo H', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'ESP', nome: 'Espanha', total: 20, gradiente: 'linear-gradient(135deg, #aa151b 0%, #111111 40%, #f1bf00 100%)' }, { id: 'CPV', nome: 'Cabo Verde', total: 20, gradiente: 'linear-gradient(135deg, #003893 0%, #111111 40%, #cf2027 100%)' }, { id: 'KSA', nome: 'Arábia Saudita', total: 20, gradiente: 'linear-gradient(135deg, #006c35 0%, #111111 40%, #ffffff 100%)' }, { id: 'URU', nome: 'Uruguai', total: 20, gradiente: 'linear-gradient(135deg, #0038a8 0%, #111111 40%, #fcd116 100%)' }] },
    { id: 'grupo-i', titulo: 'Grupo I', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'FRA', nome: 'França', total: 20, gradiente: 'linear-gradient(135deg, #002395 0%, #111111 40%, #ed2939 100%)' }, { id: 'SEN', nome: 'Senegal', total: 20, gradiente: 'linear-gradient(135deg, #00853f 0%, #111111 40%, #e31b23 100%)' }, { id: 'IRQ', nome: 'Iraque', total: 20, gradiente: 'linear-gradient(135deg, #ce1126 0%, #111111 40%, #000000 100%)' }, { id: 'NOR', nome: 'Noruega', total: 20, gradiente: 'linear-gradient(135deg, #ba0c2f 0%, #111111 40%, #00205b 100%)' }] },
    { id: 'grupo-j', titulo: 'Grupo J', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'ARG', nome: 'Argentina', total: 20, gradiente: 'linear-gradient(135deg, #74acdf 0%, #111111 40%, #ffffff 100%)' }, { id: 'ALG', nome: 'Argélia', total: 20, gradiente: 'linear-gradient(135deg, #006233 0%, #111111 40%, #d21034 100%)' }, { id: 'AUT', nome: 'Áustria', total: 20, gradiente: 'linear-gradient(135deg, #ed2939 0%, #111111 40%, #ffffff 100%)' }, { id: 'JOR', nome: 'Jordânia', total: 20, gradiente: 'linear-gradient(135deg, #000000 0%, #111111 40%, #ce1126 100%)' }] },
    { id: 'grupo-k', titulo: 'Grupo K', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'POR', nome: 'Portugal', total: 20, gradiente: 'linear-gradient(135deg, #006600 0%, #111111 40%, #ff0000 100%)' }, { id: 'COD', nome: 'Congo', total: 20, gradiente: 'linear-gradient(135deg, #007fff 0%, #111111 40%, #ce1021 100%)' }, { id: 'UZB', nome: 'Uzbequistão', total: 20, gradiente: 'linear-gradient(135deg, #0099b5 0%, #111111 40%, #1eb53a 100%)' }, { id: 'COL', nome: 'Colômbia', total: 20, gradiente: 'linear-gradient(135deg, #fcd116 0%, #111111 40%, #ce1126 100%)' }] },
    { id: 'grupo-l', titulo: 'Grupo L', subtitulo: '4 Seleções • 80 Figurinhas', selecoes: [{ id: 'ENG', nome: 'Inglaterra', total: 20, gradiente: 'linear-gradient(135deg, #ffffff 0%, #111111 40%, #ce1126 100%)' }, { id: 'CRO', nome: 'Croácia', total: 20, gradiente: 'linear-gradient(135deg, #ff0000 0%, #111111 40%, #0000ff 100%)' }, { id: 'GHA', nome: 'Gana', total: 20, gradiente: 'linear-gradient(135deg, #ce1126 0%, #111111 40%, #006b3f 100%)' }, { id: 'PAN', nome: 'Panamá', total: 20, gradiente: 'linear-gradient(135deg, #005293 0%, #111111 40%, #d21034 100%)' }] },
    { id: 'history', titulo: 'World Cup History', subtitulo: 'Especiais • 11 Figurinhas', selecoes: [{ id: 'FWC-HISTORY', nome: 'FIFA World Cup History', figurinhasPersonalizadas: ['FWC 9', 'FWC 10', 'FWC 11', 'FWC 12', 'FWC 13', 'FWC 14', 'FWC 15', 'FWC 16', 'FWC 17', 'FWC 18', 'FWC 19'], gradiente: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #B38728 100%)', isCromada: true }] },
    { id: 'coca-cola', titulo: 'Patrocinador', subtitulo: 'Promocionais • 14 Figurinhas', selecoes: [{ id: 'CC', nome: 'Figurinhas Coca-Cola', figurinhasPersonalizadas: ['CC 1', 'CC 2', 'CC 3', 'CC 4', 'CC 5', 'CC 6', 'CC 7', 'CC 8', 'CC 9', 'CC 10', 'CC 11', 'CC 12', 'CC 13', 'CC 14'], gradiente: 'linear-gradient(135deg, #F40009 0%, #111111 40%, #FFFFFF 100%)', isCromada: false }] }
  ];

  const gerarFigurinhas = (prefixo, total) => Array.from({ length: total }, (_, i) => `${prefixo} ${i + 1}`);

  const TOTAL_FIGURINHAS = 994;
  const totalColadas = Object.keys(colecao).length;
  const totalFaltantes = TOTAL_FIGURINHAS - totalColadas;
  const qtdRepetidas = Object.values(colecao).filter(qtd => qtd > 1).length; 

  // --- FUNÇÃO DE BUSCA INTELIGENTE (Ignora espaços e diferencia "1" de "12") ---
  const verificaMatch = (termo, numFigurinha, selecaoNome, selecaoId) => {
    if (!termo || termo.trim() === '') return false;
    
    // Removemos espaços e hifens para "FWC-HISTORY" e "FWC HISTORY" serem a mesma coisa
    const tLimpo = termo.toLowerCase().replace(/[\s\-]/g, ''); 
    const numNorm = numFigurinha.toLowerCase().replace(/[\s\-]/g, '');
    const nomeNorm = selecaoNome.toLowerCase().replace(/[\s\-]/g, '');
    const idNorm = selecaoId.toLowerCase().replace(/[\s\-]/g, '');
    
    // 1. Match exato da string inteira (ex: "bra1" ou "bra 1" acha exatamente "BRA 1")
    if (numNorm === tLimpo) return true;

    // 2. Se a busca for apenas por letras (ex: "bra", "brasil")
    const isOnlyLetters = /^[a-zà-ÿ]+$/.test(tLimpo);
    if (isOnlyLetters) {
      return nomeNorm.includes(tLimpo) || idNorm.includes(tLimpo);
    }

    // 3. Se a busca for apenas por número (ex: "1", "12")
    const isOnlyNumbers = /^\d+$/.test(tLimpo);
    if (isOnlyNumbers) {
      // Extrai apenas o número da figurinha para garantir que "1" ache o "1" e não o "12"
      const stickerNumber = numFigurinha.replace(/[^\d]/g, '');
      return stickerNumber === tLimpo;
    }

    // 4. Caso Misto Parcial (Letra + Número. ex: "br 1" acha "BRA 1" mas não "BRA 12")
    const letrasTermo = tLimpo.replace(/[^a-zà-ÿ]/g, '');
    const numerosTermo = tLimpo.replace(/[^\d]/g, '');
    
    if (letrasTermo && numerosTermo) {
      const stickerNumber = numFigurinha.replace(/[^\d]/g, '');
      // O número precisa ser EXATAMENTE igual, a letra pode ser parcial
      if (stickerNumber === numerosTermo) {
        return nomeNorm.includes(letrasTermo) || idNorm.includes(letrasTermo);
      }
    }

    return false;
  };

  return (
    <div className="app-layout">
      
      {/* MODAL DE EDIÇÃO */}
      {stickerEditando && (
        <div className="modal-overlay" onClick={() => setStickerEditando(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setStickerEditando(null)}><X size={24} /></button>
            <h3 className="modal-title">Figurinha {stickerEditando}</h3>
            <p className="modal-subtitle">Ajuste a quantidade que você possui</p>
            
            <div className="modal-controls">
              <button className="btn-controle" onClick={() => removerFigurinha(stickerEditando)}>
                <Minus size={28} />
              </button>
              <div className="modal-quantidade">
                {colecao[stickerEditando] || 0}
              </div>
              <button className="btn-controle" onClick={() => adicionarFigurinha(stickerEditando)}>
                <Plus size={28} />
              </button>
            </div>
            
            <button className="btn-concluir" onClick={() => setStickerEditando(null)}>Concluir</button>
          </div>
        </div>
      )}

      {/* MODAL DE FILTRO DE GRUPOS */}
      {mostrarFiltroGrupos && (
        <div className="modal-overlay" onClick={() => setMostrarFiltroGrupos(false)}>
          <div className="modal-content modal-filtro-grupos" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setMostrarFiltroGrupos(false)}><X size={24} /></button>
            <h3 className="modal-title">Filtrar por Grupo</h3>
            <p className="modal-subtitle">Navegue rapidamente pela coleção</p>
            
            <div className="lista-grupos-filtro">
              <button 
                className={`btn-grupo-filtro ${filtroGrupo === 'todos' ? 'ativo' : ''}`}
                onClick={() => { setFiltroGrupo('todos'); setMostrarFiltroGrupos(false); }}
              >
                Mostrar Todo o Álbum
              </button>
              {albumData.map(g => (
                <button 
                  key={g.id}
                  className={`btn-grupo-filtro ${filtroGrupo === g.id ? 'ativo' : ''}`}
                  onClick={() => { setFiltroGrupo(g.id); setMostrarFiltroGrupos(false); }}
                >
                  {g.titulo} <span className="filtro-subtext">{g.subtitulo.split(' • ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR (COM INPUT DE BUSCA) */}
      <header className="top-bar album-header">
        <div className="header-left header-busca-left">
          <ChevronLeft className="menu-icon" strokeWidth={2.5} size={28} onClick={onVoltar} />
          
          {!mostrarBusca ? (
            <span className="brand-text">Copa do Mundo™ 2026</span>
          ) : (
            <input 
              type="text" 
              className="input-busca" 
              placeholder="Ex: BRA 1, FWC..." 
              value={termoInput}
              onChange={(e) => setTermoInput(e.target.value)}
              autoFocus
            />
          )}

        </div>
        <div className="header-actions">
          {mostrarBusca ? (
            <X 
              className="action-icon ativo" 
              size={22} 
              onClick={() => { setMostrarBusca(false); setTermoInput(''); setTermosSalvos([]); }} 
            />
          ) : (
            <Search className="action-icon" size={22} onClick={() => setMostrarBusca(true)} />
          )}
          
          <Filter 
            className={`action-icon ${filtroGrupo !== 'todos' ? 'ativo' : ''}`} 
            size={22} 
            onClick={() => setMostrarFiltroGrupos(true)} 
          />
        </div>
      </header>

      {/* BARRA DE FILTROS MÚLTIPLOS (Aparece ao digitar) */}
      {mostrarBusca && (termoInput.trim() !== '' || termosSalvos.length > 0) && (
        <div className="busca-ativa-container">
          <div className="tags-busca">
            {termosSalvos.map((t, index) => (
              <span key={index} className="tag-termo">
                {t} 
                <X size={14} onClick={() => setTermosSalvos(termosSalvos.filter((_, i) => i !== index))} style={{cursor:'pointer'}} />
              </span>
            ))}
          </div>
          
          <div className="busca-botoes">
            {termoInput.trim() !== '' && (
              <button 
                className="btn-busca btn-mais" 
                onClick={() => {
                  setTermosSalvos([...termosSalvos, termoInput.trim()]);
                  setTermoInput('');
                }}
              >
                + Filtrar mais 1
              </button>
            )}
            <button 
              className="btn-busca btn-novo" 
              onClick={() => {
                setTermosSalvos([]);
                setTermoInput('');
              }}
            >
              Nova Busca
            </button>
          </div>
        </div>
      )}

      {/* PÍLULAS DE STATUS */}
      <div className="filtros-rapidos-container">
        <div className="filtros-status">
          <button className={`btn-filtro ${filtroStatus === 'todas' ? 'ativo' : ''}`} onClick={() => setFiltroStatus('todas')}>Todas {TOTAL_FIGURINHAS}</button>
          <button className={`btn-filtro ${filtroStatus === 'coladas' ? 'ativo' : ''}`} onClick={() => setFiltroStatus('coladas')}>Coladas {totalColadas}</button>
          <button className={`btn-filtro ${filtroStatus === 'faltantes' ? 'ativo' : ''}`} onClick={() => setFiltroStatus('faltantes')}>Faltantes {totalFaltantes}</button>
          <button className={`btn-filtro ${filtroStatus === 'repetidas' ? 'ativo' : ''}`} onClick={() => setFiltroStatus('repetidas')}>Repetidas {qtdRepetidas}</button>
        </div>
      </div>

      <main className="album-content">
        
        {albumData.map((grupo, index) => {
          if (filtroGrupo !== 'todos' && filtroGrupo !== grupo.id) return null;

          // LÓGICA DE FILTRAGEM (Status + Busca Inteligente)
          const selecoesComFigurinhas = grupo.selecoes.map(selecao => {
            const listaBruta = selecao.figurinhasPersonalizadas || gerarFigurinhas(selecao.id, selecao.total);
            
            const filtradas = listaBruta.filter(num => {
              const qtd = colecao[num] || 0;
              
              // 1. Verifica as Pílulas
              if (filtroStatus === 'coladas' && qtd === 0) return false;
              if (filtroStatus === 'faltantes' && qtd > 0) return false;
              if (filtroStatus === 'repetidas' && qtd <= 1) return false;

              // 2. Verifica a Busca Múltipla e Sem Espaços
              const buscaAtiva = termoInput.trim() !== '' || termosSalvos.length > 0;
              
              if (buscaAtiva) {
                let match = false;
                
                // Checa se a figurinha bate com ALGUM dos filtros salvos
                if (termosSalvos.length > 0) {
                  match = termosSalvos.some(t => verificaMatch(t, num, selecao.nome, selecao.id));
                }
                
                // Se ainda não bateu, tenta bater com o que a pessoa está digitando agora
                if (!match && termoInput.trim() !== '') {
                  match = verificaMatch(termoInput, num, selecao.nome, selecao.id);
                }
                
                if (!match) return false; // Se não tem em nenhum lugar da busca, oculta a figurinha!
              }

              return true;
            });

            return { ...selecao, figurinhasFiltradas: filtradas };
          }).filter(s => s.figurinhasFiltradas.length > 0); 

          if (selecoesComFigurinhas.length === 0) return null;

          return (
            <div key={grupo.id} className="group-container">
              
              <div className="grupo-header">
                <h2>{grupo.titulo}</h2>
                <p>{grupo.subtitulo}</p>
              </div>

              {selecoesComFigurinhas.map((selecao) => (
                <section key={selecao.id} className="team-section">
                  
                  <div className="team-title">
                    <h3>{selecao.nome}</h3>
                    <span className="team-badge">{selecao.id}</span>
                  </div>

                  <div className="stickers-grid">
                    {selecao.figurinhasFiltradas.map((num, i) => {
                      const qtd = colecao[num] || 0;
                      const estaColada = qtd > 0;
                      
                      return (
                        <div 
                          key={i} 
                          className={`sticker-slot ${estaColada ? 'colada' : 'vazia'} ${selecao.isCromada ? 'sticker-cromada' : ''}`}
                          style={{ background: selecao.gradiente }}
                          onMouseDown={() => handlePressStart(num)}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handleTouchMove} 
                          onTouchStart={() => handlePressStart(num)}
                          onTouchMove={handleTouchMove} 
                          onTouchEnd={handlePressEnd}
                          onClick={() => handleStickerClick(num)}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          {estaColada && <span className="badge-repetida">x{qtd}</span>}
                          
                          <div className="sticker-inner">
                            <span className="sticker-number">{num}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                </section>
              ))}

              {index < albumData.length - 1 && filtroGrupo === 'todos' && (
                <div className="group-divider"></div>
              )}

            </div>
          );
        })}

      </main>

    </div>
  );
};

export default Album;