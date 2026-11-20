import { useState } from "react";
import AuthScreen from "./src/features/auth/auth_screen";
import HomeScreen from "./src/features/home/home_screen";
import { Profissional } from "./src/services/auth_service";

export default function App() {
  // Guarda quem está logado e o token. Se for null, ninguém logou.
  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Logado: mostra a Home
  if (profissional && token) {
    return (
      <HomeScreen
        profissional={profissional}
        aoSair={() => {
          setProfissional(null);
          setToken(null);
        }}
      />
    );
  }

  // Não logado: mostra o login
  return (
    <AuthScreen
      aoLogar={(p, t) => {
        setProfissional(p);
        setToken(t);
      }}
    />
  );
}