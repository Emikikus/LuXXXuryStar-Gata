import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import pino from "pino"
import axios from "axios"
import yts from "yt-search"
import express from "express"
import QRCode from 'qrcode'

const app = express()
let lastQR = null

app.get('/', async (req,res)=>{
  if(!lastQR) return res.send('<h1>GataBot Live ✅ Esperando QR / Código</h1><p>Mirá los Logs en Render</p>')
  const qrImg = await QRCode.toDataURL(lastQR)
  res.send(`<h1>LuXXXuryStar - Escanea este QR</h1><img src="${qrImg}" width="350"><br><p>WhatsApp > Dispositivos vinculados > Vincular dispositivo</p>`)
})
app.listen(process.env.PORT || 10000)

const BOT_NAME = "LuXXXury$tar | GataBot Clean"
const PREFIX = "."
const OWNER = "5493625478466"
let antilink = true
let welcome = true
let afkUsers = {}
let warnUsers = {}

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) })

  if(!sock.authState.creds.registered){
    setTimeout(async()=>{
      try{ let code = await sock.requestPairingCode(OWNER); console.log(`CODIGO: ${code}`) }catch(e){ console.log('Error codigo', e.message) }
    },3000)
  }

  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", async (u)=>{
    if(u.qr){ lastQR = u.qr; console.log('QR GENERADO EN TU WEB') }
    if(u.connection==="open"){ console.log(`✅ ${BOT_NAME} ONLINE`); lastQR = null }
    if(u.connection==="close" && u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) startBot()
  })

  sock.ev.on("group-participants.update", async (anu)=>{
    if(!welcome) return
    for(let p of anu.participants){
      if(anu.action=="add"){
        await sock.sendMessage(anu.id, { text: `╭━〔 BIENVENID@ 〕━╮\n┃ Hola @${p.split("@")[0]} ✨\n┃ Bienvenid@ a este grupo\n┃ Soy ${BOT_NAME}\n┃ Escribe ${PREFIX}menu para ver mis comandos\n╰━━━━━━━━━━━━╯`, mentions:[p] })
      }
    }
  })

  sock.ev.on("messages.upsert", async ({messages})=>{
    let m = messages[0]
    if(!m.message || m.key.fromMe) return
    let jid = m.key.remoteJid
    let sender = m.key.participant || jid
    let text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
    let pushName = m.pushName || "usuario"

    if(afkUsers[sender]){ delete afkUsers[sender]; await sock.sendMessage(jid, {text:`✨ ${pushName} volvió de su AFK`}) }
    if(antilink && /chat\.whatsapp\.com/i.test(text) && jid.endsWith("@g.us")){
      try{
        let meta = await sock.groupMetadata(jid)
        let isAdmin = meta.participants.find(p=>p.id===sender)?.admin
        if(!isAdmin){ await sock.sendMessage(jid, { text: `🚫 Link detectado @${sender.split("@")[0]}`, mentions:[sender] }); await sock.sendMessage(jid, { delete: m.key }) }
      }catch{}
    }
    if(!text.startsWith(PREFIX)) return
    let args = text.slice(1).trim().split(/ +/)
    let cmd = args.shift().toLowerCase()
    let q = args.join(" ")
    const reply = (t)=> sock.sendMessage(jid, {text:t}, {quoted:m})
    const isGroup = jid.endsWith("@g.us")
    const getAdmin = async()=>{ try{ let meta=await sock.groupMetadata(jid); return meta.participants.find(p=>p.id===sender)?.admin }catch{ return false } }

    // MENU COMPLETO
    if(["menu","help","comandos","allmenu"].includes(cmd)){
      return reply(
`╭━━━〔 ${BOT_NAME} 〕━━━✦
┃ Hola ${pushName} 👋
┃ Prefijo: ${PREFIX}
┃ Dueño: ${OWNER}
╰━━━━━━━━━━━━━━━━━━✦

╭━〔 💞 PAREJAS Y AMOR 〕━
┃ ${PREFIX}parejas | formarpareja
┃ ${PREFIX}ship | shipeo @user @user
┃ ${PREFIX}amor @user | amistad @user
┃ ${PREFIX}pareja @user
╰━━━━━━━━━━━━━━━━━━

╭━〔 😹 PORCENTAJES 〕━
┃ ${PREFIX}gay | lesbiana | pajero
┃ ${PREFIX}fiel | infiel | guapo
┃ ${PREFIX}fea | otaku | inteligente
┃ ${PREFIX}fachero | tonto | vago | gay2
╰━━━━━━━━━━━━━━━━━━

╭━〔 🏆 TOPS 〕━
┃ ${PREFIX}topgays | topotakus
┃ ${PREFIX}topguapos | topfeos
┃ ${PREFIX}toppajer@s | topfieles
┃ ${PREFIX}topinfieles
╰━━━━━━━━━━━━━━━━━━

╭━〔 🎲 JUEGOS Y DIVERSION 〕━
┃ ${PREFIX}ppt piedra/papel/tijera
┃ ${PREFIX}dado | moneda | 8ball
┃ ${PREFIX}chiste | frase | piropo
┃ ${PREFIX}insulto | consejo | doxear
┃ ${PREFIX}afk texto | perfil | gay2
╰━━━━━━━━━━━━━━━━━━

╭━〔 🌸 ANIME Y FOTOS 〕━
┃ ${PREFIX}waifu | neko | shinobu
┃ ${PREFIX}megumin | kwai | foto gato
╰━━━━━━━━━━━━━━━━━━

╭━〔 👑 ADMIN GRUPO 〕━
┃ ${PREFIX}todos | tagall | invocar texto
┃ ${PREFIX}admins | infogrupo | link
┃ ${PREFIX}kick @ | add 549... | promote @ | demote @
┃ ${PREFIX}grupo abrir/cerrar
┃ ${PREFIX}antilink on/off
┃ ${PREFIX}bienvenida on/off
┃ ${PREFIX}warn @ | unwarn @
╰━━━━━━━━━━━━━━━━━━

╭━〔 🔍 BUSQUEDA LEGAL 〕━
┃ ${PREFIX}yt <nombre> (solo busca link)
┃ ${PREFIX}google <texto> | wiki <texto>
┃ ${PREFIX}clima <ciudad> | traducir en hola
┃ ${PREFIX}calc 2+2 | hora | ping
╰━━━━━━━━━━━━━━━━━━

╭━〔 🤖 BOT 〕━
┃ ${PREFIX}info | owner | ping
┃ ${PREFIX}sticker (responde a foto)
╰━━━━━━━━━━━━━━━━━━

> Clean sin descargas por copyright ✅
> ${BOT_NAME} | Chaco Argentina 🇦🇷`
      )
    }

    if(cmd==="ping") return reply(`🏓 Pong! ${BOT_NAME}\nVel: ${(Math.random()*100).toFixed(0)}ms`)
    if(cmd==="info"||cmd==="owner") return reply(`🤖 ${BOT_NAME}\n📱 Owner: ${OWNER}\nAntilink:${antilink} Bienvenida:${welcome}`)
    if(cmd==="hora") return reply(new Date().toLocaleString("es-AR", {timeZone:"America/Argentina/Buenos_Aires"}))
    if(cmd==="calc" && q){ try{ return reply(`${q} = ${eval(q)}`) }catch{} }

    if(["parejas","formarpareja"].includes(cmd)){
      if(!isGroup) return reply("Solo grupos")
      let meta=await sock.groupMetadata(jid); let users=meta.participants.map(p=>p.id)
      let a=users[Math.floor(Math.random()*users.length)]; let b=users[Math.floor(Math.random()*users.length)]; while(b===a) b=users[Math.floor(Math.random()*users.length)]
      return await sock.sendMessage(jid, {text:`💞 *FORMAR PAREJAS* 💞\n\n@${a.split("@")[0]} ❤️ @${b.split("@")[0]}\nCompatibilidad: ${Math.floor(Math.random()*101)}%`, mentions:[a,b]})
    }
    if(["ship","shipeo","amor","love","amistad"].includes(cmd)) return reply(`💘 ${q||pushName} - Compatibilidad: ${Math.floor(Math.random()*101)}%`)
    if(["gay","lesbiana","pajero","fiel","infiel","guapo","fea","otaku","fachero","inteligente","tonto","vago","gay2"].includes(cmd)) return reply(`😹 *${cmd.toUpperCase()} METER*\n\n${q||pushName} es ${Math.floor(Math.random()*101)}% ${cmd}`)
    if(cmd.startsWith("top")){
      if(!isGroup) return reply("Solo grupos")
      let meta=await sock.groupMetadata(jid); let users=meta.participants.map(p=>p.id).sort(()=>0.5-Math.random()).slice(0,5)
      let txt=`🏆 *${cmd.toUpperCase()}* 🏆\n\n`; users.forEach((u,i)=> txt+=`${i+1}. @${u.split("@")[0]} - ${Math.floor(Math.random()*100)}%\n`); return await sock.sendMessage(jid,{text:txt, mentions:users})
    }
    if(cmd==="dado") return reply(`🎲 ${Math.floor(Math.random()*6)+1}`)
    if(cmd==="moneda") return reply(Math.random()>0.5?"Cara 🪙":"Cruz 🪙")
    if(["8ball","pregunta"].includes(cmd)){ let r=["Sí","No","Tal vez","Obvio","Ni en pedo"]; return reply(`🎱 ${r[Math.floor(Math.random()*r.length)]}`) }
    if(cmd==="chiste"){ let c=["¿Qué hace una abeja en el gym? Zum-ba","¿Cómo se llama el campeón de buceo japonés? Tokofondo"]; return reply(c[Math.floor(Math.random()*c.length)]) }
    if(cmd==="piropo") return reply(`😏 ${q||pushName}, sos más lindo que código sin bugs`)
    if(cmd==="doxear"||cmd==="doxeo") return reply(`🔍 *DOXEO FAKE* 🔍\nNombre: ${q||pushName}\nIP: 127.0.0.${Math.floor(Math.random()*255)}\n*ES BROMA* 😹`)
    if(cmd==="afk"){ afkUsers[sender]=q||"AFK"; return reply(`${pushName} está AFK: ${q}`) }
    if(cmd==="perfil") return reply(`👤 ${pushName}\nNúmero: @${sender.split("@")[0]}`, {mentions:[sender]})
    if(["waifu","neko","shinobu","megumin","kwai"].includes(cmd)){
      try{
        let url = `https://api.waifu.pics/sfw/${cmd==="kwai"?"waifu":cmd}`
        let {data} = await axios.get(url)
        let img = await axios.get(data.url, {responseType:"arraybuffer"})
        return await sock.sendMessage(jid, {image: img.data, caption:`🌸 ${cmd}`}, {quoted:m})
      }catch{ return reply("Intenta de nuevo") }
    }
    if(cmd==="foto"){
      try{
        let url = `https://source.unsplash.com/600x800/?${encodeURIComponent(q||"anime aesthetic")}`
        let img = await axios.get(url, {responseType:"arraybuffer"})
        return await sock.sendMessage(jid, {image: img.data, caption:`📸 ${q}`}, {quoted:m})
      }catch{}
    }
    if(["todos","tagall","invocar"].includes(cmd)){
      if(!(await getAdmin())) return reply("Solo admins")
      let meta=await sock.groupMetadata(jid); let mentions=meta.participants.map(p=>p.id); let txt=`📢 *INVOCACION* ${q||""}\n\n`; mentions.forEach(u=> txt+=`@${u.split("@")[0]} `); return await sock.sendMessage(jid,{text:txt, mentions})
    }
    if(cmd==="link"){ try{ let code=await sock.groupInviteCode(jid); return reply(`https://chat.whatsapp.com/${code}`) }catch{ return reply("No soy admin") } }
    if(cmd==="antilink"){ if(!(await getAdmin())) return; antilink = q==="on"; return reply(`Antilink ${antilink?"ON":"OFF"}`) }
    if(cmd==="bienvenida"){ if(!(await getAdmin())) return; welcome = q==="on"; return reply(`Bienvenida ${welcome?"ON":"OFF"}`) }
    if(["yt","yts"].includes(cmd)){ if(!q) return reply("Uso:.yt bad bunny"); let r=await yts(q); let v=r.videos[0]; return reply(`🎬 ${v.title}\n⏱️ ${v.timestamp}\n🔗 ${v.url}\n> Solo búsqueda ✅`) }
    if(cmd==="google") return reply(`🔍 https://www.google.com/search?q=${encodeURIComponent(q)}`)
    if(cmd==="wiki"){ try{ let {data}=await axios.get(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`); return reply(`📚 ${data.title}\n\n${data.extract}`) }catch{ return reply("No encontré") } }
    if(cmd==="clima"){ try{ let {data}=await axios.get(`https://wttr.in/${encodeURIComponent(q||"Resistencia")}?format=3`); return reply(data) }catch{} }
    if(cmd==="sticker"||cmd==="s"){ try{ let buff = await sock.downloadMediaMessage(m); if(buff) return await sock.sendMessage(jid, {sticker: buff}, {quoted:m}); else return reply("Responde a una foto con.s") }catch{} }
  })
}
startBot()
