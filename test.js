const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const src=html.match(/<script>([\s\S]*)<\/script>/)[1];
function load(edit){const m={exports:{}};let s=src;if(edit)s=edit(s);vm.runInNewContext(s,{module:m,Math,Float64Array});return m.exports;}
const A=load();

function assert(cond, msg){ if(!cond){ console.error('FAIL:', msg); process.exitCode=1; } else console.log('ok:', msg); }

const day=A.getPeriod('day'), week=A.getPeriod('week'), month=A.getPeriod('month');
console.log('day', JSON.stringify(day));
console.log('week', JSON.stringify(week));
console.log('month', JSON.stringify(month));

assert(day && day.trades===4 && day.wins===4 && day.winRate===1 && day.turnover===200 && day.profit===183, 'day = latest entry only');
assert(day.from==='23.11.2026' && day.to==='23.11.2026' && day.days===1, 'day range is one date');
assert(week && week.trades===73 && week.wins===56, 'week sums 21.11 + 23.11');
assert(Math.abs(week.winRate - 56/73)<1e-12, 'week winRate = wins/trades');
assert(week.turnover===5399.38 && Math.abs(week.profit-1019.70)<1e-9, 'week turnover/profit summed');
assert(week.minTrade===1 && week.maxTrade===1000 && week.maxProfit===817.88, 'week min/max from both days');
assert(week.from==='21.11.2026' && week.to==='23.11.2026' && week.days===2, 'week date range and day count');
assert(month.trades===week.trades && month.wins===week.wins && month.from===week.from, 'month currently equals week (both entries in 30 days)');
assert(day.payout===0.92 && week.payout===0.92, 'payout applied to periods');

// duplicate date: later entry replaces earlier
const dup=A.normalizeLog([
  { date:'23.11.2026', trades:1, wins:0, turnover:10, profit:-10, minTrade:10, maxTrade:10, maxProfit:0 },
  { date:'23.11.2026', trades:4, wins:4, turnover:200, profit:183, minTrade:50, maxTrade:50, maxProfit:46 }
]);
assert(dup.length===1 && dup[0].trades===4 && dup[0].wins===4, 'later same-date entry replaces earlier');

// window: entry 8 days before latest excluded from week, included in month
const extra=[
  { date:'15.11.2026', trades:10, wins:5, turnover:100, profit:10, minTrade:1, maxTrade:20, maxProfit:5 },
  { date:'21.11.2026', trades:69, wins:52, turnover:5199.38, profit:836.70, minTrade:1, maxTrade:1000, maxProfit:817.88 },
  { date:'23.11.2026', trades:4, wins:4, turnover:200, profit:183, minTrade:50, maxTrade:50, maxProfit:46 }
];
const w2=A.getPeriod('week', extra), m2=A.getPeriod('month', extra), d2=A.getPeriod('day', extra);
assert(d2.trades===4, 'day still latest with extra log');
assert(w2.trades===73 && w2.days===2, '15.11 is 8 days before 23.11, excluded from week');
assert(m2.trades===83 && m2.days===3 && m2.wins===61, '15.11 included in month');

// entry 31 days before latest excluded from month
const old=[
  { date:'23.10.2026', trades:8, wins:4, turnover:80, profit:4, minTrade:1, maxTrade:20, maxProfit:5 },
  { date:'23.11.2026', trades:4, wins:4, turnover:200, profit:183, minTrade:50, maxTrade:50, maxProfit:46 }
];
assert(A.getPeriod('month', old).trades===4 && A.getPeriod('month', old).days===1, '31 days earlier excluded from month');
assert(A.getPeriod('week', old).trades===4, 'old October entry excluded from week');
assert(A.getPeriod('day', old).trades===4, 'day ignores old October entry');

// empty log
assert(A.getPeriod('month', [])===null, 'empty log -> null period');

for (const name of ['day','week','month']){
  const S=A.getPeriod(name);
  const start=100, stake=A.defaultStake(start), trades=30;
  const r=A.simulate(start, stake, trades, S);
  console.log(`TAB ${name} start ${start} stake ${stake} EV/trade ${r.ev.toFixed(3)} expected ${(start+30*r.ev).toFixed(2)} | p10 ${Math.round(r.p10)} median ${Math.round(r.median)} p90 ${Math.round(r.p90)} bust ${(r.bust*100).toFixed(2)}%`);
}

// default simulate uses month
const rDef=A.simulate(100, 2, 30);
const rMonth=A.simulate(100, 2, 30, month);
assert(JSON.stringify(rDef)===JSON.stringify(rMonth), 'simulate() without S uses month');

console.log('deterministic', JSON.stringify(A.simulate(20,1,30,week))===JSON.stringify(A.simulate(20,1,30,week)));
assert(JSON.stringify(A.simulate(20,1,30,week))===JSON.stringify(A.simulate(20,1,30,week)), 'deterministic');

let r=A.simulate(20,20,30,week);console.log('all-in stake20 bust%',(r.bust*100).toFixed(1),'median',r.median);
r=A.simulate(20,5,300,week);console.log('stake5 300 trades bust%',(r.bust*100).toFixed(1));

r=A.simulate(100,2,30,{winRate:0.50,payout:0.92});console.log('winRate .50 -> EV',r.ev.toFixed(3),'median',Math.round(r.median),'bust',(r.bust*100).toFixed(1));
assert(Math.abs(r.ev - 100*0.02*(0.50*0.92-0.50))<1e-9, 'EV formula at 50% wr');

r=A.simulate(100,2,30,{winRate:0.75,payout:0.80});console.log('payout .80 wr .75 -> EV',r.ev.toFixed(3),'median',Math.round(r.median));

// 100% win rate: zero bust, tight projections
r=A.simulate(100,2,30,day);
const exact=100+30*2*0.92;
console.log('day 100% wr exact', exact, 'median', r.median, 'p10', r.p10, 'p90', r.p90, 'bust', r.bust);
assert(r.bust===0, '100% wr -> 0% bust');
assert(Math.abs(r.median-exact)<1e-9 && Math.abs(r.p10-exact)<1e-9 && Math.abs(r.p90-exact)<1e-9, '100% wr projections are exact');

let t=Date.now();A.simulate(1000,20,300,month);console.log('ms for 5000x300',Date.now()-t);
if(process.exitCode) console.error('SOME TESTS FAILED'); else console.log('ALL TESTS PASSED');
