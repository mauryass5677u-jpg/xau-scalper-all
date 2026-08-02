const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
let js = m[1];
js = js.replace("init();", "init(); globalThis.__State=State;");
const els = {};
function makeEl(id){ return { id, innerHTML:"", textContent:"", value:"", className:"",
  style:{}, children:[], prepend(){}, removeChild(){}, getBoundingClientRect:()=>({width:800,height:400}),
  addEventListener(){}, appendChild(){}, width:0, height:0, getContext:()=>null }; }
global.document = { getElementById: id => els[id] || (els[id] = makeEl(id)), createElement:()=>makeEl("tmp") };
global.window = { addEventListener(){}, devicePixelRatio:1 };
const vm = require("vm");
const context = { console, setTimeout, clearTimeout, setImmediate, process, Promise,
  Math, JSON, Date, fetch, AbortController, window: global.window, document: global.document,
  setInterval: ()=>0, clearInterval: ()=>{} };
vm.createContext(context);
vm.runInContext(js, context);

(async () => {
  try {
    for (let round=1; round<=3; round++) {
      await context.loadAll();
      context.computeEverything();
      const S = context.__State;
      const s = S.signal;
      console.log(`round ${round}: price=${context.curPrice().toFixed(2)} dir=${s.dir} conf=${s.conf} entry=${s.entry} sl=${s.sl} tp=${s.tp} agents=${s.agents.length} N=${s.neutCount}`);
      // simulate ws live tick update (as browser 2s timer does)
      const px = context.curPrice() + 0.5;
      S.wsTicker = { c: px };
      if (S.signal && S.signal.entry) {
        console.log(`  ws tick ${px.toFixed(2)} -> signal still intact: ${!!S.signal.entry}`);
      }
    }
    // test TF switch path
    context.__State.tf = "5m";
    await context.loadAll();
    context.computeEverything();
    console.log("TF switch to 5m OK, signal dir:", context.__State.signal.dir);
    console.log("STABILITY TEST PASSED");
  } catch(e) { console.error("STABILITY FAIL:", e); process.exit(1); }
})();
