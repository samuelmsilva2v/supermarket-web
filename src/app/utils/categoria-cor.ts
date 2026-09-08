// Paleta terrosa/fresca para colorir categorias dinamicamente (não há como fixar
// cor por nome, já que categorias são cadastradas livremente pelo usuário).
const PALETA_CATEGORIAS = [
    '#C1440E', // terracota
    '#2F5233', // oliva
    '#B08900', // mostarda
    '#7A4B3A', // barro
    '#3C6E8F', // azul-petróleo
    '#8A3B52', // vinho
    '#9C6B1F', // trigo
    '#5B4636', // café
    '#4C6B62', // sálvia
    '#A6763E', // caramelo
    '#6E5773'  // ameixa-acinzentada
];

// Usa FNV-1a (boa dispersão de bits) em vez de um hash polinomial simples, que colidia
// com frequência nos bits baixos para nomes curtos.
export function corDaCategoria(chave: string): string {
    let hash = 0x811c9dc5;
    for (const c of chave) {
        hash ^= c.charCodeAt(0);
        hash = Math.imul(hash, 0x01000193);
    }
    return PALETA_CATEGORIAS[(hash >>> 0) % PALETA_CATEGORIAS.length];
}
