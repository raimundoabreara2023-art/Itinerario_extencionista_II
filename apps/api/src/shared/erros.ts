export class ErroNegocio extends Error {
  constructor(
    mensagem: string,
    public readonly status: 401 | 403 | 404 | 409 | 422 = 422,
  ) {
    super(mensagem);
  }
}

export const naoEncontrado = (o: string) => new ErroNegocio(`${o} não encontrado(a)`, 404);
