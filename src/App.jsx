import React, { useState } from 'react';
import Home from './pages/Home';
import Album from './pages/Album';
import './App.css';

function App() {
  // Estado que controla qual tela está aberta ('home' ou 'album')
  const [telaAtual, setTelaAtual] = useState('home');
  // Estado para saber qual álbum foi clicado (para futuramente carregar os dados dele)
  const [albumSelecionado, setAlbumSelecionado] = useState(null);

  // Função para abrir o álbum
  const abrirAlbum = (album) => {
    setAlbumSelecionado(album);
    setTelaAtual('album');
  };

  // Função para voltar para a Home
  const voltarHome = () => {
    setAlbumSelecionado(null);
    setTelaAtual('home');
  };

  return (
    <div>
      {/* Se a tela atual for 'home', renderiza o componente Home */}
      {telaAtual === 'home' && <Home onAbrirAlbum={abrirAlbum} />}
      
      {/* Se a tela atual for 'album', renderiza o componente Album */}
      {telaAtual === 'album' && <Album onVoltar={voltarHome} albumData={albumSelecionado} />}
    </div>
  );
}

export default App;