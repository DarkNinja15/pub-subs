import { PubSubManager } from "./pub_sub_manager";


const pubSubManager=PubSubManager.getInstance();


setInterval(async ()=>{
    await pubSubManager.subscribeUserToStock(Math.random().toString(),"APPLE");
},5000);
