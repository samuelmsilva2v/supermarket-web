export const supermarketApi = "http://localhost:8080";

export const endpoints = {
    produto : `${supermarketApi}/api/produtos`,
    consultar_produtos : `${supermarketApi}/api/produtos/consultar`,
    categoria : `${supermarketApi}/api/categorias`,
    consultar_categorias : `${supermarketApi}/api/categorias/consultar`,
    dashboard_categorias : `${supermarketApi}/api/dashboard/produtos-categoria`,
    autenticar_usuario : `${supermarketApi}/api/usuario/autenticar`,
    criar_usuario : `${supermarketApi}/api/usuario/criar`,
    usuario : `${supermarketApi}/api/usuario`,
    consultar_usuarios : `${supermarketApi}/api/usuario`
};
