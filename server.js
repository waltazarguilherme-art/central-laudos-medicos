'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const port=Number(process.env.PORT)||10000;
const adminEmail='guilhermenogueiranogueira00@gmail.com';
const hash=process.env.ADMIN_PASSWORD_SCRYPT_HASH||'';
const configured=/^[0-9a-f]{32}:[0-9a-f]{128}$/i.test(hash);
const sessions=new Map();
const attempts=new Map();
const files={'/':'login.html','/login.html':'login.html','/catalogo.html':'catalogo.html','/index.html':'login.html'};
function respond(res,status,body,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"});res.end(body)}
function session(req){const cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('clm_session='));const token=cookie&&cookie.slice(12);if(!token)return null;const s=sessions.get(token);if(!s)return null;if(s.expires<Date.now()){sessions.delete(token);return null}return token}
function json(res,status,obj){respond(res,status,JSON.stringify(obj))}
function originOk(req){const origin=req.headers.origin;return !origin||origin===('https://'+req.headers.host)||origin===('http://'+req.headers.host)}
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/health'&&req.method==='GET')return respond(res,200,'ok','text/plain');
 if(pathname==='/api/auth/status'&&req.method==='GET')return json(res,200,{configured,clinicalStorageReady:false});
 if(pathname==='/api/auth/login'&&req.method==='POST'){
  if(!originOk(req))return json(res,403,{error:'origin'});
  if(!configured)return json(res,503,{error:'not_configured'});
  const ip=(req.socket.remoteAddress||'unknown');
  const a=attempts.get(ip)||{n:0,until:0};
  if(a.until>Date.now())return json(res,429,{error:'rate_limited'});
  let data='';for await(const chunk of req){data+=chunk;if(data.length>4096)return json(res,413,{error:'too_large'})}
  let body;try{body=JSON.parse(data)}catch{return json(res,400,{error:'invalid'})}
  const [salt,expected]=hash.split(':');
  const candidate=crypto.scryptSync(String(body.password||''),Buffer.from(salt,'hex'),64);
  const valid=crypto.timingSafeEqual(candidate,Buffer.from(expected,'hex'))&&body.email===adminEmail;
  if(!valid){a.n++;if(a.n>=5){a.until=Date.now()+15*60*1000;a.n=0}attempts.set(ip,a);return json(res,401,{error:'invalid_credentials'})}
  attempts.delete(ip);
  const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{expires:Date.now()+8*60*60*1000});
  res.setHeader('Set-Cookie','clm_session='+token+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800');
  return json(res,200,{ok:true});
 }
 if(pathname==='/api/auth/logout'&&req.method==='POST'){
  if(!originOk(req))return json(res,403,{error:'origin'});
  const token=session(req);if(token)sessions.delete(token);
  res.setHeader('Set-Cookie','clm_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
  return json(res,200,{ok:true});
 }
 if(pathname==='/admin'&&req.method==='GET'){
  if(!session(req)){res.writeHead(302,{Location:'/'});return res.end()}
  return fs.readFile(path.join(__dirname,'admin.html'),(e,data)=>e?respond(res,500,'Erro','text/plain'):respond(res,200,data,'text/html; charset=utf-8'));
 }
 if(req.method!=='GET'&&req.method!=='HEAD')return respond(res,405,'Método não permitido','text/plain');
 const file=files[pathname];if(!file)return respond(res,404,'Não encontrado','text/plain');
 fs.readFile(path.join(__dirname,file),(e,data)=>e?respond(res,500,'Erro interno','text/plain'):respond(res,200,req.method==='HEAD'?'':data,'text/html; charset=utf-8'));
});
server.listen(port,'0.0.0.0');
