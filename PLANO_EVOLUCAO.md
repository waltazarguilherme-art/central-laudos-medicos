# Central de Laudos Médicos — evolução para gestão clínica

## Estado do projeto
Esta branch de desenvolvimento preserva o código da versão atual. O sistema existente possui autenticação administrativa e biblioteca de modelos; **não possui armazenamento clínico protegido** e **não deve receber dados reais de pacientes**.

## Etapa 1 — Cadastro de pacientes (em desenvolvimento)
- Cadastro: nome completo, data de nascimento, CPF (opcional quando aplicável), telefone, e-mail e identificação interna.
- Busca por nome e identificação; edição com histórico de alterações.
- Banco de dados persistente, com migrações, validações e controle de duplicidade.
- Perfis de acesso separados: recepção, profissional e administrador.
- Nenhum dado sensível em arquivos públicos, HTML, JavaScript cliente ou repositório.

## Etapa 2 — Atendimento e exames
- Abrir atendimento para paciente cadastrado.
- Vincular exame, profissional solicitante, data e status.
- Acompanhar pendências, execução e liberação.

## Etapa 3 — Laudos
- Vincular modelo ao exame, revisão por profissional habilitado e versionamento.
- Prévia, PDF e impressão.
- Assinatura eletrônica/digital conforme exigências aplicáveis e verificação do responsável.

## Requisitos para qualquer uso real
- Autenticação individual, autorização no servidor por função e auditoria imutável.
- Criptografia em trânsito, proteção de dados em repouso, gestão de segredos e backups testados.
- Políticas de retenção, privacidade e LGPD; testes de segurança.
- Homologação dos fluxos clínicos por profissionais habilitados.

## Próxima implementação
Definir infraestrutura de banco de dados e ambiente de desenvolvimento isolado antes de habilitar gravação de cadastros. Não remover o bloqueio de uso clínico antes de atender aos requisitos acima.
