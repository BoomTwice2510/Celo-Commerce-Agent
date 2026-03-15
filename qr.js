function parseQR(data){

 try{

 const obj=JSON.parse(data)

 return{

 vendor:obj.vendor,

 amount:obj.amount,

 address:obj.address

 }

 }catch{

 return null

 }

}

module.exports=parseQR
