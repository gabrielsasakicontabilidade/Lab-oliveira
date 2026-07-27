import { useEffect, useState } from 'react';
import { ouvirTrabalhos } from '@/services/firestore';
import { Trabalho } from '@/types';

export function useTrabalhos() {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    return ouvirTrabalhos((lista) => {
      setTrabalhos(lista);
      setCarregando(false);
    });
  }, []);

  return { trabalhos, carregando };
}
