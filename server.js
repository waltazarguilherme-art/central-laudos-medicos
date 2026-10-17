'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const files={'/':'catalogo.html','/index.html':'catalogo.html','/catalogo.html':'catalogo.html'};
const port=Number(process.env.PORT)||10000;
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
 if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});return res.end('ok');}
 const file=files[url.pathname];
 if(!file){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Não encontrado');}
 fs.readFile(path.join(root,file),(err,data)=>{
  if(err){res.writeHead(500);return res.end('Erro interno');}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"frame-ancestors 'none'",'Cache-Control':'no-store'});
  if(req.method==='HEAD')return res.end();res.end(data);
 });
}).listen(port,'0.0.0.0');
