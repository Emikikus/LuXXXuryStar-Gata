// termux-fix.js
import fs from 'fs'
console.log('🔧 Parcheando GataBot para Termux...')
const fake = (p)=>{
  try{fs.rmSync(p,{recursive:true,force:true})}catch{}
  fs.mkdirSync(p,{recursive:true})
  fs.writeFileSync(p+'/package.json', JSON.stringify({name:p.split('/').pop(), main:'index.js'}))
  fs.writeFileSync(p+'/index.js','module.exports={}; module.exports.default=module.exports')
}
fake('node_modules/sharp')
fake('node_modules/canvas')
try{fs.mkdirSync('node_modules/sharp/lib',{recursive:true})}catch{}
fs.writeFileSync('node_modules/sharp/lib/index.js','module.exports={}')
console.log('✅ GataBot listo para Termux')
