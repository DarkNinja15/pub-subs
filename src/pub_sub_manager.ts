import { createClient, RedisClientType } from "redis";

export class PubSubManager{
    private static instance:PubSubManager;
    public redisClient:RedisClientType;
    private subscriptions:Map<string,string[]>;
    private constructor(){
        this.redisClient=createClient();
        this.connectToRedis();
        this.subscriptions=new Map();
    }

    private async connectToRedis(){
        await this.redisClient.connect();
    }

    static getInstance():PubSubManager{
        if(this.instance)
            return this.instance;
        this.instance=new PubSubManager();
        return this.instance;
    }

    async subscribeUserToStock(userId:string,stockTicker:string){
        if(!this.subscriptions.has(stockTicker)){
            this.subscriptions.set(stockTicker,[]);
        }
        this.subscriptions.get(stockTicker)?.push(userId);
        console.log(`${userId} subscribed`);

        if(this.subscriptions.get(stockTicker)?.length===1){
            await this.redisClient.subscribe(stockTicker,(message)=>{
                this.forwardMessageToUser(stockTicker,message);
            });
        }
    }

    async unsubscribeUserFromStock(userId:string,stockTicker:string){
        if(this.subscriptions.get(stockTicker)?.includes(userId)){
            const index=this.subscriptions.get(stockTicker)?.indexOf(userId);
            if(index!==undefined){
                this.subscriptions.get(stockTicker)?.splice(index,1);
                if(this.subscriptions.get(stockTicker)?.length===0){
                    await this.redisClient.unsubscribe(stockTicker);
                }
            }
        }
    }

    forwardMessageToUser(stockTicker:string,message:string){
        console.log(`Message recieved on channel ${stockTicker}`);
        this.subscriptions.get(stockTicker)?.forEach((user)=>{
            console.log(`Sending message to ${user} for stock ${stockTicker}`);
        });
    }

    async disconnect(){
        await this.redisClient.quit();
    }
}