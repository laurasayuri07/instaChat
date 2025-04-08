const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let usuariosOnline = 0;

app.use(express.static("public"));
app.use(express.json());

// Rota de login
app.post("/login", (req, res) => {
    const { username } = req.body;
    if (username && username.trim() !== "") {
        return res.json({ success: true, username: username.trim() });
    }
    return res.json({ success: false, message: "Nome de usuário inválido" });
});

io.on("connection", (socket) => {
    usuariosOnline++;
    io.emit("usuarios online", usuariosOnline);

    socket.username = null;

    socket.on("set username", (name) => {
        if (name && name.trim() !== "") {
            socket.username = name.trim();
            console.log(`${socket.username} entrou no chat`);
        }
    });

    socket.on("chat message", (msg) => {
        if (!socket.username) {
            console.log("Erro: Usuário não definido, ignorando mensagem.");
            return;
        }

        if (msg && typeof msg === "object" && msg.mensagem && msg.mensagem.trim() !== "") {
            io.emit("chat message", { nome: socket.username, mensagem: msg.mensagem.trim() });
        } else {
            console.log("Erro: Mensagem inválida recebida.", msg);
        }
    });

    socket.on("disconnect", () => {
        usuariosOnline--;
        io.emit("usuarios online", usuariosOnline);
    });
});

server.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
