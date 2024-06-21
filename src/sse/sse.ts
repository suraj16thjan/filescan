import { 
  redisSubscriber,
} from "../utils";

const  serializeEvent = (data : any) => {
    const jsonString = JSON.stringify(data);
    return `data: ${jsonString}\n\n`;
}


export const handleSSE = async (req : any, res: any) => {
  const { subId } =  req  
  res.set({
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    });
    res.flushHeaders();

    res.write(serializeEvent("connected"));

    await redisSubscriber.subscribe(subId, (message:any, _channel: any) => {
      res.write(serializeEvent({ message }));
    });

    req.on("close", () => {
      console.log(
        `*** Connection closed!!! for file scanner ${subId}`
      );
      // Remove from embedGlobalState
      res.end();
    });
}