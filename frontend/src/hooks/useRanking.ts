import { useEffect, useState } from 'react';
import { api, mensagemDoErro } from '../api/cliente';
import type { ItemRanking } from '../types';

/** Busca o ranking uma vez, quando o componente que usa o hook aparece na tela. */
export function useRanking() {
  const [itens, setItens] = useState<ItemRanking[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true; // evita atualizar estado se o componente sair da tela antes da resposta
    api
      .ranking()
      .then((dados) => {
        if (ativo) setItens(dados);
      })
      .catch((e: unknown) => {
        if (ativo) setErro(mensagemDoErro(e));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []); // [] = roda só quando o componente monta

  return { itens, carregando, erro };
}
