const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
let js = m[1];
js = js.replace("init();", "init(); globalThis.__State=State;");
const els = {};
function makeEl(id){ return { id, innerHTML:"", textContent:"", value:"", className:"", getContext:()=>null,
  style:{}, children:[], prepend(){}, removeChild(){}, getBoundingClientRect:()=>({width:800,height:400}),
  addEventListener(){}, appendChild(){}, width:0, height:0 }; }
global.document = { getElementById: id => els[id] || (els[id] = makeEl(id)), createElement:()=>makeEl("tmp") };
global.window = { addEventListener(){}, devicePixelRatio:1 };
const vm = require("vm");
const context = { console, setTimeout, clearTimeout, setImmediate, process, Promise,
  Math, JSON, Date, fetch, AbortController, window: global.window, document: global.document, setInterval: ()=>0, clearInterval: ()=>{} };
vm.createContext(context);
vm.runInContext(js, context);
(async () => {
  try {
    await context.loadAll();
    const S = context.__State;
    console.log("klines 15m len:", (S.klines["15m"]||[]).length);
    console.log("ticker:", S.ticker ? S.ticker.lastPrice : "null");
    console.log("dxy:", S.dxy ? "ok" : "null");
    console.log("spot:", S.spot ? S.spot.price : "null");
    console.log("depth:", S.depth ? "ok" : "null");
    console.log("lsGlobal:", S.lsGlobal && S.lsGlobal.length ? S.lsGlobal[S.lsGlobal.length-1].longShortRatio : "null");
    context.computeEverything();
    const s = S.signal;
    console.log("signal dir:", s && s.dir);
    console.log("signal:", JSON.stringify({dir:s.dir,conf:s.conf,entry:s.entry,sl:s.sl,tp:s.tp,rr:s.rr,
      longCount:s.longCount,shortCount:s.shortCount,neutCount:s.neutCount,
      mtfBias:s.mtfBias,funding:s.funding,dxyRet:s.dxyRet,obImb:s.obImb,atrPct:s.atrPct},null,2));
    console.log("agent count:", s.agents ? s.agents.length : 0);
    console.log("non-neutral:", s.agents ? s.agents.filter(a=>a.dir!=="NEUTRAL").length : 0);
    console.log("TEST DONE");
  } catch(e) { console.error("TEST FAIL:", e); process.exit(1); }
})();


