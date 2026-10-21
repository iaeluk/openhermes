# openhermes: especificação de layout

Comportamento exato aprovado na prévia (`preview/index.html`). Toda regra abaixo foi verificada contra o OpenCode 2.0.32 real via capturas de terminal.

## Tela inicial (estado vazio)

- Sem barra de abas. Começa direto no logo.
- Logo HERMES em bloco centralizado (nome customizável troca por texto grande espaçado; voltar para Hermes restaura o bloco).
- Caixa de entrada centralizada (~71 colunas): linha de digitação com placeholder esmaecido calculado por tema, linha de modelo `AGENTE · modelo provider · max` (agente em destaque, variante em laranja).
- Linha de dicas abaixo: `~` à esquerda, `shift+tab agentes` e `ctrl+p comandos` à direita.
- Rodapé: contagens reais à esquerda, versão à direita, com respiro de uma linha vazia abaixo.

## Abas

- A barra aparece com 2+ abas ou conversa ativa; some na inicial limpa.
- O `+` fica colado na última aba e some enquanto a aba atual é nova; volta após digitar.
- Aba clicável na área toda; × fecha (visível na ativa e no hover, sem deslocar layout).
- Título da aba = início da primeira mensagem; fechar última aba limpa em vez de fechar; reabrir restaura por pilha.

## Conversa

- Transcript full-width a partir do topo; só o meio rola.
- Mensagem do usuário em faixa larga com barra lateral de destaque, sem caracteres de caixa.
- Resposta em texto corrido, sem avatar. Ferramenta como linha simples com seta (`→ Explored: N reads`).
- Meta do turno em atenuado com o agente em destaque.
- Caixa fixa acima do rodapé, grudada independente do tamanho da conversa.
- Modo PLAN: o texto é enviado como `/plan <prompt>`; turno mostra escrita em `.hermes/plans/` sem execução.

## Ctrl+P

- Abre o menu completo com cursor na busca. Filtrar esconde grupos vazios e marca o primeiro resultado.
- Seleção em barra sólida na cor de seleção do tema, com contraste automático.
- Setas navegam com rolagem presa ao item; Enter executa; esc volta um nível ou fecha.
- Views: Commands (Suggested, Session, Agent, Integration, System, Help, Prompt), Settings (Aparência, Sessão, troca por clique ou setas), Themes (33 em ordem alfabética, ● no atual, prévia ao vivo no hover, Enter confirma, esc desfaz), Models (Recent + grupos, troca reflete na caixa), Sessions (abas reais com ● na atual), Name (campo que troca o nome da inicial).

## Agentes (shift+tab)

- Cicla SMART, PLAN, YOLO. Reflete como primeira palavra da linha da caixa.
- SMART aprova com bom senso; PLAN envia como `/plan`; YOLO aprova tudo sem pedir.

## Slash `/`

- Popup acima da caixa ao digitar `/`, comandos reais do Hermes em ordem alfabética com descrição cinza, filtro por nome, apelido e descrição.
- Setas navegam, Enter ou Tab completa, esc fecha, clique completa. Sem comandos exclusivos de gateway.

## Temas e responsivo

- 33 temas com modos claro e escuro; modo system segue o terminal; placeholder sempre esmaecido por cálculo.
- Zoom e resize só mudam a grade de caracteres: layout em flex e porcentagem, sem largura fixa em pixel; abaixo de ~80 colunas a paleta vira tela cheia.
