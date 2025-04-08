// Conexão com o servidor via Socket.io
const socket = io();

// Referências dos elementos DOM
const mensagens = document.getElementById("mensagens");
const mensagemInput = document.getElementById("mensagem");
const chatForm = document.getElementById("chatForm");
const loginSection = document.getElementById("loginSection");
const chatSection = document.getElementById("chatSection");
const usernameInput = document.getElementById("usernameInput");
const errorMessage = document.getElementById("errorMessage");
const usuariosOnlineDisplay = document.getElementById("usuariosOnline");
const loginButton = document.getElementById("loginButton");

// Verifica se o nome de usuário já está armazenado
let username = sessionStorage.getItem("username");

// Se já houver nome de usuário, entra diretamente no chat
if (username) {
    loginSection.style.display = "none";
    chatSection.style.display = "block";
    socket.emit("set username", username);
}

// Lidar com o login
loginButton.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (username) {
        sessionStorage.setItem("username", username);
        loginSection.style.display = "none";
        chatSection.style.display = "block";
        socket.emit("set username", username);
        errorMessage.style.display = "none";
    } else {
        errorMessage.style.display = "block";
    }
});

// Enviar mensagem do chat
chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const mensagem = mensagemInput.value.trim();
    if (mensagem) {
        socket.emit("chat message", { nome: username, mensagem });
        mensagemInput.value = "";

        // Adiciona a própria mensagem imediatamente à direita
        adicionarMensagem({ nome: "Você", mensagem }, true);
    }
});

// Função para adicionar mensagem ao chat
function adicionarMensagem(dados, isOwnMessage = false) {
    if (!dados || !dados.nome || !dados.mensagem) return; // Evita exibição de mensagens inválidas

    const lista = document.createElement("li");
    
    // Adiciona classe diferente para mensagens próprias
    lista.classList.add(isOwnMessage ? "mensagem-direita" : "mensagem-esquerda");
    
    lista.innerHTML = `<b>${dados.nome}:</b> ${dados.mensagem}`;
    mensagens.appendChild(lista);
    mensagens.scrollTop = mensagens.scrollHeight;
}

// Receber mensagens do chat
socket.on("chat message", (dados) => {
    if (!dados || !dados.nome || !dados.mensagem) {
        console.error("Mensagem inválida recebida:", dados);
        return;
    }
    if (dados.nome !== username) {
        adicionarMensagem(dados);
    }
});

// Atualizar contagem de usuários online
socket.on("usuarios online", (total) => {
    usuariosOnlineDisplay.textContent = `Usuários online: ${total}`;
});
