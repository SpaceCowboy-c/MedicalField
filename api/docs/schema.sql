--Tabela de profisionais
CREATE TABLE profissional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  registro VARCHAR(30)  NOT NULL UNIQUE,          -- CRM, COREN ou ID de socorrista
  tipo_registro VARCHAR(12)  NOT NULL CHECK (tipo_registro IN ('CRM','COREN','SOCORRISTA', 'ENFERMEIRO')),
  senha_hash VARCHAR(100) NOT NULL,
  perfil VARCHAR(12)  NOT NULL CHECK (perfil IN ('ADMIN','SOCORRISTA')),
  criado_em TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE pessoa (
  id UUID PRIMARY KEY,                     
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) UNIQUE,                  
  data_nascimento DATE,
  sexo VARCHAR(1) CHECK (sexo IN ('M','F','O')),
  telefone VARCHAR(20),
  email VARCHAR(150),                    
  criado_por UUID REFERENCES profissional(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(), 
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(), -- hora do CELULAR; a Strategy de conflito usa
  servidor_em TIMESTAMPTZ NOT NULL DEFAULT now(),  -- hora do SERVIDOR; cursor do "baixar novidades"
  versao INTEGER NOT NULL DEFAULT 1,
  deletado_em TIMESTAMPTZ
);

CREATE TABLE prontuario (
  id UUID PRIMARY KEY,
  pessoa_id UUID NOT NULL UNIQUE REFERENCES pessoa(id),
  tipo_sanguineo VARCHAR(3),
  alergias TEXT,
  condicoes_cronicas TEXT,
  uso_continuo TEXT,
  observacoes TEXT,
  criado_por UUID REFERENCES profissional(id),
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  servidor_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  versao INTEGER NOT NULL DEFAULT 1,
  deletado_em TIMESTAMPTZ
);

CREATE TABLE medicamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  principio_ativo VARCHAR(150),
  apresentacao VARCHAR(100),
  dose_maxima_dia_mg  NUMERIC(10,2),                    
  contraindicacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  servidor_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  versao  INTEGER NOT NULL DEFAULT 1,
  deletado_em TIMESTAMPTZ
);

CREATE TABLE atendimento (
  id UUID PRIMARY KEY,                          -- gerado no app
  prontuario_id UUID NOT NULL REFERENCES prontuario(id),   -- de quem é
  profissional_id UUID NOT NULL REFERENCES profissional(id), -- quem atendeu
  data_hora TIMESTAMPTZ NOT NULL,                      -- quando ocorreu
  local_descricao VARCHAR(255),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  queixa_principal TEXT,

  -- sinais vitais
  pressao_sistolica SMALLINT,
  pressao_diastolica SMALLINT,
  freq_cardiaca SMALLINT,
  freq_respiratoria SMALLINT,
  saturacao_o2 SMALLINT,
  temperatura NUMERIC(4,1),
  glicemia SMALLINT,

  glasgow_ocular SMALLINT CHECK (glasgow_ocular BETWEEN 1 AND 4),
  glasgow_verbal SMALLINT CHECK (glasgow_verbal BETWEEN 1 AND 5),
  glasgow_motora SMALLINT CHECK (glasgow_motora BETWEEN 1 AND 6),

  triagem_protocolo VARCHAR(10) CHECK (triagem_protocolo IN ('MANCHESTER','START')),
  triagem_classificacao VARCHAR(10) CHECK (triagem_classificacao IN ('VERMELHO','LARANJA','AMARELO','VERDE','AZUL','PRETO'))
  medicamentos_administrados JSONB NOT NULL DEFAULT '[]',
  procedimentos TEXT,
  destino VARCHAR(255),
 --sincronização
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  servidor_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  versao INTEGER NOT NULL DEFAULT 1,
  deletado_em TIMESTAMPTZ
);


CREATE TABLE sync_operacao (
  id_operacao UUID PRIMARY KEY,
  profissional_id UUID REFERENCES profissional(id),
  entidade VARCHAR(40) NOT NULL,
  entidade_id UUID NOT NULL,
  status   VARCHAR(12) NOT NULL CHECK (status IN ('APLICADA','CONFLITO','REJEITADA')),
  resposta JSONB,
  recebido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auditoria de acess
CREATE TABLE log_acesso (
  id BIGSERIAL PRIMARY KEY,
  data_hora TIMESTAMPTZ NOT NULL,
  ip_cliente VARCHAR(45),
  profissional_id UUID,                                 
  metodo VARCHAR(10) NOT NULL, --GET, POST, PUT
  rota VARCHAR(255) NOT NULL,
  status_code SMALLINT NOT NULL,
  tempo_ms INTEGER NOT NULL,  --duração do processamento
  servico VARCHAR(20) NOT NULL, -- auth, core, docs
  recebido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- alguns índices para melhorar performance de consultas
CREATE INDEX idx_pessoa_servidor_em ON pessoa(servidor_em);
CREATE INDEX idx_prontuario_servidor_em ON prontuario(servidor_em);
CREATE INDEX idx_medicamento_servidor_em ON medicamento(servidor_em);
CREATE INDEX idx_atendimento_servidor_em ON atendimento(servidor_em);
CREATE INDEX idx_atendimento_prontuario ON atendimento(prontuario_id);
CREATE INDEX idx_log_data_hora ON log_acesso(data_hora);