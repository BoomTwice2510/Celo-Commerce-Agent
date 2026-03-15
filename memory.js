const fs = require("fs")

const FILE = "./memory.json"

function read(){

 try{

  const data = fs.readFileSync(FILE)

  return JSON.parse(data)

 }catch{

  return []

 }

}

function write(data){

 fs.writeFileSync(FILE, JSON.stringify(data,null,2))

}


function savePayment(payment){

 const data = read()

 data.push(payment)

 write(data)

}


function getLastPayment(){

 const data = read()

 if(data.length === 0) return null

 return data[data.length - 1]

}


function getVendorTotal(vendor){

 const data = read()

 let total = 0

 for(const p of data){

  if(p.vendor === vendor){

   total += Number(p.celoSent)

  }

 }

 return total

}


function getTotalSpent(){

 const data = read()

 let total = 0

 for(const p of data){

  total += Number(p.celoSent)

 }

 return total

}


function getAll(){

 return read()

}



module.exports = {

 savePayment,
 getLastPayment,
 getVendorTotal,
 getTotalSpent,
 getAll

}
