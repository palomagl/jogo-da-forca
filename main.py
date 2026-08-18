import tkinter as tk
import random

# --- DADOS DOS JOGOS ---
PALAVRAS_COM_DICAS = {
    "python": "Linguagem de programação", "computador": "Máquina que processa dados",
    "hardware": "Parte física do computador", "software": "Parte lógica/programas",
    "internet": "Rede mundial de computadores", "mouse": "Periférico de apontamento",
    "teclado": "Periférico de entrada de texto", "hacker": "Especialista em segurança",
    "java": "Linguagem com máquina virtual", "javascript": "Linguagem da Web",
    "web": "Sistema de informações conectadas", "servidor": "Computador que fornece serviços",
}

PALAVRAS_TERMO = [
    "PLACA", "DADOS", "LINHA", "LETRA", "TEXTO", "FESTA", "NOITE", "LIVRO",
    "MOUSE", "TECLA", "VIRUS", "TELAS", "REDES", "DEBUG", "FONTE"
]


# --- POP-UP CUSTOMIZADO ---
def mostrar_alerta(parent, titulo, mensagem, cor_destaque):
    alerta = tk.Toplevel(parent)
    alerta.title(titulo)
    alerta.geometry("350x200")
    alerta.configure(bg="#282A36")
    alerta.resizable(False, False)
    alerta.transient(parent)
    alerta.grab_set()

    x = parent.winfo_x() + (parent.winfo_width() // 2) - 175
    y = parent.winfo_y() + (parent.winfo_height() // 2) - 100
    alerta.geometry(f"+{x}+{y}")

    tk.Label(alerta, text=titulo, font=("Verdana", 16, "bold"), bg="#282A36", fg=cor_destaque).pack(pady=(20, 10))
    tk.Label(alerta, text=mensagem, font=("Verdana", 12), bg="#282A36", fg="#F8F8F2", justify="center").pack(pady=10)

    btn_ok = tk.Button(alerta, text="OK", font=("Verdana", 12, "bold"), bg=cor_destaque, fg="#282A36",
                       activebackground="#F8F8F2", borderwidth=0, cursor="hand2", width=10,
                       command=alerta.destroy)
    btn_ok.pack(pady=15)

    btn_ok.bind("<Enter>", lambda e: btn_ok.config(bg="#F8F8F2", fg="#282A36"))
    btn_ok.bind("<Leave>", lambda e: btn_ok.config(bg=cor_destaque, fg="#282A36"))


# --- JOGO TERMO ---
class JogoTermo:
    def __init__(self, parent):
        self.window = tk.Toplevel(parent)
        self.window.title("TERMO - Minigame")
        self.window.geometry("450x600")
        self.window.configure(bg="#1E1E2E")
        self.window.resizable(False, False)
        self.window.transient(parent)
        self.window.grab_set()

        x = parent.winfo_x() + 125
        y = parent.winfo_y() + 100
        self.window.geometry(f"+{x}+{y}")

        self.palavra_alvo = random.choice(PALAVRAS_TERMO).upper()
        self.tentativa_atual = 0
        self.letra_atual = 0
        self.jogo_ativo = True

        self.construir_interface()
        self.window.bind("<Key>", self.capturar_teclado)
        self.window.focus_set()

    def construir_interface(self):
        tk.Label(self.window, text="TERMO", font=("Verdana", 28, "bold"), bg="#1E1E2E", fg="#FF79C6").pack(
            pady=(20, 10))
        tk.Label(self.window, text="Adivinhe a palavra em 6 tentativas", font=("Verdana", 10), bg="#1E1E2E",
                 fg="#6272A4").pack(pady=(0, 20))

        self.frame_grid = tk.Frame(self.window, bg="#1E1E2E")
        self.frame_grid.pack()

        self.labels_grid = []
        for linha in range(6):
            linha_labels = []
            for coluna in range(5):
                lbl = tk.Label(self.frame_grid, text="", font=("Verdana", 26, "bold"),
                               width=2, height=1, bg="#282A36", fg="#F8F8F2",
                               relief="flat", borderwidth=2, highlightbackground="#44475A", highlightthickness=2)
                lbl.grid(row=linha, column=coluna, padx=6, pady=6)
                linha_labels.append(lbl)
            self.labels_grid.append(linha_labels)

        tk.Label(self.window, text="Digite pelo teclado e aperte ENTER", font=("Verdana", 10, "italic"), bg="#1E1E2E",
                 fg="#6272A4").pack(pady=25)

    def capturar_teclado(self, event):
        if not self.jogo_ativo: return
        letra = event.keysym.upper()

        if letra.isalpha() and len(letra) == 1:
            if self.letra_atual < 5:
                self.labels_grid[self.tentativa_atual][self.letra_atual].config(text=letra)
                self.letra_atual += 1
        elif letra == "BACKSPACE":
            if self.letra_atual > 0:
                self.letra_atual -= 1
                self.labels_grid[self.tentativa_atual][self.letra_atual].config(text="")
        elif letra == "RETURN":
            if self.letra_atual == 5:
                self.verificar_palavra()

    def verificar_palavra(self):
        palpite = "".join([lbl.cget("text") for lbl in self.labels_grid[self.tentativa_atual]])
        letras_alvo = list(self.palavra_alvo)

        for i in range(5):
            lbl = self.labels_grid[self.tentativa_atual][i]
            if palpite[i] == self.palavra_alvo[i]:
                lbl.config(bg="#50FA7B", fg="#282A36", highlightbackground="#50FA7B")
                letras_alvo[i] = None

        for i in range(5):
            lbl = self.labels_grid[self.tentativa_atual][i]
            if lbl.cget("bg") != "#50FA7B":
                if palpite[i] in letras_alvo:
                    lbl.config(bg="#F1FA8C", fg="#282A36", highlightbackground="#F1FA8C")
                    letras_alvo[letras_alvo.index(palpite[i])] = None
                else:
                    lbl.config(bg="#44475A", fg="#F8F8F2", highlightbackground="#44475A")

        if palpite == self.palavra_alvo:
            self.jogo_ativo = False
            mostrar_alerta(self.window, "Sucesso", f"Você acertou a palavra:\n\n{self.palavra_alvo}", "#50FA7B")
        else:
            self.tentativa_atual += 1
            self.letra_atual = 0
            if self.tentativa_atual == 6:
                self.jogo_ativo = False
                mostrar_alerta(self.window, "Fim de Jogo",
                               f"As tentativas acabaram.\nA palavra era:\n\n{self.palavra_alvo}", "#FF5555")


# --- JOGO DA FORCA PRINCIPAL ---
class JogoDaForcaMaster:
    def __init__(self, root):
        self.root = root
        self.root.title("Forca & Termo - Ultimate Edition")
        self.root.geometry("700x900")
        self.root.configure(bg="#1E1E2E")
        self.root.resizable(False, False)
        self.centralizar_janela(700, 900)

        # Usa bind_all globalmente para garantir que qualquer tecla seja capturada em cima de qualquer widget
        self.root.bind_all("<Key>", self.capturar_teclado)
        self.root.focus_set()

        self.pontos = 0
        self.streak = 0
        self.botoes_teclado = {}
        self.dificuldade_atual = "Facil"
        self.botoes_dificuldade = {}

        self.construir_interface()
        self.iniciar_jogo()

    def centralizar_janela(self, largura, altura):
        x = (self.root.winfo_screenwidth() // 2) - (largura // 2)
        y = (self.root.winfo_screenheight() // 2) - (altura // 2) - 30
        self.root.geometry(f"{largura}x{altura}+{x}+{y}")

    def aplicar_hover(self, widget, bg_normal, bg_hover):
        widget.bind("<Enter>", lambda e: widget.config(bg=bg_hover) if str(widget.cget('state')) == 'normal' else None)
        widget.bind("<Leave>", lambda e: widget.config(bg=bg_normal) if str(widget.cget('state')) == 'normal' else None)

    def construir_interface(self):
        self.top_frame = tk.Frame(self.root, bg="#282A36", height=65)
        self.top_frame.pack(fill=tk.X)
        self.top_frame.pack_propagate(False)

        self.score_label = tk.Label(self.top_frame, text="Pontos: 0", font=("Verdana", 12, "bold"), bg="#282A36",
                                    fg="#F1FA8C")
        self.score_label.pack(side=tk.LEFT, padx=20, pady=18)

        self.btn_termo = tk.Button(self.top_frame, text="MODO TERMO ➔", font=("Verdana", 11, "bold"),
                                   bg="#FF79C6", fg="#282A36", activebackground="#BD93F9", borderwidth=0,
                                   cursor="hand2", command=self.abrir_termo, padx=15, pady=8)
        self.btn_termo.pack(side=tk.LEFT, expand=True, pady=12)
        self.aplicar_hover(self.btn_termo, "#FF79C6", "#BD93F9")

        self.streak_label = tk.Label(self.top_frame, text="Combo: 0", font=("Verdana", 12, "bold"), bg="#282A36",
                                     fg="#FFB86C")
        self.streak_label.pack(side=tk.RIGHT, padx=20, pady=18)

        tk.Label(self.root, text="JOGO DA FORCA", font=("Verdana", 26, "bold"), bg="#1E1E2E", fg="#F8F8F2").pack(
            pady=(15, 5))

        self.diff_frame = tk.Frame(self.root, bg="#1E1E2E")
        self.diff_frame.pack(pady=5)

        niveis = [("Fácil", "#50FA7B", "Facil"), ("Médio", "#F1FA8C", "Medio"), ("Difícil", "#FF5555", "Dificil")]
        for texto, cor, valor in niveis:
            btn = tk.Button(self.diff_frame, text=texto, font=("Verdana", 10, "bold"), width=12, pady=5,
                            bg="#44475A", fg=cor, activebackground=cor, activeforeground="#282A36",
                            borderwidth=0, cursor="hand2", command=lambda v=valor: self.mudar_dificuldade(v))
            btn.pack(side=tk.LEFT, padx=5)
            self.botoes_dificuldade[valor] = btn

        self.dica_label = tk.Label(self.root, text="Dica: ...", font=("Verdana", 14, "italic"), bg="#1E1E2E",
                                   fg="#8BE9FD")
        self.dica_label.pack(pady=8)

        self.canvas = tk.Canvas(self.root, width=250, height=230, bg="#1E1E2E", highlightthickness=0)
        self.canvas.pack(pady=2)

        self.palavra_label = tk.Label(self.root, text="", font=("Courier New", 38, "bold"), bg="#1E1E2E", fg="#50FA7B")
        self.palavra_label.pack(pady=10)

        self.teclado_frame = tk.Frame(self.root, bg="#1E1E2E")
        self.teclado_frame.pack(pady=5)
        self.criar_teclado_virtual()

        self.btn_acao = tk.Button(self.root, text="PULAR PALAVRA", font=("Verdana", 12, "bold"),
                                  bg="#6272A4", fg="#F8F8F2", activebackground="#BD93F9",
                                  borderwidth=0, cursor="hand2", command=self.pular_palavra, width=20, height=2)
        self.btn_acao.pack(pady=10)
        self.aplicar_hover(self.btn_acao, "#6272A4", "#BD93F9")

    def abrir_termo(self):
        JogoTermo(self.root)
        self.root.focus_set()

    def mudar_dificuldade(self, nivel):
        self.dificuldade_atual = nivel
        self.streak = 0
        self.atualizar_placares()
        self.iniciar_jogo()
        self.root.focus_set()

    def atualizar_botoes_dificuldade(self):
        cores = {"Facil": "#50FA7B", "Medio": "#F1FA8C", "Dificil": "#FF5555"}
        for valor, btn in self.botoes_dificuldade.items():
            if valor == self.dificuldade_atual:
                btn.config(bg=cores[valor], fg="#282A36")
                self.aplicar_hover(btn, cores[valor], cores[valor])
            else:
                btn.config(bg="#44475A", fg=cores[valor])
                self.aplicar_hover(btn, "#44475A", "#6272A4")

    def criar_teclado_virtual(self):
        linhas = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
        for linha in linhas:
            frame = tk.Frame(self.teclado_frame, bg="#1E1E2E")
            frame.pack(pady=2)
            for letra in linha:
                btn = tk.Button(frame, text=letra, font=("Verdana", 11, "bold"),
                                width=4, height=2, bg="#44475A", fg="#F8F8F2",
                                borderwidth=0, cursor="hand2",
                                command=lambda l=letra: self.clicar_teclado_virtual(l.lower()))
                btn.pack(side=tk.LEFT, padx=3)
                self.aplicar_hover(btn, "#44475A", "#6272A4")
                self.botoes_teclado[letra.lower()] = btn

    def clicar_teclado_virtual(self, letra):
        self.processar_palpite(letra)
        self.root.focus_set()

    def desenhar_forca_base(self):
        self.canvas.delete("all")
        c = "#6272A4"
        self.canvas.create_line(20, 210, 100, 210, width=5, fill=c)
        self.canvas.create_line(60, 210, 60, 10, width=5, fill=c)
        self.canvas.create_line(60, 10, 150, 10, width=5, fill=c)
        self.canvas.create_line(150, 10, 150, 40, width=5, fill=c)

    def desenhar_erro(self, erros):
        c = "#FF5555"
        if self.dificuldade_atual == "Dificil":
            if erros == 1:
                self.canvas.create_oval(125, 40, 175, 90, width=5, outline=c)
                self.canvas.create_line(150, 90, 150, 150, width=5, fill=c)
            elif erros == 2:
                self.canvas.create_line(150, 110, 110, 135, width=5, fill=c)
                self.canvas.create_line(150, 110, 190, 135, width=5, fill=c)
            elif erros == 3:
                self.canvas.create_line(150, 150, 110, 190, width=5, fill=c)
            elif erros == 4:
                self.canvas.create_line(150, 150, 190, 190, width=5, fill=c)
                self.canvas.create_text(150, 65, text="X X", font=("Arial", 11, "bold"), fill=c)
        else:
            if erros == 1:
                self.canvas.create_oval(125, 40, 175, 90, width=5, outline=c)
            elif erros == 2:
                self.canvas.create_line(150, 90, 150, 150, width=5, fill=c)
            elif erros == 3:
                self.canvas.create_line(150, 110, 110, 135, width=5, fill=c)
            elif erros == 4:
                self.canvas.create_line(150, 110, 190, 135, width=5, fill=c)
            elif erros == 5:
                self.canvas.create_line(150, 150, 110, 190, width=5, fill=c)
            elif erros == 6:
                self.canvas.create_line(150, 150, 190, 190, width=5, fill=c)
                self.canvas.create_text(150, 65, text="X X", font=("Arial", 11, "bold"), fill=c)

    def tremer_janela(self):
        x, y = self.root.winfo_x(), self.root.winfo_y()
        for i, offset in enumerate([10, -10, 10, -10, 0]):
            self.root.after(i * 30, lambda o=offset: self.root.geometry(f"+{x + o}+{y}"))

    def iniciar_jogo(self):
        self.palavra, dica = random.choice(list(PALAVRAS_COM_DICAS.items()))
        self.atualizar_botoes_dificuldade()

        if self.dificuldade_atual == "Facil":
            self.dica_label.config(text=f"Dica: {dica}", fg="#8BE9FD")
            self.tentativas_maximas = 6
        elif self.dificuldade_atual == "Medio":
            self.dica_label.config(text="Dica: Oculta (Modo Médio)", fg="#6272A4")
            self.tentativas_maximas = 6
        elif self.dificuldade_atual == "Dificil":
            self.dica_label.config(text="Dica: Oculta | Apenas 4 Tentativas!", fg="#FF5555")
            self.tentativas_maximas = 4

        self.erros = 0
        self.letras_descobertas = ["_"] * len(self.palavra)
        self.letras_usadas = []
        self.jogo_ativo = True

        self.btn_acao.config(text="PULAR PALAVRA", bg="#6272A4", fg="#F8F8F2", command=self.pular_palavra)
        self.aplicar_hover(self.btn_acao, "#6272A4", "#BD93F9")
        self.palavra_label.config(fg="#F8F8F2")

        for btn in self.botoes_teclado.values():
            btn.config(bg="#44475A", fg="#F8F8F2", state="normal")
            self.aplicar_hover(btn, "#44475A", "#6272A4")

        self.desenhar_forca_base()
        self.atualizar_tela()
        self.root.focus_set()

    def pular_palavra(self):
        self.streak = 0
        self.atualizar_placares()
        self.iniciar_jogo()
        self.root.focus_set()

    def atualizar_tela(self):
        self.palavra_label.config(text=" ".join(self.letras_descobertas))

    def atualizar_placares(self):
        self.score_label.config(text=f"Pontos: {self.pontos}")
        self.streak_label.config(text=f"Combo: {self.streak}")

    def capturar_teclado(self, event):
        # Evita conflito se houver outra janela Toplevel aberta por cima capturando foco
        if self.root.focus_get() and str(self.root.focus_get()).startswith(".!toplevel"):
            return

        if not self.jogo_ativo:
            if event.keysym == 'Return':
                self.iniciar_jogo()
            return

        letra = event.char.lower()
        if letra.isalpha() and len(letra) == 1:
            self.processar_palpite(letra)

    def processar_palpite(self, letra):
        if not self.jogo_ativo or letra in self.letras_usadas:
            return

        self.letras_usadas.append(letra)
        btn = self.botoes_teclado.get(letra)

        if letra in self.palavra:
            if btn:
                btn.config(bg="#50FA7B", fg="#282A36", state="disabled")
                btn.unbind("<Enter>")
            for i in range(len(self.palavra)):
                if self.palavra[i] == letra:
                    self.letras_descobertas[i] = letra
        else:
            if btn:
                btn.config(bg="#FF5555", fg="#F8F8F2", state="disabled")
                btn.unbind("<Enter>")
            self.erros += 1
            self.desenhar_erro(self.erros)
            self.tremer_janela()

        self.atualizar_tela()
        self.verificar_fim_de_jogo()

    def verificar_fim_de_jogo(self):
        if "_" not in self.letras_descobertas:
            self.jogo_ativo = False
            base_pts = {"Facil": 50, "Medio": 100, "Dificil": 200}
            self.pontos += base_pts[self.dificuldade_atual] + (self.streak * 25)
            self.streak += 1
            self.atualizar_placares()
            self.palavra_label.config(fg="#50FA7B")
            self.btn_acao.config(text="PRÓXIMA PALAVRA ➔", bg="#50FA7B", fg="#282A36", command=self.iniciar_jogo)
            self.aplicar_hover(self.btn_acao, "#50FA7B", "#50FA7B")

        elif self.erros >= self.tentativas_maximas:
            self.jogo_ativo = False
            self.streak = 0
            self.atualizar_placares()
            self.palavra_label.config(text=" ".join(list(self.palavra)), fg="#FF5555")
            self.btn_acao.config(text="TENTAR NOVAMENTE ↻", bg="#FF5555", fg="#F8F8F2", command=self.iniciar_jogo)
            self.aplicar_hover(self.btn_acao, "#FF5555", "#FF5555")


if __name__ == "__main__":
    root = tk.Tk()
    app = JogoDaForcaMaster(root)
    root.mainloop()