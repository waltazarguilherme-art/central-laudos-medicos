'use strict';
// Protótipo local: usar somente registros fictícios. Não homologado para dados clínicos.
const { DatabaseSync } = require('node:sqlite');
const path=require('node:path');
const fs=require('node:fs');
const crypto=require('node:crypto');
const dir=process.env.CLM_DATA_DIR || path.join(__dirname,'.local-data');
fs.mkdirSync(dir,{recursive:true,mode:0o700});
const db=new DatabaseSync(path.join(dir,'pacientes.sqlite'));
db.exec(`CREATE TABLE IF NOT EXISTS pacientes (
 id TEXT PRIMARY KEY, nome TEXT NOT NULL, nascimento TEXT,
 telefone TEXT, criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL
)`);
function all(){return db.prepare('SELECT id,nome,nascimento,telefone,criado_em,atualizado_em FROM pacientes ORDER BY nome LIMIT 500').all()}
function save(v){
 const nome=String(v.nome||'').trim();
 const nascimento=String(v.nascimento||'').trim();
 const telefone=String(v.telefone||'').trim();
 if(nome.length<2||nome.length>120)throw Error('Nome deve ter entre 2 e 120 caracteres');
 if(nascimento&&!/^\\d{4}-\\d{2}-\\d{2}$/.test(nascimento))throw Error('Data inválida');
 if(telefone.length>30)throw Error('Telefone muito longo');
 const id=crypto.randomUUID(),now=new Date().toISOString();
 db.prepare('INSERT INTO pacientes VALUES (?,?,?,?,?,?)').run(id,nome,nascimento,telefone,now,now);
 return {id,nome,nascimento,telefone,criado_em:now};
}
module.exports={all,save};
