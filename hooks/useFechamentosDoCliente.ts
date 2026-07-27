import { useEffect, useState } from 'react';
import { ouvirFechamentosDoCliente } from '@/services/firestore';
import { Fechamento } from '@/types';

export function useFechamentosDoCliente(clienteId: string) {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);

  useEffect(() => {
    if (!clienteId) return;
    return ouvirFechamentosDoCliente(clienteId, setFechamentos);
  }, [clienteId]);

  return fechamentos;
}
