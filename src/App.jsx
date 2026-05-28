import React, { useState } from 'react';
import Home from './pages/Home';
import Album from './pages/Album';
import './App.css';

function App() {
  const [telaAtual, setTelaAtual] = useState('home');
  const [albumSelecionado, setAlbumSelecionado] = useState(null);
  const [abaDestino, setAbaDestino] = useState('inicio');
  
  // NOVO: Guarda o ID do álbum para pré-selecionar na tela de Troca
  const [albumParaTroca, setAlbumParaTroca] = useState(null);

  const abrirAlbum = (album) => {
    setAlbumSelecionado(album);
    setTelaAtual('album');
  };

  const voltarHome = () => {
    setAlbumSelecionado(null);
    setAlbumParaTroca(null); // Limpa o ID se o usuário voltar normalmente
    setAbaDestino('inicio');
    setTelaAtual('home');
  };

  const irParaTroca = () => {
    // Salva o ID do álbum atual ANTES de fechar a tela do álbum
    setAlbumParaTroca(albumSelecionado?.id || null);
    setAlbumSelecionado(null);
    setAbaDestino('troca');
    setTelaAtual('home');
  };

  return (
    <div>
      {/* Passamos o albumParaTroca para a Home */}
      {telaAtual === 'home' && <Home onAbrirAlbum={abrirAlbum} abaInicial={abaDestino} albumParaTroca={albumParaTroca} />}
      
      {telaAtual === 'album' && <Album onVoltar={voltarHome} onIrParaTroca={irParaTroca} albumData={albumSelecionado} />}
    </div>
  );
}

export default App;