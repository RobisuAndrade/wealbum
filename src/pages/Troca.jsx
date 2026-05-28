import React, { useState, useMemo, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Search, Repeat, AlertTriangle, X } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import './Troca.css';

const albumData = [
  { id: 'pagina-inicial', selecoes: [{ id: 'FWC-INICIO', nome: 'FIFA World Cup', figurinhasPersonalizadas: ['FWC 00', 'FWC 1', 'FWC 2', 'FWC 3', 'FWC 4', 'FWC 5', 'FWC 6', 'FWC 7', 'FWC 8'] }] },
  { id: 'grupo-a', selecoes: [{ id: 'MEX', nome: 'México', total: 20 }, { id: 'RSA', nome: 'África do Sul', total: 20 }, { id: 'KOR', nome: 'Coreia do Sul', total: 20 }, { id: 'CZE', nome: 'Rep. Tcheca', total: 20 }] },
  { id: 'grupo-b', selecoes: [{ id: 'CAN', nome: 'Canadá', total: 20 }, { id: 'BIH', nome: 'Bósnia', total: 20 }, { id: 'QAT', nome: 'Catar', total: 20 }, { id: 'SUI', nome: 'Suíça', total: 20 }] },
  { id: 'grupo-c', selecoes: [{ id: 'BRA', nome: 'Brasil', total: 20 }, { id: 'MAR', nome: 'Marrocos', total: 20 }, { id: 'HAI', nome: 'Haiti', total: 20 }, { id: 'SCO', nome: 'Escócia', total: 20 }] },
  { id: 'grupo-d', selecoes: [{ id: 'USA', nome: 'Estados Unidos', total: 20 }, { id: 'PAR', nome: 'Paraguai', total: 20 }, { id: 'AUS', nome: 'Austrália', total: 20 }, { id: 'TUR', nome: 'Turquia', total: 20 }] },
  { id: 'grupo-e', selecoes: [{ id: 'GER', nome: 'Alemanha', total: 20 }, { id: 'CUW', nome: 'Curaçao', total: 20 }, { id: 'CIV', nome: 'Costa do Marfim', total: 20 }, { id: 'ECU', nome: 'Equador', total: 20 }] },
  { id: 'grupo-f', selecoes: [{ id: 'NED', nome: 'Holanda', total: 20 }, { id: 'JPN', nome: 'Japão', total: 20 }, { id: 'SWE', nome: 'Suécia', total: 20 }, { id: 'TUN', nome: 'Tunísia', total: 20 }] },
  { id: 'grupo-g', selecoes: [{ id: 'BEL', nome: 'Bélgica', total: 20 }, { id: 'EGY', nome: 'Egito', total: 20 }, { id: 'IRN', nome: 'Irã', total: 20 }, { id: 'NZL', nome: 'Nova Zelândia', total: 20 }] },
  { id: 'grupo-h', selecoes: [{ id: 'ESP', nome: 'Espanha', total: 20 }, { id: 'CPV', nome: 'Cabo Verde', total: 20 }, { id: 'KSA', nome: 'Arábia Saudita', total: 20 }, { id: 'URU', nome: 'Uruguai', total: 20 }] },
  { id: 'grupo-i', selecoes: [{ id: 'FRA', nome: 'França', total: 20 }, { id: 'SEN', nome: 'Senegal', total: 20 }, { id: 'IRQ', nome: 'Iraque', total: 20 }, { id: 'NOR', nome: 'Noruega', total: 20 }] },
  { id: 'grupo-j', selecoes: [{ id: 'ARG', nome: 'Argentina', total: 20 }, { id: 'ALG', nome: 'Argélia', total: 20 }, { id: 'AUT', nome: 'Áustria', total: 20 }, { id: 'JOR', nome: 'Jordânia', total: 20 }] },
  { id: 'grupo-k', selecoes: [{ id: 'POR', nome: 'Portugal', total: 20 }, { id: 'COD', nome: 'Congo', total: 20 }, { id: 'UZB', nome: 'Uzbequistão', total: 20 }, { id: 'COL', nome: 'Colômbia', total: 20 }] },
  { id: 'grupo-l', selecoes: [{ id: 'ENG', nome: 'Inglaterra', total: 20 }, { id: 'CRO', nome: 'Croácia', total: 20 }, { id: 'GHA', nome: 'Gana', total: 20 }, { id: 'PAN', nome: 'Panamá', total: 20 }] },
  { id: 'history', selecoes: [{ id: 'FWC-HISTORY', nome: 'History', figurinhasPersonalizadas: ['FWC 9', 'FWC 10', 'FWC 11', 'FWC 12', 'FWC 13', 'FWC 14', 'FWC 15', 'FWC 16', 'FWC 17', 'FWC 18', 'FWC 19'] }] },
  { id: 'coca-cola', selecoes: [{ id: 'CC', nome: 'Coca-Cola', figurinhasPersonalizadas: ['CC 1', 'CC 2', 'CC 3', 'CC 4', 'CC 5', 'CC 6', 'CC 7', 'CC 8', 'CC 9', 'CC 10', 'CC 11', 'CC 12', 'CC 13', 'CC 14'] }] }
];

const Troca = ({ meusAlbuns, meuId, albumParaTroca }) => {
  const [albumSelecionado, setAlbumSelecionado] = useState(albumParaTroca || '');
  
  useEffect(() => {
    if (albumParaTroca) {
      setAlbumSelecionado(albumParaTroca);
      setSelecionadasEntrada([]);
      setSelecionadasSaida([]);
    }
  }, [albumParaTroca]);

  const [buscaSaida, setBuscaSaida] = useState('');
  const [buscaEntrada, setBuscaEntrada] = useState('');
  
  const [selecionadasSaida, setSelecionadasSaida] = useState([]);
  const [selecionadasEntrada, setSelecionadasEntrada] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);

  const albunsEditaveis = meusAlbuns.filter(album => 
    album.deviceId === meuId || meuId === 'robson' || album.permissoes?.[meuId] === 'edit'
  );

  const albumAtual = meusAlbuns.find(a => a.id === albumSelecionado);
  const colecaoAtual = albumAtual?.colecao || {};

  const todasFigurinhasMeta = useMemo(() => {
    const lista = [];
    albumData.forEach(grupo => {
      grupo.selecoes.forEach(sel => {
        if (sel.figurinhasPersonalizadas) {
          sel.figurinhasPersonalizadas.forEach(num => lista.push({ num, nome: sel.nome, idBase: sel.id }));
        } else {
          for (let i = 1; i <= sel.total; i++) {
            lista.push({ num: `${sel.id} ${i}`, nome: sel.nome, idBase: sel.id });
          }
        }
      });
    });
    return lista;
  }, []);

  const verificaMatch = (termo, meta) => {
    if (!termo || termo.trim() === '') return true;
    
    const tLimpo = termo.toLowerCase().replace(/[\s\-]/g, ''); 
    const numNorm = meta.num.toLowerCase().replace(/[\s\-]/g, '');
    const nomeNorm = meta.nome.toLowerCase().replace(/[\s\-]/g, '');
    const idNorm = meta.idBase.toLowerCase().replace(/[\s\-]/g, '');
    
    if (numNorm === tLimpo) return true;
    if (/^[a-zà-ÿ]+$/.test(tLimpo)) return nomeNorm.includes(tLimpo) || idNorm.includes(tLimpo);
    
    if (/^\d+$/.test(tLimpo)) {
      const stickerNumber = meta.num.replace(/[^\d]/g, '');
      return stickerNumber === tLimpo;
    }

    const letras = tLimpo.replace(/[^a-zà-ÿ]/g, '');
    const nums = tLimpo.replace(/[^\d]/g, '');
    if (letras && nums) {
      const stickerNumber = meta.num.replace(/[^\d]/g, '');
      if (stickerNumber === nums) {
        return nomeNorm.includes(letras) || idNorm.includes(letras);
      }
    }
    return false;
  };

  const listaSaida = todasFigurinhasMeta.filter(meta => {
    const qtd = colecaoAtual[meta.num] || 0;
    if (qtd <= 1) return false; 
    return verificaMatch(buscaSaida, meta);
  });

  const listaEntrada = todasFigurinhasMeta.filter(meta => {
    const qtd = colecaoAtual[meta.num] || 0;
    if (buscaEntrada.trim() === '') {
      return qtd === 0;
    }
    return verificaMatch(buscaEntrada, meta);
  });

  const toggleSaida = (num) => {
    setSelecionadasSaida(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const toggleEntrada = (num) => {
    setSelecionadasEntrada(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const preProcessarTroca = () => {
    if (!albumSelecionado) {
      setModalInfo({ tipo: 'aviso', titulo: 'Atenção', mensagem: 'Por favor, selecione um álbum primeiro!' });
      return;
    }
    
    const qtdEntrada = selecionadasEntrada.length;
    const qtdSaida = selecionadasSaida.length;

    if (qtdEntrada === 0 && qtdSaida === 0) {
      setModalInfo({ tipo: 'aviso', titulo: 'Atenção', mensagem: 'Selecione pelo menos uma figurinha para entrar ou sair.' });
      return;
    }

    if (qtdEntrada !== qtdSaida) {
      let msg = '';
      if (qtdEntrada > qtdSaida) {
        msg = `Você está recebendo mais figurinhas (${qtdEntrada}) do que enviando (${qtdSaida}). Deseja concluir a troca mesmo assim?`;
      } else {
        msg = `Você está enviando mais figurinhas (${qtdSaida}) do que recebendo (${qtdEntrada}). Deseja concluir a troca mesmo assim?`;
      }
      
      setModalInfo({ 
        tipo: 'confirmacao', 
        titulo: 'Troca Desigual', 
        mensagem: msg, 
        onConfirm: executarTroca 
      });
      return;
    }

    executarTroca();
  };

  const executarTroca = async () => {
    setLoading(true);

    try {
      const docRef = doc(db, "albuns", albumSelecionado);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        setModalInfo({ tipo: 'erro', titulo: 'Erro', mensagem: 'Álbum não encontrado.' });
        setLoading(false);
        return;
      }

      let novaColecao = { ...docSnap.data().colecao };

      selecionadasEntrada.forEach(num => {
        novaColecao[num] = (novaColecao[num] || 0) + 1;
      });

      selecionadasSaida.forEach(num => {
        if (novaColecao[num] && novaColecao[num] > 0) {
          novaColecao[num] -= 1;
          if (novaColecao[num] === 0) delete novaColecao[num];
        }
      });

      const totalColadas = Object.keys(novaColecao).length;
      const porcentagem = ((totalColadas / 994) * 100).toFixed(0);
      const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });

      await updateDoc(docRef, {
        colecao: novaColecao,
        concluido: porcentagem,
        ultimaAlteracao: `Troca registrada às ${horaAtual}`
      });

      // --- NOVO: GATILHO DA NOTIFICAÇÃO DE TROCA AQUI ---
      const userLogado = localStorage.getItem('we_album_user');
      const donoDoAlbum = docSnap.data().deviceId;
      
      if (userLogado && donoDoAlbum && userLogado !== donoDoAlbum) {
        const notifRef = doc(db, "notificacoes", `${albumSelecionado}_${userLogado}_troca`);
        await setDoc(notifRef, {
          para: donoDoAlbum,
          de: userLogado,
          albumNome: docSnap.data().nome,
          lida: false,
          tipo: 'troca',
          timestamp: Date.now()
        }, { merge: true });
      }
      // ----------------------------------------------------

      setModalInfo({ tipo: 'sucesso', titulo: 'Tudo Certo!', mensagem: 'Troca realizada com sucesso! O seu álbum foi atualizado.' });
      setSelecionadasEntrada([]);
      setSelecionadasSaida([]);
      setBuscaEntrada('');
      setBuscaSaida('');
      
    } catch (error) { 
      setModalInfo({ tipo: 'erro', titulo: 'Ops!', mensagem: 'Ocorreu um erro de conexão ao processar a troca.' }); 
    }

    setLoading(false);
  };

  return (
    <div className="troca-container">
      
      {modalInfo && (
        <div className="modal-overlay" onClick={() => setModalInfo(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setModalInfo(null)}><X size={24} /></button>
            
            {modalInfo.tipo === 'confirmacao' && <AlertTriangle size={48} color="var(--neon-yellow)" style={{marginBottom: '16px'}} />}
            {(modalInfo.tipo === 'erro' || modalInfo.tipo === 'aviso') && <AlertTriangle size={48} color="var(--neon-red)" style={{marginBottom: '16px'}} />}
            {modalInfo.tipo === 'sucesso' && <CheckCircle2 size={48} color="var(--neon-green)" style={{marginBottom: '16px'}} />}

            <h3 className="modal-title">{modalInfo.titulo}</h3>
            <p className="modal-subtitle" style={{marginBottom: '24px'}}>{modalInfo.mensagem}</p>

            {modalInfo.tipo === 'confirmacao' ? (
              <div className="modal-controls-row">
                <button className="btn-cancelar" onClick={() => setModalInfo(null)}>Cancelar</button>
                <button className="btn-confirmar-acao" onClick={() => { setModalInfo(null); modalInfo.onConfirm(); }}>Sim, Continuar</button>
              </div>
            ) : (
              <button className="btn-concluir" onClick={() => setModalInfo(null)}>OK, Entendi</button>
            )}
          </div>
        </div>
      )}

      <h2 className="section-title">Central de Trocas</h2>
      <p className="troca-subtitle">Selecione suas repetidas e as figurinhas que você está recebendo.</p>

      <div className="troca-card">
        <label className="troca-label">Selecione o Álbum:</label>
        <select 
          className="troca-select"
          value={albumSelecionado}
          onChange={(e) => {
             setAlbumSelecionado(e.target.value);
             setSelecionadasEntrada([]);
             setSelecionadasSaida([]);
          }}
        >
          <option value="">-- Escolha um álbum --</option>
          {albunsEditaveis.map(album => (
            <option key={album.id} value={album.id}>
              {album.nome} ({album.codigo})
            </option>
          ))}
        </select>
      </div>

      {albumSelecionado && (
        <div className="troca-grid">
          
          <div className="troca-box box-saida">
            <div className="troca-box-header">
              <ArrowUpRight size={20} color="var(--neon-red)" />
              <h3>Saída (Vou Passar)</h3>
            </div>
            
            <div className="busca-troca-wrapper">
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                className="input-busca-troca" 
                placeholder="Buscar nas suas repetidas..."
                value={buscaSaida}
                onChange={(e) => setBuscaSaida(e.target.value)}
              />
            </div>

            <div className="lista-tags-scroller">
              {listaSaida.length > 0 ? (
                listaSaida.map(meta => {
                  const isSelected = selecionadasSaida.includes(meta.num);
                  const repetidasNum = (colecaoAtual[meta.num] || 0) - 1; 
                  
                  return (
                    <button 
                      key={meta.num} 
                      className={`btn-tag-troca ${isSelected ? 'selecionada-saida' : ''}`}
                      onClick={() => toggleSaida(meta.num)}
                    >
                      {meta.num} <span className="tag-qtd-badge">x{repetidasNum}</span>
                    </button>
                  );
                })
              ) : (
                <p className="troca-dica">Nenhuma figurinha repetida encontrada.</p>
              )}
            </div>
          </div>

          <div className="troca-box box-entrada">
            <div className="troca-box-header">
              <ArrowDownLeft size={20} color="var(--neon-green)" />
              <h3>Entrada (Vou Receber)</h3>
            </div>

            <div className="busca-troca-wrapper" style={{marginBottom: '10px'}}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                className="input-busca-troca" 
                placeholder="Buscar qualquer figurinha..."
                value={buscaEntrada}
                onChange={(e) => setBuscaEntrada(e.target.value)}
              />
            </div>

            <div className="troca-legenda">
              <span className="legenda-item"><Repeat size={12} className="icon-green" /> Faltante (Boa Troca)</span>
              <span className="legenda-item"><Repeat size={12} className="icon-red" /> Já Possui</span>
            </div>

            <div className="lista-tags-scroller">
              {listaEntrada.slice(0, 100).map(meta => {
                const isSelected = selecionadasEntrada.includes(meta.num);
                const qtdAtual = colecaoAtual[meta.num] || 0;
                const isMissing = qtdAtual === 0;

                return (
                  <button 
                    key={meta.num} 
                    className={`btn-tag-troca ${isSelected ? 'selecionada-entrada' : ''}`}
                    onClick={() => toggleEntrada(meta.num)}
                  >
                    <Repeat size={14} className={`status-icon ${isMissing ? 'icon-green' : 'icon-red'}`} />
                    {meta.num}
                  </button>
                );
              })}
              {listaEntrada.length > 100 && <p className="troca-dica" style={{marginTop: '10px'}}>Use a busca para refinar a lista...</p>}
            </div>
          </div>

        </div>
      )}

      <button 
        className="btn-processar-troca" 
        onClick={preProcessarTroca}
        disabled={loading || !albumSelecionado}
      >
        {loading ? "Processando..." : <><CheckCircle2 size={20} /> Concluir Troca</>}
      </button>

    </div>
  );
};

export default Troca;