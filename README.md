# Forca & Termo - Desktop Application

Aplicação desktop desenvolvida em Python utilizando a biblioteca Tkinter, estruturada com conceitos de Orientação a Objetos (POO). O projeto evolui o tradicional jogo de terminal para uma interface gráfica moderna, responsiva e com suporte a múltiplos modos de jogo.

## Arquitetura e Funcionalidades

* **Interface Gráfica (GUI) Nativa:** Desenvolvida inteiramente com Tkinter, utilizando um padrão visual *dark mode* baseado na paleta Dracula.
* **Mecannicas de Jogo Avançadas:**
  * **Sincronização de Entrada:** Captura de eventos via teclado físico e teclado virtual interativo na tela.
  * **Sistema de Dificuldades:** Parâmetros dinâmicos para Fácil (com dicas textuais e 6 tentativas), Médio (sem dicas) e Difícil (4 tentativas e renderização acelerada de erros).
  * **Sistema de Pontuação e Streak:** Cálculo de pontuação baseado na dificuldade selecionada e no encadeamento de vitórias consecutivas.
  * **Feedback Visual e Tátil:** Implementação de pop-ups modulares customizados e efeito de deslocamento lateral da janela (*screen shake*) em caso de erro.
* **Minigame Integrado (TERMO):** Módulo secundário baseado em arquitetura de janelas modulares (`Toplevel`), replicando a dinâmica de adivinhação de palavras com validação cromática de posições.

## Estrutura do Código

O projeto está estruturado em classes principais para garantir modularidade e clareza:
* `JogoDaForcaMaster`: Controla o fluxo principal do jogo, gerenciamento de estado, renderização do Canvas e interações com o teclado.
* `JogoTermo`: Controla a lógica isolada do minigame de adivinhação de termos, matrizes de validação e feedback de letras.

## Requisitos de Execução

O projeto utiliza exclusivamente bibliotecas nativas da biblioteca padrão do Python, dispensando o uso de gerenciadores de pacotes externos (`pip`).

* **Dependência:** Python 3.8 ou superior.

## Execução via Linha de Comando

1. Clone o repositório para sua máquina local:
   ```bash
   git clone [https://github.com/SEU_USUARIO/nome-do-repositorio.git](https://github.com/SEU_USUARIO/nome-do-repositorio.git)