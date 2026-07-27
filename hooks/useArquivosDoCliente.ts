import { useEffect, useState } from 'react';
import { ouvirArquivosDoCliente } from '@/services/firestore';
import { Arquivo } from '@/types';

export function useArquivosDoCliente(clienteId: string) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);

  useEffect(() => {
    if (!clienteId) return;
    return ouvirArquivosDoCliente(clienteId, setArquivos);
  }, [clienteId]);

  return arquivos;
}
