# Hunter Academy - Jogo 3D Educativo de Terror

## Visão Geral do Projeto
- **Nome**: Hunter Academy
- **Tipo**: RPG 3D Educativo de Terror
- **Plataforma**: Web (Three.js + Angular + Spring Boot)
- **Resumo**: Jogo de terror com yokais onde o jogador deve responder perguntas de programação e idiomas para defeat monstros e progredir
- **Público-alvo**: Estudantes de programação e idiomas (Japonês/Inglês)

---

## Especificação UI/UX

### 1. Layout de Estrutura

#### Telas Principais
1. **Tela Inicial** - Menu principal com cards de seleção
2. **Tela de Login/Registro** - Autenticação de usuário
3. **Tela de Perfil** - Estatísticas, conquistas, histórico
4. **Tela de Jogo** - Combate 3D com quiz
5. **Tela de Game Over** - Resultado final
6. **Tela de Menu de Pausa**

#### Responsividade
- Desktop: 1920x1080 (primário)
- Tablet: 1024x768
- Mobile: 375x812 (versão limitada)

### 2. Design Visual

#### Paleta de Cores
- **Primária**: `#1a0a2e` ( Roxo escuro - terror )
- **Secundária**: `#4a0e4e` ( Roxo médio )
- **Acento**: `#ff3366` ( Vermelho sangue )
- **Sucesso**: `#00ff88` ( Verde neon )
- **Texto Principal**: `#ffffff`
- **Texto Secundário**: `#b0b0b0`
- **Fundo**: `#0d0d1a`

#### Tipografia
- **Títulos**: "Creepster" (Google Fonts) - terror
- **Corpo**: "Rajdhani" (Google Fonts) - tech/gamer
- **Japonês**: "Noto Sans JP"

#### Efeitos Visuais
- Partículas de névoa
- Flash vermelho ao tomar dano
- Brilho verde ao acertar resposta
- Tremor de tela aoerrar
- Chamas/azul ao usar ataque especial

### 3. Componentes UI

#### Tela Inicial
- Logo animado com chama
- 3 Cards principais:
  - **Japonês**: Bandeira do Japão + ícone dragão
  - **Inglês**: Bandeira UK + ícone fantasma
  - **Programação**: Ícone de código +uteis
- Botão "Perfil" no canto
- Botão "Configurações"

#### Card de Categoria
- Tamanho: 280x350px
- Hover: Escala 1.05 + brilho
- Clique: Animação de seleção
- Conteúdo: Título, descrição, ícone, dificuldade

#### HUD de Combate
- Barra de vida (corações) - topo esquerdo
- Pontuação - topo direito
- Nome do yokai - topo centro
- Área de pergunta - centro inferior
- Botões de resposta - 4 opções

#### Sistema de Voz (IA)
- Avatar da IA narradora no canto
- Animação de fala (boca move)
- Texto da explicação em balão

---

## Especificação Funcional

### 1. Sistema de Autenticação

#### Registro
- Email (validação)
- Senha (mínimo 6 caracteres)
- Nome de usuário
- Foto de perfil (opcional)

#### Login
- Email + Senha
- "Lembrar-me"
- Recuperação de senha

#### Perfil do Usuário
- Nome e avatar
- Nível (xp total)
- Estatísticas:
  - Total de monsters derrotados
  - Perguntas respondidas
  - Taxa de acerto
  - Tempo de jogo
- Conquistas desbloqueadas
- Histórico de partidas

### 2. Sistema de Combates 3D

#### Yokais (Monstros)
| Nome | Dificuldade | HP | Descrição |
|------|-------------|-----|-----------|
| Kappa | Fácil | 1 | Spirit de água |
| Tanuki | Fácil | 1 | Shape-shifter |
| Oni | Médio | 2 | Demônio |
| Yurei | Médio | 2 | Fantasma |
| Tengu | Difícil | 3 | Demônio nariz longo |
| Gashadokuro | Chefão | 5 | Esqueleto gigante |

#### Ambiente
- Cenário: Floresta maldita japonesa
- Árvoresretorcidas
- Névoa densa
- Lua cheia
- Torres torii destruídas

#### Mecânica de Combate
1. Yokai aparece com pergunta
2. Jogador seleciona resposta
3. **Acertou**: Ataque visual + monstro toma dano
4. **Errou**: 
   - Coração é removido
   - IA explica o erro
   - Monstro ataca (animação)
5. HP zero = monstro derrotado
6. 10 pontos = fase completada

### 3. Sistema de Quiz - Programação

#### Categorias
- **Java**: OO, Collections, Streams, Spring
- **Angular**: Components, Services, RXJS
- **React**: Hooks, Context, Redux
- **Spring Boot**: Controllers, Services, Data
- **Next.js**: Pages, API Routes, SSG/SSR
- **WebFlux**: Reactive, Mono/Flux

#### Tipos de Perguntas
- Múltipla escolha (4 opções)
- Código para completar
- Verdadeiro ou falso

#### Sistema de Explicação (Erro)
- Resposta correta mostrada
- Explicação detalhada
- Exemplo de código
- Referência para estudo

### 4. Sistema de Idiomas

#### Japonês
- **Agente IA**: Sensei Yuki (avatar)
- **Mecânica**:
  - Palavra exibida em romaji + kanji
  - Jogador fala a pronúncia
  - IA avalia e pontua
- **Categorias**:
  - Hiragana (básico)
  - Katakana (intermediário)
  - Vocabulário (avançado)
  - Kanji

#### Inglês
- **Mecânica**:
  - Frase em português
  - Traduzir para inglês
  - Escolha múltipla
- **Categorias**:
  - Gramática básica
  - Vocabulário
  - Compreensão
  - Conversação

### 5. Sistema de Pontuação

#### Pontos
- Resposta correta: +10 pontos
- Resposta rápida (<5s): +5 bônus
- Fase completada: +50 pontos
- Derrotar chefão: +100 pontos

#### Vidas (Corações)
- Máximo: 5 corações
- Erro: -1 coração
- Coração perdido a cada 3 erros consecutivos pode recuperar

#### Progressão
- 10 pontos = próxima fase
- 5 fases = próximo nível
- Nível máximo: 50

### 6. Conquistas
| Nome | Requisito |
|------|-----------|
| Primeiro Sangue | Derrotar primeiro yokai |
| Estudo Intensivo | 100 perguntas respondidas |
| Poliglota | Completar japonês e inglês |
| Mago do Código | Acertar 50 perguntas de programação |
| Sobrevivente | Chegar a fase 10 |
| Caçador Mestre | Derrotar Gashadokuro |

### 7. IA Narradora

#### Nome: Sakura
- Avatar: Menina yokai amigável
- Funções:
  - Narrar eventos do jogo
  - Explicar erros
  - Dar dicas
  - Motivar jogador

#### Voz
- Text-to-Speech (Web Speech API)
- Velocidade ajustável

---

## Especificação Técnica

### Frontend
- **Three.js**: Gráficos 3D
- **Angular 17+**: UI Components
- **Web Audio API**: Som
- **Web Speech API**: Voz

### Backend
- **Spring Boot 3**: API REST
- **Spring Security**: Autenticação
- **Spring Data JPA**: Banco de dados
- **JWT**: Tokens

### Banco de Dados
- **PostgreSQL**: Dados principais
- **Perguntas**: Em JSON (embutido)

---

## Acceptance Criteria

### Tela Inicial
- [ ] 3 cards visíveis e clicáveis
- [ ] Animação de hover nos cards
- [ ] Botão de perfil funcional
- [ ] Logo animado

### Autenticação
- [ ] Registro de usuário
- [ ] Login com validação
- [ ] Dados do perfil exibidos
- [ ] Logout funcional

### Jogo
- [ ] Yokai 3D renderizado
- [ ] Pergunta exibida claramente
- [ ] Resposta correta = monstro derrotado
- [ ] Erro = explicação da IA
- [ ] Corações funcionando
- [ ] Pontuação atualizando

### Idiomas
- [ ] Reconhecimento de voz para japonês
- [ ] Feedback de pronúncia
- [ ] Sistema de pontuação por voz

### IA Narradora
- [ ] Sakura aparece na tela
- [ ] Explicações em texto
- [ ] Síntese de voz

### Conquistas
- [ ] Conquistas desbloqueiam corretamente
- [ ] Histórico visível no perfil
