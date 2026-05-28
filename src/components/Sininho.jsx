import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Trash2 } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Sininho.css';

export default function Sininho({ meuId }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!meuId) return;
    
    // Busca as notificações destinadas ao dono do álbum
    const q = query(collection(db, 'notificacoes'), where('para', '==', meuId), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotificacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [meuId]);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const abrirModal = () => {
    setModalOpen(true);
    marcarTodasComoLidas();
  };

  const marcarTodasComoLidas = async () => {
    if (naoLidas === 0) return;
    const batch = writeBatch(db);
    notificacoes.forEach(n => {
      if (!n.lida) {
        const ref = doc(db, 'notificacoes', n.id);
        batch.update(ref, { lida: true });
      }
    });
    await batch.commit();
  };

  const limparNotificacoes = async () => {
    const batch = writeBatch(db);
    notificacoes.forEach(n => {
      const ref = doc(db, 'notificacoes', n.id);
      batch.delete(ref);
    });
    await batch.commit();
    setModalOpen(false);
  };

  return (
    <>
      {/* Ícone do Sininho */}
      <div className="sininho-wrapper" onClick={abrirModal}>
        <Bell className="header-action-icon" strokeWidth={2.5} size={24} />
        {naoLidas > 0 && (
          <span className="sininho-badge">{naoLidas}</span>
        )}
      </div>

      {/* Modal de Notificações usando o padrão do App */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content notificacoes-modal" onClick={e => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setModalOpen(false)}><X size={24} /></button>
            
            <h3 className="modal-title">Notificações</h3>
            <p className="modal-subtitle">Atualizações dos seus álbuns</p>

            <div className="lista-notificacoes">
              {notificacoes.length > 0 ? (
                notificacoes.map(notif => (
                  <div key={notif.id} className={`notificacao-item ${!notif.lida ? 'nao-lida' : ''}`}>
                    <div className="notificacao-icon">
                      <CheckCircle2 size={20} color="var(--neon-green)" />
                    </div>
                    <div className="notificacao-texto">
                      <strong>{notif.de}</strong> {notif.tipo === 'troca' ? 'fez uma troca' : 'colou/removeu figurinhas'} no álbum <strong>{notif.albumNome}</strong>.
                      <span className="notificacao-tempo">
                        {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="notificacao-vazia">
                  <Bell size={40} color="var(--text-muted)" style={{opacity: 0.3, marginBottom: '10px'}} />
                  <p>Você não tem novas notificações.</p>
                </div>
              )}
            </div>

            {notificacoes.length > 0 && (
              <button className="btn-limpar-notif" onClick={limparNotificacoes}>
                <Trash2 size={16} /> Limpar Histórico
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}