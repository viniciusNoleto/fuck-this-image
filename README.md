# F*ck This Image

Site estático (estilo anos 2000) que destrói a qualidade de imagens e GIFs, porque meme em alta resolução não tem graça.

Tudo roda no navegador: nenhuma imagem é enviada para servidor nenhum.

## Como funciona

- **Imagens estáticas** (JPG, PNG, WEBP...): reduz a resolução, recomprime em JPEG várias vezes com qualidade baixíssima (variando o tamanho entre as passadas para acumular artefatos) e amplia de volta. Saída em `.jpg`.
- **GIFs animados**: cada quadro é decodificado, destruído do mesmo jeito, reduzido para poucas cores e recodificado. Em níveis altos, quadros são descartados para a animação ficar travada. Saída em `.gif`.
- Opções extras: *deep fry*, ruído de TV e pixelado.

GIFs são decodificados/codificados com [gifuct-js](https://github.com/matt-way/gifuct-js) e [gifenc](https://github.com/mattdesl/gifenc) (MIT), empacotados em `vendor/gif-libs.js`.

## Rodando localmente

Por usar ES modules, abra via servidor HTTP (não pelo `file://`):

```sh
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicando no GitHub Pages

1. Suba o repositório para o GitHub.
2. Em **Settings → Pages**, em *Build and deployment*, escolha **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)` e salve.
4. Em alguns minutos o site estará em `https://<seu-usuario>.github.io/<nome-do-repo>/`.
