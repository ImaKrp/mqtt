# Universidade Federal — Redes de Computadores  
### Trabalho Prático: Aplicação de Bate-Papo (Chat) com Protocolo MQTT  

**Disciplina:** TÓPICOS ESPECIAIS EM COMPUTAÇÃO XIII  
**Professor:** Marco Aurélio Spohn  
**Semestre:** 2025/2  
**Integrantes:**    
- Julio Carvalho Gonçalves | Matrícula: 2311100012  
- Thiago Augusto Busanello Spanevello | Matrícula: 2311100016


---

## 📝 Descrição 
Este trabalho tem como objetivo a implementação de uma **aplicação de bate-papo (chat)** utilizando o **protocolo MQTT**, um protocolo de comunicação leve baseado no modelo **publicador/assinante**.  
A aplicação foi desenvolvida em **JavaScript**, com interface em **HTML e CSS**, e utiliza o **broker Mosquitto** para gerenciar a troca de mensagens entre os clientes conectados.

---

## ✅ Funcionalidades
- Conexão e desconexão dinâmica com o broker MQTT.  
- Criação e assinatura em tópicos de conversa.  
- Envio e recebimento de mensagens em tempo real.  
- Interface gráfica interativa para controle de chats e contatos.  
- Indicação visual de status de conexão.  
- Suporte ao envio de imagens e histórico de mensagens.  

---

## 🧩 Arquitetura do Projeto  

### 📚 Tópicos Utilizados  
- **userTopic:** controle de operações individuais (`clientId_ + name`)  
- **GROUPS:** gerenciamento de grupos criados  
- **usersStatus:** status dos usuários (online/offline)  
- **chat/** → conversas privadas (`chat/requisitante_requisitado_timestamp`)  
- **group/** → conversas em grupo (`group/código`)  

---

### 🧠 Descrição dos Tópicos  

#### 🗨️ userTopic  
Usado na criação do cliente e assinado apenas por ele mesmo, servindo para controle de operações.  
Exemplo: cliente A quer iniciar um chat com cliente B → A envia uma mensagem para o `userTopic` de B contendo o convite.  

#### 👥 GROUPS  
Responsável por registrar grupos criados e controlar solicitações de entrada via código.  
Permite que diferentes usuários entrem em grupos existentes ou criem novos tópicos `group/<código>`.

#### 🔁 usersStatus  
Controla o status dos usuários, enviando periodicamente mensagens que indicam se estão online.  
Essas informações permitem controlar a entrega de mensagens e indicar o status na interface.  

#### 💬 Chats e Grupos  
As mensagens enviadas em chats privados ou grupos seguem o padrão de objeto JSON:  
```js
{
  type: "message",
  from: "id",
  timestamp: "time",
  message: "conteúdo"
}
```
---

## ⚙️ Mecanismos Aplicados  

### 🔗 Conexão ao Broker  
A conexão é iniciada quando o usuário informa seu nome e clica em “Conectar”.  
Um cliente MQTT é criado com o nome informado, e *callbacks* são definidos para lidar com conexão, desconexão e perda de comunicação.  
Após a conexão, o status visual é atualizado indicando que o cliente está online.  

### ✉️ Envio e Recebimento de Mensagens  
As mensagens são enviadas por `handleSendMessage()` e encapsuladas em JSON (tipo, remetente, conteúdo, timestamp).  
Utiliza-se **QoS 2**, garantindo entrega única e confiável.  
Mensagens de usuários offline são entregues assim que o cliente reconecta, com histórico mantido via **localStorage**.  

### 👥 Criação e Gerenciamento de Chats e Grupos  
- Convites são enviados via mensagens MQTT do tipo `"invite"`.  
- Quando aceitos, é criado um tópico exclusivo `chat/id1_id2_timestamp`.  
- Grupos seguem o formato `group/<código>` e são gerenciados por mensagens `"reqResponse"` e `"group-taken"`.  

### 🧍‍♂️ Atualização de Status e Presença  
O status dos usuários é atualizado a cada 2,5 segundos através do tópico `usersStatus`.  
O sistema mantém um registro local do último *timestamp* online e exibe indicadores de **Online/Offline** em tempo real.  

### 🖥️ Interface e Interação  
A interface é controlada via **JavaScript** e **CSS puro**.  
Contém abas, botões, modais e *toasts* de feedback.  
Os modais tratam convites e criação de chats; as *toasts* exibem notificações rápidas de conexão e eventos.  
A interface é responsiva e se adapta à tela, com sidebar dinâmica e layout limpo.  

---

## 🧰 Implementação  
O projeto foi desenvolvido em **JavaScript**, pela familiaridade dos integrantes com a linguagem.  
Inicialmente, o foco esteve nas funcionalidades básicas (chats e grupos), evoluindo para status de usuários, envio de mensagens e depois a interface visual.  

Com o funcionamento consolidado, foram adicionadas melhorias como:
- Envio de imagens via chat  
- Histórico de mensagens (armazenado localmente)  
- Notificações de status de conexão e desconexão  

---

## 🚀 Instruções de Execução  

### 1️⃣ Iniciar o Broker Mosquitto  
No terminal:
```bash
cd "/pasta/do/projeto/MQTT"
mosquitto -c c.conf
```

### 2️⃣ Executar a Aplicação
Abra o arquivo `index.html`.  
Recomenda-se o uso da extensão **Live Server** ou **Five Server** do VSCode.  

Após instalar a extensão:  
1. Clique com o botão direito sobre o arquivo `index.html`.  
2. Selecione **“Open with Live Server”**.  

Ou utilize o atalho do Live Server:  
Alt+L+Alt+O

