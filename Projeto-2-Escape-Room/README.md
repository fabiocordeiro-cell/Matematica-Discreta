# Projeto 2 — Escape Room de Análise Combinatória

Projeto acadêmico de Matemática Discreta (UTFPR).

## Jogar

Abra `index.html` no navegador para executar o jogo com a interface completa. Para utilizar um único arquivo sem dependências, abra `JOGAR_OFFLINE.html`.

## Arquivos

- `index.html`: página principal do jogo.
- `style.css`: estilos e adaptação para celulares.
- `app.js`: lógica de fases, sorteios, acertos, erros e cronômetro.
- `questoes.json`: versão independente do banco de 50 questões (o jogo traz o mesmo banco embutido no HTML para funcionar offline).
- `JOGAR_OFFLINE.html`: versão completa em um só arquivo.
- `BANCO_DE_QUESTOES.md`: enunciados, respostas e resoluções.
- `APRESENTACAO.md`: roteiro da apresentação.

## Regras

Cinco fases, com 1, 2, 2, 3 e 4 acertos necessários, respectivamente (12 ao todo); 10 questões por fase; sorteio sem repetição até esgotar a fase; limite de 15 minutos ou 8 erros; opção de reiniciar.

## Publicação

Para disponibilizar na internet, ative o GitHub Pages em **Settings → Pages → Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`, caso a página esteja na raiz de um repositório dedicado. Como este projeto está em uma subpasta de um repositório de disciplina, o caminho do jogo após a ativação do Pages na raiz será `/Projeto-2-Escape-Room/`.

Antes da entrega, a equipe deve testar o funcionamento do jogo, conferir as resoluções matemáticas e preparar a demonstração.

## Trilha sonora opcional

O jogo usa `trilha.mp3.mpeg` como trilha sonora padrão, em repetição. Na barra superior, os controles permitem pausar/reproduzir e ajustar o volume da música, independentemente dos efeitos do jogo. O botão **Escolher música** continua disponível para selecionar outro arquivo de áudio local (MP3, OGG, WAV ou M4A). Caso o navegador bloqueie o início automático, clique em **Reproduzir**.

Se quiser utilizar **Rockin' in the Free World**, selecione uma cópia do áudio para a qual tenha autorização de uso. O repositório não inclui a gravação nem faz download de serviços de streaming.
