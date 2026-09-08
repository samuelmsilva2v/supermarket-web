import { HttpInterceptorFn } from "@angular/common/http";
import { supermarketApi } from "../configurations/environment";

export const AuthInterceptor : HttpInterceptorFn = (req, next) => {

    if(req.url.includes(supermarketApi)) {

        var data = sessionStorage.getItem('usuario') as string;

        // Só anexar o TOKEN se já existir um usuário autenticado (evita quebrar login/cadastro)
        if(data) {
            var json = JSON.parse(data);

            const request = req.clone({
                setHeaders: { Authorization : 'Bearer ' + json.token }
            });

            return next(request);
        }
    }

    return next(req);
}
