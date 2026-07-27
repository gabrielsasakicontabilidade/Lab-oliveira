import { useEffect, useState } from 'react';
import { ouvirClientes } from '@/services/firestore';
import { Cliente } from '@/types';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    return ouvirClientes((lista) => {
      setClientes(lista);
      setCarregando(false);
    });
  }, []);

  return { clientes, carregando };
}
