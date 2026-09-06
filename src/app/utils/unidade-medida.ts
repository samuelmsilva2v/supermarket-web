export interface UnidadeMedidaOpcao {
    valor: string;
    rotulo: string;
    curto: string;
}

export const UNIDADES_MEDIDA: UnidadeMedidaOpcao[] = [
    { valor: 'UNIDADE', rotulo: 'Unidade', curto: 'un' },
    { valor: 'KG', rotulo: 'Quilograma', curto: 'kg' },
    { valor: 'LITRO', rotulo: 'Litro', curto: 'L' },
    { valor: 'CAIXA', rotulo: 'Caixa', curto: 'cx' }
];

export function abreviacaoUnidadeMedida(unidade: string): string {
    return UNIDADES_MEDIDA.find(u => u.valor === unidade)?.curto ?? unidade;
}
