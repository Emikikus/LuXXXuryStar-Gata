import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import pino from "pino"
import axios from "axios"
import yts from "yt-search"
import express from "express"

// KEEP-ALIVE PARA RENDER
const app = express()
app.get("/", (req,res)=> res.send("LuXXXuryStar GataBot Clean ONLINE"))
app.listen(process.env.PORT || 3000)

const BOT_NAME = "LuXXXury§tar | GataBot Clean"
const PREFIX = "."
const OWNER = "5493625478469"
let antilink = true
let welcome = true
let antilink2 = false

// BASE DE DATOS SIMPLE
let afkUsers = {}
let warnUsers = {}

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState("./auth")
  const sock = makeWASocket({ auth: state, logger: pino({ level: "silent" }), printQRInTerminal: false, browser: ["GataBot","Chrome","1.0"] })

  if(!sock.authState.creds.registered){
    setTimeout(async()=>{
      try{ let code = await sock.requestPairingCode(OWNER); console.log(`\nCODIGO: ${code}\n`) }catch(e){ console.log(e) }
    },3000)
  }

  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", (u)=>{
    if(u.connection==="open") console.log(`✅ ${BOT_NAME} ONLINE`)
    if(u.connection==="close" && u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) startBot()
  })

  sock.ev.on("group-participants.update", async (anu)=>{
    if(!welcome) return
    for(let p of anu.participants){
      if(anu.action=="add"){
        await sock.sendMessage(anu.id, { text: `╭━〔 BIENVENID@ 〕━╮\n┃ Hola @${p.split("@")[0]} ✨\n┃ Bienvenid@ a ${anu.id.split("@")[0]}\n┃ Soy ${BOT_NAME}\n┃ Escribe ${PREFIX}menu\n╰━━━━━━━━━━━━╯`, mentions:[p] })
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

    // AFK
    if(afkUsers[sender]){ delete afkUsers[sender]; await sock.sendMessage(jid, {text:`${pushName} volvió de su AFK ✨`}) }

    // ANTILINK
    if(antilink && /chat\.whatsapp\.com/i.test(text) && jid.endsWith("@g.us")){
      try{
        let meta = await sock.groupMetadata(jid)
        let isAdmin = meta.participants.find(p=>p.id===sender)?.admin
        if(!isAdmin){
          await sock.sendMessage(jid, { text: `🚫 Link detectado @${sender.split("@")[0]}`, mentions:[sender] })
          await sock.sendMessage(jid, { delete: m.key })
        }
      }catch{}
    }

    if(!text.startsWith(PREFIX)) return
    let args = text.slice(1).trim().split(/ +/)
    let cmd = args.shift().toLowerCase()
    let q = args.join(" ")
    const reply = (t)=> sock.sendMessage(jid, {text:t}, {quoted:m})
    const isGroup = jid.endsWith("@g.us")
    const getAdmin = async()=>{ try{ let meta=await sock.groupMetadata(jid); return meta.participants.find(p=>p.id===sender)?.admin }catch{ return false } }

    // ============ MENU COMPLETO GATA STYLE ============
    if(["menu","help","comandos","allmenu"].includes(cmd)){
      return reply(
`╭━━━〔 ${BOT_NAME} 〕━━━✦
┃ Hola ${pushName} 👋
┃ Prefijo: ${PREFIX}
╰━━━━━━━━━━━━━━━━━━✦

╭━〔 💞 PAREJAS Y AMOR 〕━
┃ ${PREFIX}parejas | formar parejas
┃ ${PREFIX}ship | shipeo @user @user
┃ ${PREFIX}amor @user
┃ ${PREFIX}amistad @user
┃ ${PREFIX}pareja @user | tu media naranja
╰━━━━━━━━━━━━━━━━━━

╭━〔 😹 PORCENTAJES 〕━
┃ ${PREFIX}gay | lesbiana | pajero
┃ ${PREFIX}fiel | infiel | guapo
┃ ${PREFIX}fea | otaku | inteligente
┃ ${PREFIX}fachero | tonto | vago
╰━━━━━━━━━━━━━━━━━━

╭━〔 🏆 TOPS 〕━
┃ ${PREFIX}topgays | topotakus
┃ ${PREFIX}topguapos | topfeos
┃ ${PREFIX}toppajer@s | topfieles
┃ ${PREFIX}topinfieles | topguapas
╰━━━━━━━━━━━━━━━━━━

╭━〔 🎲 JUEGOS Y DIVERSION 〕━
┃ ${PREFIX}ppt piedra/papel/tijera
┃ ${PREFIX}dado | moneda | 8ball
┃ ${PREFIX}chiste | frase | piropo
┃ ${PREFIX}insulto | consejo | doxear
┃ ${PREFIX}afk | perfil | gay2
╰━━━━━━━━━━━━━━━━━━

╭━〔 🌸 ANIME Y KWAI 〕━
┃ ${PREFIX}kwai | anime | waifu
┃ ${PREFIX}neko | shinobu | megumin
┃ ${PREFIX}foto <nombre>
╰━━━━━━━━━━━━━━━━━━

╭━〔 👑 ADMIN GRUPO 〕━
┃ ${PREFIX}todos | tagall | invocar
┃ ${PREFIX}admins | infogrupo | link
┃ ${PREFIX}kick @ | add 549...
┃ ${PREFIX}promote @ | demote @
┃ ${PREFIX}grupo abrir/cerrar
┃ ${PREFIX}antilink on/off
┃ ${PREFIX}bienvenida on/off
┃ ${PREFIX}warn @ | unwarn @
╰━━━━━━━━━━━━━━━━━━

╭━〔 🔍 BUSQUEDA LEGAL 〕━
┃ ${PREFIX}yt <nombre> (solo busca link)
┃ ${PREFIX}google <texto>
┃ ${PREFIX}wiki <texto>
┃ ${PREFIX}clima <ciudad>
┃ ${PREFIX}traducir en hola
┃ ${PREFIX}calc 2+2 | hora | ping
╰━━━━━━━━━━━━━━━━━━

╭━〔 🤖 BOT 〕━
┃ ${PREFIX}info | owner | ping
┃ ${PREFIX}sticker (resp a foto)
┃ ${PREFIX}bot on/off (solo dueño)
╰━━━━━━━━━━━━━━━━━━

> Versión Clean sin descargas por copyright
> ${BOT_NAME} | Chaco - Argentina 🇦🇷`
      )
    }

    if(cmd==="ping") return reply(`🏓 Pong!\n${BOT_NAME}\nVel: ${(Math.random()*100).toFixed(0)}ms`)
    if(cmd==="info"||cmd==="owner") return reply(`🤖 ${BOT_NAME}\n📱 ${OWNER}\n👑 Owner: @${OWNER.split("@")[0]}\nAntilink:${antilink} Bienvenida:${welcome}`, {mentions:[OWNER+"@s.whatsapp.net"]})
    if(cmd==="hora") return reply(new Date().toLocaleString("es-AR", {timeZone:"America/Argentina/Buenos_Aires"}))
    if(cmd==="calc" && q){ try{ return reply(`${q} = ${eval(q)}`) }catch{} }

    // ---- PAREJAS ----
    if(["parejas","formarpareja","pareja"].includes(cmd)){
      if(!isGroup) return reply("Solo grupos")
      let meta=await sock.groupMetadata(jid); let users=meta.participants.map(p=>p.id)
      let a=users[Math.floor(Math.random()*users.length)]; let b=users[Math.floor(Math.random()*users.length)]; while(b===a) b=users[Math.floor(Math.random()*users.length)]
      return await sock.sendMessage(jid, {text:`💞 *FORMAR PAREJAS* 💞\n\n@${a.split("@")[0]} ❤️ @${b.split("@")[0]}\n\nCompatibilidad: ${Math.floor(Math.random()*101)}%`, mentions:[a,b]})
    }
    if(["ship","shipeo"].includes(cmd)){ return reply(`💘 *SHIPEO* 💘\n\n${q||pushName}\n${"█".repeat(Math.floor(Math.random()*10))} ${Math.floor(Math.random()*101)}%`) }
    if(["amor","love"].includes(cmd)) return reply(`❤️ ${pushName} + ${q||"bot"} = ${Math.floor(Math.random()*101)}% amor`)
    if(["amistad"].includes(cmd)) return reply(`🤝 Amistad: ${Math.floor(Math.random()*101)}%`)

    // ---- % ----
    if(["gay","lesbiana","pajero","fiel","infiel","guapo","fea","otaku","fachero","inteligente","tonto","vago","gay2"].includes(cmd)){
      return reply(`😹 *${cmd.toUpperCase()} METER*\n\n${q||pushName} es ${Math.floor(Math.random()*101)}% ${cmd} ${Math.floor(Math.random()*101)>80?"🔥":"😅"}`)
    }

    // ---- TOPS ----
    if(cmd.startsWith("top")){
      if(!isGroup) return reply("Solo grupos")
      let meta=await sock.groupMetadata(jid); let users=meta.participants.map(p=>p.id).sort(()=>0.5-Math.random()).slice(0,5)
      let txt=`🏆 *${cmd.toUpperCase()}* 🏆\n\n`; users.forEach((u,i)=> txt+=`${i+1}. @${u.split("@")[0]} - ${Math.floor(Math.random()*100)}%\n`); return await sock.sendMessage(jid,{text:txt, mentions:users})
    }

    // ---- JUEGOS ----
    if(cmd==="dado") return reply(`🎲 ${Math.floor(Math.random()*6)+1}`)
    if(cmd==="moneda") return reply(Math.random()>0.5?"Cara 🪙":"Cruz 🪙")
    if(["8ball","pregunta"].includes(cmd)){ let r=["Sí","No","Tal vez","Obvio que sí","Ni en pedo","Pregunta de nuevo"]; return reply(`🎱 ${r[Math.floor(Math.random()*r.length)]}`) }
    if(cmd==="chiste"){ let c=["¿Qué hace una abeja en el gym? Zum-ba","¿Cómo se llama el campeón de buceo japonés? Tokofondo","¿Qué le dice un techo a otro? Techo de menos"]; return reply(c[Math.floor(Math.random()*c.length)]) }
    if(cmd==="frase"){ return reply("✨ La vida es mejor con GataBot") }
    if(cmd==="piropo") return reply(`😏 ${q||pushName}, sos más lindo que código sin bugs`)
    if(cmd==="insulto") return reply(`😈 ${q||pushName} sos más lento que Render sin UptimeRobot`)
    if(cmd==="consejo") return reply("💡 Consejo: Nunca prestes tu sesión de Baileys")
    if(cmd==="doxear"||cmd==="doxeo"){ return reply(`🔍 *DOXEO FAKE* 🔍\nNombre: ${q||pushName}\nIP: 127.0.0.${Math.floor(Math.random()*255)}\nUbicación: Resistencia, Chaco\n*ES FAKE, ES BROMA* 😹`) }
    if(cmd==="afk"){ afkUsers[sender]=q||"AFK"; return reply(`${pushName} está AFK: ${q}`) }
    if(cmd==="perfil"){ return reply(`👤 *PERFIL*\nNombre: ${pushName}\nNúmero: @${sender.split("@")[0]}\nEstado: ${afkUsers[sender]?"AFK":"Activo"}`, {mentions:[sender]}) }
    if(cmd==="ppt"){ let o=["piedra","papel","tijera"]; let b=o[Math.floor(Math.random()*3)]; return reply(`Vos: ${q}\nYo: ${b}`) }

    // ---- ANIME KWAI ----
    if(["kwai","anime","waifu","neko","shinobu","megumin","foto"].includes(cmd)){
      try{
        let query = cmd==="foto"? (q||"anime aesthetic") : cmd
        let url = cmd==="foto"? `https://source.unsplash.com/600x800/?${encodeURIComponent(query)}` : `https://api.waifu.pics/sfw/${cmd==="kwai"||cmd==="foto"?"waifu":cmd}`
        let imgUrl = cmd==="foto"||cmd==="kwai"? url : (await axios.get(url)).data.url
        let img = await axios.get(imgUrl, {responseType:"arraybuffer"})
        return await sock.sendMessage(jid, {image: img.data, caption:`🌸 ${cmd} - ${BOT_NAME}`}, {quoted:m})
      }catch{ return reply("Intenta de nuevo") }
    }

    // ---- ADMIN ----
    if(["todos","tagall","invocar"].includes(cmd)){
      if(!(await getAdmin())) return reply("Solo admins")
      let meta=await sock.groupMetadata(jid); let mentions=meta.participants.map(p=>p.id); let txt=`📢 *INVOCACION* 📢\n${q||"Atención"}\n\n`; mentions.forEach(u=> txt+=`@${u.split("@")[0]} `); return await sock.sendMessage(jid,{text:txt, mentions})
    }
    if(cmd==="link"){ try{ let code=await sock.groupInviteCode(jid); return reply(`https://chat.whatsapp.com/${code}`) }catch{ return reply("No soy admin") } }
    if(cmd==="infogrupo"){ let meta=await sock.groupMetadata(jid); return reply(`👥 ${meta.subject}\n👤 ${meta.participants.length} miembros\n📅 Creado: ${new Date(meta.creation*1000).toLocaleDateString()}`) }
    if(cmd==="antilink"){ if(!(await getAdmin())) return; antilink = q==="on"; return reply(`Antilink ${antilink?"ON":"OFF"}`) }
    if(cmd==="bienvenida"){ if(!(await getAdmin())) return; welcome = q==="on"; return reply(`Bienvenida ${welcome?"ON":"OFF"}`) }

    // ---- BUSQUEDA LEGAL ----
    if(["yt","youtube","yts"].includes(cmd)){ if(!q) return reply("Uso:.yt bad bunny"); let r=await yts(q); let v=r.videos[0]; return reply(`🎬 *${v.title}*\n⏱️ ${v.timestamp} | 👁️ ${v.views}\n🔗 ${v.url}\n\n> Solo búsqueda, sin descarga por copyright ✅`) }
    if(cmd==="google") return reply(`🔍 https://www.google.com/search?q=${encodeURIComponent(q)}`)
    if(cmd==="wiki"){ try{ let {data}=await axios.get(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`); return reply(`📚 ${data.title}\n\n${data.extract}\n\n${data.content_urls.desktop.page}`) }catch{ return reply("No encontré") } }
    if(cmd==="clima"){ try{ let {data}=await axios.get(`https://wttr.in/${encodeURIComponent(q||"Resistencia")}?format=3`); return reply(data) }catch{} }
    if(cmd==="traducir"){ return reply(`🌐 https://translate.google.com/?sl=auto&tl=${args[0]||"es"}&text=${encodeURIComponent(args.slice(1).join(" "))}&op=translate`) }

    // STICKER LEGAL (tu propia foto)
    if(cmd==="sticker"||cmd==="s"){
      let quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
      let media = quoted?.imageMessage || m.message.imageMessage
      if(media){ try{ let buff = await sock.downloadMediaMessage(m); return await sock.sendMessage(jid, {sticker: buff}, {quoted:m}) }catch{} }
      else return reply("Responde a una foto con.s")
    }

  })
}
startBot()
