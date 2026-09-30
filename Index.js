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
┃ ${PREFIX}admins |
