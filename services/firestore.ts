import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Cliente, Trabalho, Fechamento, Arquivo, TipoCliente, StatusTrabalho } from '@/types';

const clientesRef = collection(db, 'clientes');
const trabalhosRef = collection(db, 'trabalhos');
const fechamentosRef = collection(db, 'fechamentos');
const arquivosRef = collection(db, 'arquivos');

function semUndefined<T extends object>(dados: T): Partial<T> {
  const entradas = Object.entries(dados).filter(([, valor]) => valor !== undefined);
  return Object.fromEntries(entradas) as Partial<T>;
}

function paraCliente(id: string, dados: DocumentData): Cliente {
  return {
    id,
    nome: dados.nome,
    tipo: dados.tipo,
    telefone: dados.telefone ?? undefined,
    email: dados.email ?? undefined,
    criadoEm: dados.criadoEm?.toMillis?.() ?? Date.now(),
  };
}

function paraTrabalho(id: string, dados: DocumentData): Trabalho {
  return {
    id,
    descricao: dados.descricao,
    valor: dados.valor,
    status: dados.status,
    clienteId: dados.clienteId,
    clienteNome: dados.clienteNome,
    criadoEm: dados.criadoEm?.toMillis?.() ?? Date.now(),
    finalizadoEm: dados.finalizadoEm?.toMillis?.() ?? undefined,
    dataEntrega: dados.dataEntrega?.toMillis?.() ?? undefined,
    observacoes: dados.observacoes ?? undefined,
    fechado: dados.fechado ?? false,
    fechamentoId: dados.fechamentoId ?? undefined,
  };
}

function paraFechamento(id: string, dados: DocumentData): Fechamento {
  return {
    id,
    clienteId: dados.clienteId,
    clienteNome: dados.clienteNome,
    mesReferencia: dados.mesReferencia,
    anoReferencia: dados.anoReferencia,
    valorTotal: dados.valorTotal,
    trabalhoIds: dados.trabalhoIds ?? [],
    criadoEm: dados.criadoEm?.toMillis?.() ?? Date.now(),
  };
}

export function ouvirClientes(callback: (clientes: Cliente[]) => void) {
  const q = query(clientesRef, orderBy('nome'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => paraCliente(d.id, d.data())));
  });
}

export function ouvirTrabalhos(callback: (trabalhos: Trabalho[]) => void) {
  const q = query(trabalhosRef, orderBy('criadoEm', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => paraTrabalho(d.id, d.data())));
  });
}

export function ouvirFechamentosDoCliente(clienteId: string, callback: (fechamentos: Fechamento[]) => void) {
  const q = query(fechamentosRef, where('clienteId', '==', clienteId), orderBy('criadoEm', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => paraFechamento(d.id, d.data())));
  });
}

function paraArquivo(id: string, dados: DocumentData): Arquivo {
  return {
    id,
    clienteId: dados.clienteId,
    nome: dados.nome,
    imagemBase64: dados.imagemBase64,
    criadoEm: dados.criadoEm?.toMillis?.() ?? Date.now(),
  };
}

export function ouvirArquivosDoCliente(clienteId: string, callback: (arquivos: Arquivo[]) => void) {
  const q = query(arquivosRef, where('clienteId', '==', clienteId), orderBy('criadoEm', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => paraArquivo(d.id, d.data())));
  });
}

export async function criarArquivo(dados: { clienteId: string; nome: string; imagemBase64: string }) {
  await addDoc(arquivosRef, { ...dados, criadoEm: serverTimestamp() });
}

export async function excluirArquivo(id: string) {
  await deleteDoc(doc(db, 'arquivos', id));
}

interface DadosCliente {
  nome: string;
  tipo: TipoCliente;
  telefone?: string;
  email?: string;
}

export async function criarCliente(dados: DadosCliente) {
  await addDoc(clientesRef, { ...semUndefined(dados), criadoEm: serverTimestamp() });
}

export async function atualizarCliente(id: string, dados: Partial<DadosCliente>) {
  await updateDoc(doc(db, 'clientes', id), semUndefined(dados));
}

export async function excluirCliente(
  clienteId: string,
  trabalhosDoCliente: Trabalho[],
  fechamentosDoCliente: Fechamento[],
  arquivosDoCliente: Arquivo[]
) {
  const batch = writeBatch(db);
  trabalhosDoCliente.forEach((t) => batch.delete(doc(db, 'trabalhos', t.id)));
  fechamentosDoCliente.forEach((f) => batch.delete(doc(db, 'fechamentos', f.id)));
  arquivosDoCliente.forEach((a) => batch.delete(doc(db, 'arquivos', a.id)));
  batch.delete(doc(db, 'clientes', clienteId));
  await batch.commit();
}

export async function criarTrabalho(dados: {
  descricao: string;
  valor: number;
  clienteId: string;
  clienteNome: string;
  dataEntrega?: number;
  observacoes?: string;
}) {
  const { dataEntrega, ...resto } = dados;
  await addDoc(trabalhosRef, {
    ...semUndefined(resto),
    ...(dataEntrega ? { dataEntrega: Timestamp.fromMillis(dataEntrega) } : {}),
    status: 'Iniciar' satisfies StatusTrabalho,
    fechado: false,
    criadoEm: serverTimestamp(),
  });
}

export async function atualizarTrabalho(id: string, dados: Record<string, unknown>) {
  await updateDoc(doc(db, 'trabalhos', id), semUndefined(dados));
}

export function timestampDe(epochMillis: number) {
  return Timestamp.fromMillis(epochMillis);
}

export async function excluirTrabalho(id: string) {
  await deleteDoc(doc(db, 'trabalhos', id));
}

export async function fecharMes(cliente: Cliente, trabalhosEmAberto: Trabalho[]): Promise<Fechamento> {
  const agora = new Date();
  const batch = writeBatch(db);
  const fechamentoDoc = doc(fechamentosRef);
  const valorTotal = trabalhosEmAberto.reduce((soma, t) => soma + t.valor, 0);

  batch.set(fechamentoDoc, {
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    mesReferencia: agora.getMonth() + 1,
    anoReferencia: agora.getFullYear(),
    valorTotal,
    trabalhoIds: trabalhosEmAberto.map((t) => t.id),
    criadoEm: serverTimestamp(),
  });

  trabalhosEmAberto.forEach((t) => {
    batch.update(doc(db, 'trabalhos', t.id), { fechado: true, fechamentoId: fechamentoDoc.id });
  });

  await batch.commit();

  return {
    id: fechamentoDoc.id,
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    mesReferencia: agora.getMonth() + 1,
    anoReferencia: agora.getFullYear(),
    valorTotal,
    trabalhoIds: trabalhosEmAberto.map((t) => t.id),
    criadoEm: Date.now(),
  };
}
