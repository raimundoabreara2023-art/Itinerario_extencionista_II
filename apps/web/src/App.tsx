import { NavLink, Route, Routes } from 'react-router-dom';
import { Arvore } from './paginas/Arvore';
import { Familias } from './paginas/Familias';
import { Inicio } from './paginas/Inicio';
import { Pessoas } from './paginas/Pessoas';

export function App() {
  return (
    <>
      <header className="topo">
        <h1>Raízes &amp; Memórias</h1>
        <nav>
          <NavLink to="/">Início</NavLink>
          <NavLink to="/arvore">Árvore</NavLink>
          <NavLink to="/pessoas">Pessoas</NavLink>
          <NavLink to="/familias">Famílias</NavLink>
        </nav>
      </header>
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/arvore" element={<Arvore />} />
          <Route path="/pessoas" element={<Pessoas />} />
          <Route path="/familias" element={<Familias />} />
        </Routes>
      </main>
    </>
  );
}
