export type TipoCliente = 'Dentista' | 'Consultório';
export type StatusTrabalho = 'Iniciar' | 'Em Produção' | 'Finalizado';

export interface Cliente {
  id: string;
  nome: string;
  tipo: TipoCliente;
  telefone?: string;
  email?: string;
  criadoEm: number;
}

export interface Trabalho {
  id: string;
  descricao: string;
  valor: number;
  status: StatusTrabalho;
  clienteId: string;
  clienteNome: string;
  criadoEm: number;
  finalizadoEm?: number;
  dataEntrega?: number;
  observacoes?: string;
  fechado: boolean;
  fechamentoId?: string;
}

export interface Fechamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  mesReferencia: number;
  anoReferencia: number;
  valorTotal: number;
  trabalhoIds: string[];
  criadoEm: number;
}

export interface Arquivo {
  id: string;
  clienteId: string;
  nome: string;
  imagemBase64: string;
  criadoEm: number;
}
