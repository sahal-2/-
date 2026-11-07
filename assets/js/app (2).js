/* شراع للتسويق الإلكتروني — منشئ الخطط وعروض الأسعار والإنذارات */
"use strict";
/* ---------- assets & constants ---------- */
const CFG = Object.assign({proxy:""}, window.SAHL_CONFIG||{});
const AS = window.SAHL_ASSETS||{};
const LOGO_LIGHT = AS.logoLight||"";
const TPL_FILE = {cozy:"koziksa"};
const tplCache = {};
function getTpl(id){
  if(!tplCache[id]) tplCache[id]=fetch(`templates/${TPL_FILE[id]||id}.html`).then(r=>{ if(!r.ok) throw new Error("template "+id+" "+r.status); return r.text(); })
    .then(t=>t.split("{{LOGO_LIGHT}}").join(LOGO_LIGHT)).catch(e=>{ delete tplCache[id]; throw e; });
  return tplCache[id];
}
const thumbOf = id=>`assets/img/thumbs/${id}.jpg`;
const cssCache = {};
function cssText(name){ if(!cssCache[name]) cssCache[name]=fetch(`assets/css/${name}.css`).then(r=>r.text()).catch(e=>{ delete cssCache[name]; throw e; }); return cssCache[name]; }
const MODELS = ["gemini-3.8-flash","gemini-flash-latest","gemini-3.6-flash","gemini-3.5-flash-lite"];
const LITE_MODELS = ["gemini-3.5-flash-lite","gemini-3.1-flash-lite","gemini-flash-lite-latest","gemini-2.5-flash-lite"];
// احتياطي مجاني على Cloudflare Workers AI (بيشتغل بس من خلال سيرفر الأداة) — بيتجرّب لما كل موديلات Gemini تقع
const CF_MODELS = ["@cf/google/gemma-4-26b-a4b-it","@cf/openai/gpt-oss-120b"];
// احتياطي تالت على Groq (بيشتغل بس لو GROQ_API_KEY متحط في Cloudflare، غير كده بيتخطاه على طول)
const GROQ_MODELS = ["groq:openai/gpt-oss-120b","groq:qwen/qwen3.8-27b"];
const BK_MODELS = [...CF_MODELS,...GROQ_MODELS], isBackup = m=>/^(@cf\/|groq:)/.test(m);
const API = "https://generativelanguage.googleapis.com/v1beta/models/";
const LIBS = {
  h2c: "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  pdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
};
const COMPANY = "شراع للتسويق الإلكتروني";
const PLATFORMS = ["سناب شات","تيك توك","إنستجرام"];
const DUR_TXT = {1:"شهر واحد",3:"3 أشهر",4:"4 أشهر",6:"6 أشهر",12:"12 شهرًا"};
const S_ALL=["seo","social","ads"], F="تحسين محركات البحث (SEO) + إدارة السوشيال ميديا + إدارة الحملات الإعلانية";
const PACKAGES = [
 {id:"p01",name:"باقة 3 شهور + 3 مشاهير",months:3,inf:3,min:4800,max:7000,svc:[...S_ALL,"influencers"],
  items:["إدارة الحملات الإعلانية لمدة 3 شهور","3 من المشاهير","تحسين محركات البحث (SEO) لمدة شهر","إدارة السوشيال ميديا لمدة 3 شهور"],
  sched:[F+" + 1 من المؤثرين","إدارة الحملات الإعلانية + السوشيال ميديا + 1 من المؤثرين","إدارة الحملات الإعلانية + السوشيال ميديا + 1 من المؤثرين"]},
 {id:"p02",name:"باقة فل باكدج لمدة شهر + 1 مشهور",months:1,inf:1,min:2500,max:3000,svc:[...S_ALL,"influencers"],
  items:["إدارة السوشيال ميديا لمدة شهر","تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهر","مشهور واحد"],
  sched:[F+" + 1 مشهور"]},
 {id:"p03",name:"باقة تطبيق سنة + 3 مشاهير",months:3,inf:3,min:4500,max:5000,svc:["influencers"],app:"تطبيق ويب فيو لمدة سنة",kind:"app",
  items:["إنشاء تطبيق ويب فيو لمدة سنة","3 من المشاهير"],
  sched:["إطلاق التطبيق + 1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p04",name:"باقة فل باكدج لمدة 6 شهور + 6 مشاهير",months:6,inf:6,min:11000,max:15000,svc:[...S_ALL,"influencers"],
  items:["إدارة السوشيال ميديا لمدة 6 شهور","6 من المشاهير","تحسين محركات البحث (SEO) لمدة 6 شهور","إدارة الحملات الإعلانية لمدة 6 شهور"],
  every:F+" + 1 مؤثر كل شهر"},
 {id:"p05",name:"باقة سنة + 6 مشاهير",months:12,inf:6,min:15000,max:17000,svc:[...S_ALL,"influencers"],
  items:["تحسين محركات البحث (SEO) لمدة 6 شهور","إدارة الحملات الإعلانية لمدة 6 شهور","إدارة السوشيال ميديا لمدة 6 شهور","6 من المشاهير"],
  sched:[F,F,F,F,F,F,"1 من المؤثرين","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p06",name:"باقة شهرين (الأول سوشيال - الثاني مشاهير)",months:2,inf:2,min:2500,max:3000,svc:["social","influencers"],
  items:["إدارة السوشيال ميديا لمدة شهر","2 من المشاهير"],sched:["إدارة حسابات السوشيال ميديا","2 من المؤثرين"]},
 {id:"p07",name:"باقة شهرين (الأول فل - الثاني مشاهير)",months:2,inf:2,min:3500,max:4000,svc:[...S_ALL,"influencers"],
  items:["إدارة السوشيال ميديا لمدة شهر","إدارة الحملات الإعلانية لمدة شهر","2 من المشاهير","تحسين محركات البحث (SEO) لمدة شهر"],sched:[F,"2 من المؤثرين"]},
 {id:"p08",name:"باقة شهرين (الأول SEO - الثاني مشاهير)",months:2,inf:2,min:2500,max:3000,svc:["seo","influencers"],
  items:["تحسين محركات البحث (SEO) لمدة شهر","2 من المشاهير"],sched:["تحسين محركات البحث (SEO)","2 من المؤثرين"]},
 {id:"p09",name:"باقة فل باكدج لمدة شهرين",months:2,inf:2,min:4800,max:5600,svc:[...S_ALL,"influencers"],
  items:["2 من المشاهير","تحسين محركات البحث (SEO) لمدة شهرين","إدارة الحملات الإعلانية لمدة شهرين","إدارة السوشيال ميديا لمدة شهرين"],every:F+" + 1 مؤثر كل شهر"},
 {id:"p10",name:"باقة 8 شهور",months:8,inf:4,min:9000,max:10000,svc:[...S_ALL,"influencers"],
  items:["4 من المشاهير","تحسين محركات البحث (SEO) لمدة 4 شهور","إدارة السوشيال ميديا لمدة 4 شهور","إدارة الحملات الإعلانية لمدة 4 شهور"],
  sched:[F,F,F,F,"1 من المؤثرين","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p11",name:"باقة WINNER (3 شهور)",months:3,inf:1,min:3500,max:5000,svc:[...S_ALL,"influencers"],
  items:["إدارة السوشيال ميديا لمدة شهر","تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهر","مشهور واحد"],
  sched:["تحسين محركات البحث (SEO)","إدارة الحملات الإعلانية + السوشيال ميديا","مشهور واحد"]},
 {id:"p12",name:"باقة 3 شهور (SEO + سوشيال)",months:3,inf:0,min:4500,max:5000,svc:["seo","social"],
  items:["تحسين محركات البحث (SEO) لمدة 3 شهور","إدارة السوشيال ميديا لمدة 3 شهور"],every:"تحسين محركات البحث (SEO) + إدارة حسابات التواصل الاجتماعي"},
 {id:"p13",name:"باقة 3 مشاهير",months:1,inf:3,min:1500,max:3000,svc:["influencers"],items:["3 من المشاهير"],every:"3 مشاهير خلال الشهر"},
 {id:"p14",name:"باقة 10 مشاهير",months:3,inf:10,min:4500,max:12000,svc:["influencers"],items:["10 مشاهير"],every:"10 مشاهير موزعين على 3 شهور"},
 {id:"p15",name:"باقة 20 مشهور",months:6,inf:20,min:8500,max:20000,svc:["influencers"],items:["20 مشهور"],every:"20 مشهور موزعين على 6 شهور"},
 {id:"p16",name:"باقة 6 مشاهير",months:3,inf:6,min:3000,max:8000,svc:["influencers"],items:["6 من المشاهير"],every:"6 مشاهير موزعين على 3 شهور"},
 {id:"p17",name:"باقة شهرين (الأول ميديا - الثاني 2 مشاهير)",months:2,inf:2,min:2500,max:3000,svc:["ads","influencers"],
  items:["إدارة الحملات الإعلانية لمدة شهر","2 من المشاهير"],sched:["إدارة الحملات الإعلانية","2 من المؤثرين"]},
 {id:"p18",name:"إنشاء تطبيق ويب فيو سنة",months:12,inf:0,min:3000,max:6000,svc:[],app:"تطبيق ويب فيو لمدة سنة",kind:"app",items:["إنشاء تطبيق ويب فيو لمدة سنة"]},
 {id:"p19",name:"باقة تطبيق لمدة عام + 5 مشاهير",months:5,inf:5,min:5500,max:10000,svc:["influencers"],app:"تطبيق ويب فيو لمدة سنة",kind:"app",
  items:["إنشاء تطبيق ويب فيو لمدة سنة","5 مشاهير"],sched:["إطلاق التطبيق + 1 من المؤثرين","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p20",name:"إنشاء تطبيق ويب فيو مدى الحياة",months:12,inf:0,min:11000,max:20000,svc:[],app:"تطبيق ويب فيو مدى الحياة",kind:"app",items:["إنشاء تطبيق ويب فيو مدى الحياة"]},
 {id:"p21",name:"باقة 6 شهور (3 مشاهير)",months:6,inf:3,min:6500,max:7000,svc:[...S_ALL,"influencers"],
  items:["تحسين محركات البحث (SEO) لمدة 3 شهور","إدارة الحملات الإعلانية لمدة 3 شهور","إدارة السوشيال ميديا لمدة 3 شهور","3 من المشاهير"],
  sched:[F,F,F,"1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p22",name:"باقة 12 مشهور",months:3,inf:12,min:5500,max:10000,svc:["influencers"],items:["10 مشاهير","2 من المشاهير"],every:"12 مشهور موزعين على مدة الباقة",unsure:true},
 {id:"p23",name:"باقة شهر حملات إعلانية + تطبيق لمدة سنة",months:1,inf:0,min:4500,max:5000,svc:["ads"],app:"تطبيق ويب فيو لمدة سنة",
  items:["إنشاء تطبيق ويب فيو لمدة سنة","إدارة الحملات الإعلانية لمدة شهر"],sched:["إدارة الحملات الإعلانية + إطلاق التطبيق"]},
 {id:"p24",name:"باقة WINNER 2 (3 شهور)",months:3,inf:1,min:3500,max:8000,svc:["social","ads","influencers"],
  items:["إدارة الحملات الإعلانية لمدة شهرين","إدارة السوشيال ميديا لمدة شهرين","مشهور واحد"],
  sched:["إدارة الحملات الإعلانية + السوشيال ميديا","إدارة الحملات الإعلانية + السوشيال ميديا","إعلان عن طريق مشهور"]},
 {id:"p25",name:"باقة 4 شهور",months:4,inf:2,min:4500,max:5000,svc:[...S_ALL,"influencers"],
  items:["إدارة السوشيال ميديا لمدة 3 شهور","إدارة الحملات الإعلانية لمدة شهر","2 من المشاهير","تحسين محركات البحث (SEO) لمدة شهرين"],
  sched:["تحسين محركات البحث (SEO) + إدارة السوشيال ميديا","تحسين محركات البحث (SEO) + إدارة السوشيال ميديا","إدارة الحملات الإعلانية + إدارة السوشيال ميديا","2 من المؤثرين"]},
 {id:"p26",name:"إنشاء تطبيق ويب فيو 3 سنوات",months:12,inf:0,min:6500,max:10000,svc:[],app:"تطبيق ويب فيو لمدة 3 سنوات",kind:"app",items:["إنشاء تطبيق ويب فيو لمدة 3 سنوات"]},
 {id:"p27",name:"باقة 3 شهور + 3 مشاهير (شهر لكل خدمة)",months:3,inf:3,min:4500,max:5000,svc:[...S_ALL,"influencers"],
  items:["3 من المشاهير","إدارة السوشيال ميديا لمدة شهر","تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهر"],
  sched:["تحسين محركات البحث (SEO)","إدارة الحملات الإعلانية","إدارة السوشيال ميديا + 3 من المؤثرين"]},
 {id:"p28",name:"باقة 6 شهور + 3 مشاهير",months:6,inf:3,min:5500,max:6000,svc:[...S_ALL,"influencers"],
  items:["3 من المشاهير","تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهرين","إدارة السوشيال ميديا لمدة شهرين"],
  sched:["تحسين محركات البحث (SEO)","إدارة الحملات الإعلانية + السوشيال ميديا","إدارة الحملات الإعلانية + السوشيال ميديا","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p29",name:"باقة 6 شهور + تطبيق لمدة سنة",months:6,inf:3,min:7500,max:8000,svc:[...S_ALL,"influencers"],app:"تطبيق ويب فيو لمدة سنة",
  items:["إنشاء تطبيق ويب فيو لمدة سنة","3 من المشاهير","تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهرين","إدارة السوشيال ميديا لمدة شهرين"],
  sched:["تحسين محركات البحث (SEO) + إطلاق التطبيق","إدارة السوشيال ميديا + الحملات الإعلانية","إدارة السوشيال ميديا + الحملات الإعلانية","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p30",name:"باقة 5 مشاهير",months:2,inf:5,min:2500,max:7000,svc:["influencers"],items:["5 مشاهير"],every:"5 مشاهير موزعين على شهرين"},
 {id:"p31",name:"باقة 4 شهور + 2 مشاهير",months:4,inf:2,min:4900,max:5500,svc:[...S_ALL,"influencers"],
  items:["تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهرين","إدارة السوشيال ميديا لمدة شهرين","2 من المشاهير"],
  sched:["تحسين محركات البحث (SEO)","إدارة السوشيال ميديا + الحملات الإعلانية","إدارة السوشيال ميديا + الحملات الإعلانية","2 من المؤثرين"]},
 {id:"p32",name:"باقة 5 شهور + 2 مشاهير",months:5,inf:2,min:5000,max:5500,svc:[...S_ALL,"influencers"],
  items:["تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهرين","إدارة السوشيال ميديا لمدة شهرين","2 من المشاهير"],
  sched:["تحسين محركات البحث (SEO)","إدارة الحملات الإعلانية + السوشيال ميديا","إدارة الحملات الإعلانية + السوشيال ميديا","1 من المؤثرين","1 من المؤثرين"]},
 {id:"p33",name:"باقة فل باكدج لمدة سنة + 12 مشهور",months:12,inf:12,min:20000,max:30000,svc:[...S_ALL,"influencers"],
  items:["تحسين محركات البحث (SEO) لمدة 12 شهر","إدارة الحملات الإعلانية لمدة 12 شهر","إدارة السوشيال ميديا لمدة 12 شهر","12 مشهور"],every:F+" + 1 مؤثر كل شهر"},
 {id:"p34",name:"باقة WINNER 3 (4 شهور)",months:4,inf:3,min:4500,max:10000,svc:[...S_ALL,"influencers"],
  items:["3 من المشاهير","إدارة السوشيال ميديا لمدة شهر","تحسين محركات البحث (SEO) لمدة شهر","إدارة الحملات الإعلانية لمدة شهر"],
  sched:["تحسين محركات البحث (SEO)","الحملات الإعلانية + السوشيال ميديا","2 من المؤثرين","1 من المؤثرين"]},
 {id:"p35",name:"باقة 20",months:2,inf:1,min:10000,max:15000,svc:["ads","influencers"],app:"تطبيق ويب فيو لمدة سنة",
  items:["إنشاء تطبيق ويب فيو لمدة سنة","مشهور واحد","إدارة الحملات الإعلانية لمدة شهرين"],every:"إدارة الحملات الإعلانية + تطبيق ويب فيو، ومشهور واحد خلال الباقة"},
 {id:"p36",name:"باقة فل باكدج لمدة 3 شهور + 3 مؤثرين",months:3,inf:3,min:6500,max:7500,svc:[...S_ALL,"influencers"],
  items:["تحسين محركات البحث (SEO) لمدة 3 شهور","إدارة الحملات الإعلانية لمدة 3 شهور","إدارة السوشيال ميديا لمدة 3 شهور","3 من المشاهير"],every:F+" + 1 مشهور كل شهر"},
 {id:"p37",name:"باقة 2 مشاهير",months:1,inf:2,min:1000,max:2500,svc:["influencers"],items:["2 من المشاهير"],every:"2 مشاهير خلال الشهر"},
 {id:"p38",name:"باقة فل باكدج سنة + تطبيق",months:12,inf:0,min:23000,max:30000,svc:[...S_ALL],app:"تطبيق ويب فيو لمدة سنة",
  items:["إنشاء تطبيق ويب فيو لمدة سنة","تحسين محركات البحث (SEO) لمدة 12 شهر","إدارة الحملات الإعلانية لمدة 12 شهر","إدارة السوشيال ميديا لمدة 12 شهر"],every:F+" + التطبيق"},
 {id:"p39",name:"باقة 6 شهور (6 مشاهير)",months:6,inf:6,min:6500,max:7500,svc:[...S_ALL,"influencers"],
  items:["تحسين محركات البحث (SEO) لمدة 3 شهور","إدارة الحملات الإعلانية لمدة 3 شهور","إدارة السوشيال ميديا لمدة 3 شهور","6 من المشاهير"],
  sched:[F+" + 1 من المؤثرين",F+" + 1 من المؤثرين",F+" + 1 من المؤثرين","1 من المؤثرين","1 من المؤثرين","1 من المؤثرين"]}
];
const PKG=Object.fromEntries(PACKAGES.map(p=>[p.id,p]));
function durTxt(n){ n=+n; if(n===1) return "شهر واحد"; if(n===2) return "شهران"; if(n<=10) return n+" أشهر"; return n+" شهرًا"; }
function durDays(n){ return (n*30)+" يومًا"; }
function pkgSched(p){
  if(!p) return [];
  if(p.every) return [`${p.months===1?"خلال الشهر":"كل شهر ("+durTxt(p.months)+")"}: ${p.every}`];
  const out=[]; let i=0;
  while(i<(p.sched||[]).length){ let j=i; while(j+1<p.sched.length && p.sched[j+1]===p.sched[i]) j++;
    out.push(`${i===j?"الشهر "+ORD_F[i]:"الشهور "+(i+1)+"–"+(j+1)}: ${p.sched[i]}`); i=j+1; }
  return out;
}
const ORD_F=["الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر","الحادي عشر","الثاني عشر"];
// influencers per package (6 and 12 months: the sales person picks 3–6)
const INF_BY_DUR = {1:1,3:3,4:2};
const INF_DEFAULT = {3:4,6:6};
const AR_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const ORD = ["الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر"];
const AR_DIG = s=>String(s).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const AGENCY_ALIASES = [/شركة سهل للتسويق الإلكتروني/g,/سهل للتسويق الإلكتروني/g,/مؤسسة سهل الإتقان(?: للخدمات التسويقية)?/g,/سهل الإتقان/g,/مؤسسة سهل للتسويق الرقمي/g,/سهل للتسويق الرقمي/g,/Sahl Digital Marketing/g];

const SERVICES = [
  {key:"seo", label:"تحسين محركات البحث (SEO)", hint:"ظهور في Google"},
  {key:"social", label:"إدارة السوشيال ميديا", hint:"سناب وتيك توك وإنستجرام"},
  {key:"ads", label:"الحملات الإعلانية الممولة", hint:"سناب وتيك توك وإنستجرام"},
  {key:"influencers", label:"إعلانات المشاهير", hint:"مشاهير +1 مليون متابع"},
  {key:"design", label:"صناعة المحتوى والتصميم", hint:"تصاميم وفيديو"}
];
const SVC = Object.fromEntries(SERVICES.map(s=>[s.key,s]));
const CAT_PACK = {
"عطور وبخور":{aud:"رجال ونساء 22–45 في السعودية والخليج، عشاق العود والمسك، ومشترين الهدايا",kw:["عطور عود","دهن عود أصلي","بخور فاخر","عطور نسائية ثابتة","عطور رجالية فخمة","مسك الطهارة","هدايا عطور","مباخر","عطر يدوم طويلًا","عود كمبودي"],seasons:["رمضان والعشر الأواخر","عيد الفطر وعيد الأضحى","اليوم الوطني","الجمعة البيضاء","موسم الأعراس","الشتاء (موسم العود)"],content:["تجربة الثبات خلال اليوم","مقارنة روائح العود","طريقة تبخير البيت","تنسيق هدية عطور","قصة المكونات ومصدر العود","ردود فعل العملاء عند الشم"],inf:["مشاهير لايف ستايل رجالي","صناع محتوى هدايا ومناسبات","مؤثرات تجميل وأناقة"],ads:["الثبات والفوحان","الأصالة والجودة","هدية جاهزة مغلفة","عروض الأعياد والمواسم"]},
"عبايات وأزياء نسائية":{aud:"نساء 18–40 في السعودية، طالبات وموظفات وعرائس",kw:["عبايات سوداء","عبايات ملونة","عبايات كلوش","عبايات رسمية","عباية عملية للدوام","جلابيات","فساتين سهرة","عبايات بشت","طرح","عبايات كريب"],seasons:["رمضان والعيد","العودة للدوام والجامعات","موسم الأعراس","اليوم الوطني","الجمعة البيضاء"],content:["تنسيق عباية لمناسبات مختلفة","قبل وبعد اللبس","تفاصيل القماش والتطريز","دليل المقاسات","لوك يومي للدوام","تجربة عميلات حقيقية"],inf:["مؤثرات موضة سعوديات","مدونات أناقة محتشمة","صانعات محتوى عرائس"],ads:["القصة والقماش","موديلات حصرية","توصيل سريع داخل المملكة","تقسيط تابي وتمارا"]},
"أزياء رجالية":{aud:"رجال 18–45، موظفين وشباب جامعة",kw:["ثياب رجالية","ثوب صيفي","ثوب شتوي","شماغ","أشمغة فاخرة","بشوت","ملابس رجالية كاجوال","ملابس رياضية رجالية","تفصيل ثياب","أزرار ثياب"],seasons:["رمضان والعيد","الشتاء","اليوم الوطني","العودة للدوام","الجمعة البيضاء"],content:["طريقة لبس الشماغ","الفرق بين الأقمشة","تنسيق الثوب للمناسبات","وراء الكواليس في التفصيل","مقاسات وتفصيل حسب الطلب"],inf:["مشاهير لايف ستايل رجالي","صناع محتوى موضة شبابي"],ads:["جودة القماش","مقاسات دقيقة","تشكيلة العيد","توصيل وتبديل سهل"]},
"تجميل وعناية بالبشرة":{aud:"نساء 18–40 مهتمات بالبشرة والمكياج",kw:["روتين العناية بالبشرة","سيروم فيتامين سي","واقي شمس","مرطب للبشرة الدهنية","علاج الحبوب","تفتيح البشرة","مكياج طبيعي","منتجات كورية","غسول للوجه","كريم ترطيب"],seasons:["الصيف (واقي الشمس)","الشتاء (الترطيب)","رمضان والعيد","موسم الأعراس","الجمعة البيضاء"],content:["روتين صباحي ومسائي","قبل وبعد الاستخدام","مكونات المنتج وفايدتها","ريفيو صادق من عميلات","أخطاء العناية الشائعة","تجربة على أنواع بشرة مختلفة"],inf:["مؤثرات تجميل وبيوتي","أخصائيات عناية بالبشرة","صانعات محتوى روتين يومي"],ads:["نتيجة واضحة بالصور","مكونات آمنة","مناسب لنوع بشرتك","عروض الباقات"],note:"الالتزام بضوابط هيئة الغذاء والدواء في الادعاءات العلاجية"},
"إكسسوارات ومجوهرات":{aud:"نساء 18–45 ومشترين هدايا",kw:["إكسسوارات نسائية","مجوهرات فضة","ذهب صيني","أطقم ناعمة","خواتم","أساور بالاسم","سلاسل","هدايا مجوهرات","إكسسوارات ستيل لا تصدي","حلق"],seasons:["رمضان والعيد","موسم الأعراس","اليوم الوطني","الجمعة البيضاء","التخرج"],content:["تنسيق الإكسسوار مع اللبس","تغليف الهدايا","قطع بالاسم","تجربة المقاومة للماء والتصدي","لوك يومي مقابل مناسبات"],inf:["مؤثرات موضة وأناقة","صناع محتوى هدايا"],ads:["لا تصدي ولا تتغير","هدية مثالية","نقش بالاسم","أسعار تبدأ من..."]},
"شنط وأحذية":{aud:"نساء ورجال 18–40",kw:["شنط نسائية","شنط ماركات","أحذية نسائية","كعب عالي","سنيكرز","شنط كروس","شنط سهرة","صنادل","شنط جلد طبيعي","أحذية مريحة"],seasons:["رمضان والعيد","العودة للمدارس والجامعات","الصيف والسفر","الجمعة البيضاء"],content:["تنسيق الشنطة مع اللوك","وش جوه الشنطة","اختبار الراحة للأحذية","مقارنة الأحجام","تفاصيل الخامة"],inf:["مؤثرات موضة","صناع محتوى سفر ولايف ستايل"],ads:["خامة تعيش","تشكيلة جديدة","مقاسات متوفرة","تبديل سهل"]},
"جوالات وإلكترونيات":{aud:"رجال ونساء 18–45 يقارنون قبل الشراء",kw:["أسعار الجوالات","آيفون","سامسونج","جوالات بالتقسيط","سماعات لاسلكية","شواحن سريعة","ساعات ذكية","كفرات جوال","باور بانك","إكسسوارات جوال"],seasons:["إطلاق الأجهزة الجديدة (سبتمبر)","الجمعة البيضاء","رمضان والعيد","العودة للمدارس","اليوم الوطني"],content:["فتح صندوق","مقارنة جهازين","اختبار الكاميرا والبطارية","نصايح قبل الشراء","أفضل جوال بميزانية معينة"],inf:["مراجعين تقنية","صناع محتوى ألعاب","يوتيوبرز تقنية على تيك توك"],ads:["سعر منافس وضمان","تقسيط بدون فوائد","توصيل سريع","باقات جهاز + إكسسوار"]},
"أجهزة منزلية ومطبخ":{aud:"ربات بيوت وأسر وعرسان جدد 25–50",kw:["أجهزة منزلية","أدوات مطبخ","قلاية هوائية","خلاط","مكنسة كهربائية","أواني طبخ","ماكينة قهوة","أجهزة كهربائية بالتقسيط","مستلزمات المطبخ","ثلاجات"],seasons:["رمضان (المطبخ)","موسم الأعراس وتجهيز البيت","الجمعة البيضاء","الصيف (المكيفات والمراوح)"],content:["طبخة سريعة بالجهاز","قبل وبعد التنظيف","مقارنة موديلات","نصايح استخدام","تجهيز مطبخ العروسة"],inf:["مؤثرات طبخ","صانعات محتوى تنظيم البيت","أسر سعودية"],ads:["يوفر وقتك","ضمان وصيانة","تقسيط","عروض رمضان"]},
"أثاث وديكور":{aud:"أسر وعرسان جدد وأصحاب الشقق 25–50",kw:["أثاث منزلي","كنب مودرن","غرف نوم","ديكورات منزلية","سجاد","إضاءة ديكور","طاولات","مفارش","ستائر","أثاث بالتقسيط"],seasons:["موسم الأعراس","رمضان والعيد (تجديد المجالس)","الجمعة البيضاء","الشتاء"],content:["قبل وبعد تنسيق الغرفة","أفكار ديكور بميزانية","جولة في المعرض","تنسيق الألوان","تجارب العملاء في بيوتهم"],inf:["مؤثرات ديكور منزلي","مصممين داخليين","صناع محتوى عرسان"],ads:["جودة الخامات","تركيب وتوصيل","تقسيط","تشكيلة جديدة"]},
"هدايا وورود":{aud:"رجال ونساء 20–45 يشترون هدايا للمناسبات",kw:["ورد","توصيل ورد","بوكيه ورد","هدايا","هدايا تخرج","هدايا مواليد","تنسيق هدايا","هدايا رجالية","ورد طبيعي","هدايا اليوم الوطني"],seasons:["التخرج","المواليد","اليوم الوطني","رمضان والعيد","يوم الأم","الأعراس"],content:["تجهيز البوكيه","ردة فعل المهداة","أفكار هدايا لكل مناسبة","التغليف","سرعة التوصيل نفس اليوم"],inf:["صناع محتوى لايف ستايل","مؤثرات مناسبات"],ads:["توصيل نفس اليوم","بطاقة باسمك","تنسيق فاخر","هدية لكل مناسبة"]},
"تمور وقهوة وأغذية":{aud:"أسر وشركات وعشاق القهوة 25–55",kw:["تمور فاخرة","تمر سكري","قهوة عربية","قهوة مختصة","هيل","بن","علب تمور هدايا","عسل طبيعي","منتجات عضوية","دلة"],seasons:["رمضان (أعلى موسم)","عيد الفطر","الحج والعمرة","الشتاء","اليوم الوطني","هدايا الشركات"],content:["طريقة تحضير القهوة","تذوق أنواع التمور","مصدر المنتج والمزرعة","علب الهدايا","سفرة رمضان"],inf:["مؤثرات طبخ وضيافة","صناع محتوى قهوة","أسر سعودية"],ads:["طازج من المزرعة","مثالي للضيافة","علب هدايا للشركات","عروض رمضان"],note:"الالتزام بضوابط هيئة الغذاء والدواء في الادعاءات الصحية"},
"حلويات وشوكولاتة":{aud:"نساء ورجال 20–45 ومنظمي مناسبات",kw:["شوكولاتة فاخرة","حلويات","توزيعات مناسبات","كيك","حلا","شوكولاتة هدايا","توزيعات مواليد","تمر بالشوكولاتة","بوكس حلويات","حلويات عيد"],seasons:["رمضان والعيد","المواليد والتخرج","الأعراس","اليوم الوطني"],content:["لقطات الصنع","تغليف التوزيعات","تذوق وردود فعل","أفكار للمناسبات","كواليس المطبخ"],inf:["مؤثرات طبخ وحلويات","صانعات محتوى مناسبات"],ads:["صنع يومي طازج","تغليف بالاسم","توصيل للمناسبات","طلبات خاصة"],note:"الالتزام بضوابط هيئة الغذاء والدواء"},
"أطفال وألعاب":{aud:"أمهات وآباء 25–45",kw:["ألعاب أطفال","ألعاب تعليمية","ألعاب ذكاء","ملابس أطفال","مستلزمات مواليد","عربيات أطفال","هدايا أطفال","ألعاب مونتيسوري","ألعاب خارجية","ألعاب حسب العمر"],seasons:["العودة للمدارس","الإجازات","رمضان والعيد","المواليد","الجمعة البيضاء"],content:["الطفل وهو يلعب","فايدة اللعبة لعمر معين","أفكار لعب بالبيت","فتح الصندوق","نصايح أمهات"],inf:["أمهات مؤثرات","صناع محتوى عائلي","مختصين تربية"],ads:["آمنة وتعليمية","مناسبة لعمر طفلك","هدية العيد","توصيل سريع"]},
"رياضة ومكملات":{aud:"رجال ونساء 18–40 مهتمين باللياقة",kw:["مكملات غذائية","بروتين","كرياتين","أدوات رياضية","ملابس رياضية","فيتامينات","أوزان منزلية","تنشيف","مكملات طبيعية","جيم منزلي"],seasons:["بداية السنة","الصيف","رمضان (رياضة بعد الفطور)","الجمعة البيضاء"],content:["تمارين قصيرة","تحول قبل وبعد","طريقة الاستخدام","روتين يومي","أسئلة شائعة عن المكملات"],inf:["مدربين لياقة","صناع محتوى جيم","مؤثرات لياقة"],ads:["أصلي من مصدر موثوق","نتيجة مع التمرين","توصيل سريع","باقات توفير"],note:"الالتزام بضوابط هيئة الغذاء والدواء وعدم الادعاءات العلاجية"},
"صيدلية ومنتجات صحية":{aud:"أسر ونساء ورجال 25–55",kw:["صيدلية أونلاين","فيتامينات","منتجات عناية","مستلزمات طبية","مكملات","منتجات أطفال","عناية بالشعر","واقي شمس طبي","أجهزة قياس","توصيل أدوية"],seasons:["الشتاء (المناعة)","الصيف (الحماية من الشمس)","رمضان","العودة للمدارس"],content:["نصايح صحية من صيدلي","طريقة الاستخدام الصحيحة","أسئلة شائعة","مقارنة منتجات","روتين عناية"],inf:["صيادلة وأطباء صناع محتوى","مؤثرات صحة ولايف ستايل"],ads:["منتجات أصلية مرخصة","استشارة صيدلي","توصيل سريع","عروض الباقات"],note:"الالتزام الصارم بضوابط هيئة الغذاء والدواء في إعلانات المنتجات الصحية"},
"حيوانات أليفة":{aud:"مربي القطط والكلاب والطيور 18–45",kw:["أكل قطط","مستلزمات قطط","رمل قطط","أكل كلاب","ألعاب حيوانات","مستلزمات طيور","عيادة بيطرية","فيتامينات للقطط","أقفاص","إكسسوارات حيوانات"],seasons:["الشتاء","الصيف","الجمعة البيضاء","موسم السفر (الإيواء)"],content:["القطط وهي تجرب الأكل","نصايح العناية","قبل وبعد الاستحمام","أسئلة بيطرية شائعة","فتح الطلب"],inf:["صناع محتوى حيوانات أليفة","أطباء بيطريين"],ads:["أكل صحي لحيوانك","توصيل سريع","اشتراك شهري","ماركات أصلية"]},
"منتجات رقمية واشتراكات":{aud:"شباب 18–35 وأصحاب أعمال",kw:["اشتراكات","بطاقات شحن","بطاقات ألعاب","اشتراك نتفلكس","دورات أونلاين","قوالب","برامج","بطاقات آيتونز","شحن ألعاب","تصاميم جاهزة"],seasons:["الإجازات","الجمعة البيضاء","رمضان","إطلاق الألعاب الجديدة"],content:["طريقة الشراء والتفعيل","مقارنة الباقات","مراجعات العملاء","أسئلة شائعة","عروض محدودة"],inf:["صناع محتوى ألعاب","مؤثرين تقنية"],ads:["تسليم فوري","أسعار منافسة","دفع آمن","دعم سريع"]},
"سيارات وإكسسواراتها":{aud:"رجال 20–50 ومهتمين بالسيارات",kw:["إكسسوارات سيارات","قطع غيار","زيوت سيارات","تلميع سيارات","معطر سيارات","كاميرا سيارة","شاشات سيارات","تظليل","فرش سيارات","عناية بالسيارة"],seasons:["الصيف","الإجازات والسفر","اليوم الوطني","الجمعة البيضاء"],content:["قبل وبعد التلميع","تركيب القطعة","مقارنة منتجات","نصايح صيانة","تعديلات السيارة"],inf:["صناع محتوى سيارات","مراجعين سيارات"],ads:["تركيب سهل","جودة من مصدر موثوق","توصيل لكل المدن","عروض الصيف"]}
};
const CATS = ["عطور وبخور","عبايات وأزياء نسائية","أزياء رجالية","تجميل وعناية بالبشرة","إكسسوارات ومجوهرات","شنط وأحذية","جوالات وإلكترونيات","أجهزة منزلية ومطبخ","أثاث وديكور","هدايا وورود","تمور وقهوة وأغذية","حلويات وشوكولاتة","أطفال وألعاب","رياضة ومكملات","صيدلية ومنتجات صحية","حيوانات أليفة","منتجات رقمية واشتراكات","سيارات وإكسسواراتها"];

/* ---------- small helpers ---------- */
const store = {
  get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,v)}catch(e){}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
const $ = s=>document.querySelector(s);
const el = (tag, attrs={}, ...kids)=>{
  const n=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(v===false||v==null) continue;
    if(k==="class") n.className=v; else if(k==="text") n.textContent=v; else n.setAttribute(k,v===true?"":v);
  }
  for(const k of kids){ if(k==null||k===false) continue; n.append(k.nodeType?k:document.createTextNode(String(k))); }
  return n;
};
const esc = s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmtNum = n=>Number(n).toLocaleString("en-US",{maximumFractionDigits:2});
function adsCount(n){ if(n===1) return "إعلان واحد"; if(n===2) return "إعلانان"; if(n>=3&&n<=10) return `${n} إعلانات`; return `${n} إعلانًا`; }
function todayTxt(){ try{ return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"}).format(new Date()); }catch(e){ return new Date().toISOString().slice(0,10); } }
function monthsFromNext(n){ const d=new Date(); const out=[]; for(let i=1;i<=n;i++){ const m=(d.getMonth()+i)%12; out.push(AR_MONTHS[m]); } return out; }
function normUrl(u){ if(!u) return ""; let s=u.trim(); if(!/^https?:\/\//i.test(s)) s="https://"+s; try{ const x=new URL(s); if(!/\./.test(x.hostname)) return ""; return x.href.replace(/\/$/,""); }catch(e){ return ""; } }
function hostLabel(u){
  try{ const x=new URL(normUrl(u)); const host=x.hostname.replace(/^www\./,"");
    if(/^salla\.(sa|com)$|^zid\.store$/.test(host)) return decodeURIComponent(x.pathname.split("/").filter(Boolean)[0]||host);
    return host.split(".")[0]; }catch(e){ return ""; }
}
function hostOf(u){ try{ return new URL(normUrl(u)).hostname.replace(/^www\./,""); }catch(e){ return ""; } }
function status(text,kind){ const s=$("#status"); if(!text){s.hidden=true;return;} s.className="status"+(kind?" "+kind:""); s.textContent=text; s.hidden=false; }
function saveBlob(blob,name){ const href=URL.createObjectURL(blob); const a=el("a",{href,download:name}); document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(href),60000); }
const libCache={};
function loadScript(src){ if(!libCache[src]) libCache[src]=new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>{delete libCache[src];rej(new Error(src))};document.head.append(s);}); return libCache[src]; }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* =====================================================================
   TEMPLATES — each one is the original plan file. Config says which parts
   belong to which service, where the price section goes, and how to print.
   ===================================================================== */
const svcRemove=(doc,sel)=>doc.querySelectorAll(sel).forEach(n=>n.remove());
const rowsByLabel=(doc,label)=>[...doc.querySelectorAll(".month li")].filter(li=>{const s=li.querySelector("span");return s&&s.textContent.trim()===label;});
const priceBits=c=>({was:c.hasDisc?fmtNum(c.was):"",now:fmtNum(c.price),save:c.hasDisc?fmtNum(c.was-c.price):""});

const TEMPLATES = [
 { id:"sahl22", view:940, kind:"plan", name:"بروفايل شراع الأزرق", note:"22 صفحة A4 · كحلي وأزرق",
   origin:"خطة شاملة لمتجر عبايات (منى عباية، mona-abaya.com) لمدة 3 أشهر", originNames:["mona-abaya.com","https://mona-abaya.com/","منى عباية"],
   paged:{sel:".page"}, width:794,
   sections:[{sel:'[data-sec="seo"]',any:["seo"]},{sel:'[data-sec="social"]',any:["social"]},{sel:'[data-sec="content"]',any:["social","design"]},{sel:'[data-sec="ads"]',any:["ads"]},{sel:'[data-sec="influencers"]',any:["influencers"]}],
   post(doc){ let i=0; doc.querySelectorAll(".toc .it").forEach(it=>{ i++; const n=String(i).padStart(2,"0"); it.querySelector(".secno").textContent=n;
       doc.querySelectorAll(`.page[data-sec="${it.dataset.sec}"] .secno-ar`).forEach(x=>x.textContent=AR_DIG(n)); });
     let p=1; doc.querySelectorAll(".page").forEach(pg=>{ const n=pg.querySelector(".pn"); p++; if(n) n.textContent=String(p-1).padStart(2,"0"); }); },
   price(doc,c){ const b=priceBits(c); const pages=doc.querySelectorAll(".page"); const last=pages[pages.length-1];
     last.insertAdjacentHTML("beforebegin",`<section class="page" data-sahl="invest"><div class="ph"><div class="t"><small>الاستثمار</small><h2>الاستثمار وطرق الدفع</h2><p>باقة ${esc(c.durTxt)} تشمل ${esc(c.svcTxt)}</p></div><img src="${LOGO_LIGHT}" alt=""></div>
       <div class="price">${b.was?`<div class="was">بدلًا من <s>${b.was} ريال</s></div>`:""}<div class="now">${b.now}<small>ريال</small></div>${b.save?`<span class="save">توفير ${b.save} ريال</span>`:""}</div>
       <div class="card"><h3>طرق الدفع</h3><div class="pay"><span>الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</span></div></div>
       <div class="card"><h3>ما يشمله السعر</h3><ul><li>جميع الخدمات المذكورة في هذه الخطة طوال مدة الباقة (${esc(c.durTxt)})</li><li>تقارير دورية واجتماعات متابعة مع مدير الحساب</li></ul></div><div class="pn"></div></section>`); },
   pdfCss:"body{padding:0!important;background:#0A0A0A!important}.page{margin:0 auto!important}" },

 { id:"route6", kind:"plan", name:"أزرق ليلي · 6 أشهر وتوقع أرباح", note:"شهر بشهر لكل خدمة · جدول أرباح وحاسبة",
   origin:"خطة تسويق 6 أشهر لمتجر قهوة مختصة (Mocco) مع توقع أرباح وحاسبة", originNames:["Mocco"],
   width:1100,
   durTrim(doc,N){ const box=doc.getElementById("months"); if(!box) return; const cards=[...box.querySelectorAll(".card.month")];
     if(N<cards.length) cards.slice(N).forEach(n=>n.remove());
     else for(let i=cards.length;i<Math.min(N,12);i++){ const cl=cards[3+((i-6)%3)].cloneNode(true); cl.setAttribute("data-m",String(i+1)); const h=cl.querySelector("h3"); if(h&&h.firstChild&&h.firstChild.nodeType===3) h.firstChild.data="الشهر "+(ORD_F[i]||(i+1))+" "; box.append(cl); } },
   infTrim(doc,N){ const box=doc.getElementById("infList"); if(!box) return; const it=[...box.querySelectorAll(".influencer-item")];
     if(N<it.length) it.slice(N).forEach(n=>n.remove());
     else for(let i=it.length;i<Math.min(N,12);i++){ const cl=it[it.length-1].cloneNode(true); if(cl.firstChild&&cl.firstChild.nodeType===3) cl.firstChild.data="المشهور "+(i+1)+" "; const sm=cl.querySelector("small"); if(sm) sm.textContent=sm.textContent.replace(/^[^·]*/,"الشهر "+(ORD_F[i%12]||(i+1))+" "); box.append(cl); } },
   scriptPrep(js,d){ const N=Math.min(12,Math.max(1,(d&&d.dur)||6)); return js.replace("var MONTHS=6;","var MONTHS="+N+";"); },
   numbers:[{re:/var SCN=(\{[^;]*\});/, hint:"سيناريوهات low متحفظ/mid متوقع/high متفائل لكل شهر: aov متوسط قيمة الطلب بالريال، margin هامش الربح %، visits زيارات الشهر الأول، growth نمو الزيارات الشهري %، cr معدل التحويل % في الشهر الأول، crStep زيادة التحويل كل شهر، cost تكلفة التسويق الشهرية بالريال"}],
   sections:[{sel:'[data-sec="seo"]',any:["seo"]},{sel:'[data-sec="social"]',any:["social"]},{sel:'[data-sec="ads"]',any:["ads"]},{sel:'[data-sec="influencers"]',any:["influencers"]},{sel:'[data-sec="design"]',any:["design"]}],
   post(doc){ let i=1; doc.querySelectorAll(".section-title .num").forEach(n=>{ n.textContent=String(i++).padStart(2,"0"); }); },
   price(doc,c){ const b=priceBits(c); const at=doc.querySelector(".container > .note")||doc.querySelector(".container > .footer");
     at.insertAdjacentHTML("beforebegin",`<div data-sahl="invest"><div class="section-title"><span class="num"></span> الاستثمار وطريقة الدفع</div><div class="wrap card" style="padding:24px">
       <p style="margin:0 0 10px">باقة ${esc(c.durTxt)} تشمل ${esc(c.svcTxt)}.</p>${b.was?`<p style="margin:0;opacity:.75">بدلًا من <s>${b.was} ر.س</s></p>`:""}<p style="font-size:32px;font-weight:900;margin:6px 0">${b.now} ر.س</p>${b.save?`<p style="margin:0;color:#2F8BD8;font-weight:700">توفير ${b.save} ر.س</p>`:""}
       <p style="margin:12px 0 0">الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</p></div></div>`);
     let i=1; doc.querySelectorAll(".section-title .num").forEach(n=>{ n.textContent=String(i++).padStart(2,"0"); }); },
   pdfCss:".scenario-btn{pointer-events:none}" },

 { id:"cozy", kind:"plan", name:"تحريري أزرق", note:"تشخيص وكلمات ومحتوى ومؤثرين",
   origin:"خطة تسويقية شاملة لمتجر كوزي للتيشرتات القطنية (koziksa.com)", originNames:["koziksa.com","متجر كوزي","كوزي"],
   width:1000,
   sections:[{sel:'#seo, .hero-meta .chip:nth-child(1)',any:["seo"]},{sel:"#social",any:["social","ads"]},{sel:"#social .sub:not(:last-of-type), .hero-meta .chip:nth-child(2)",any:["social"]},{sel:"#social .sub:last-of-type",any:["ads"]},{sel:'#influencers, .hero-meta .chip:nth-child(3)',any:["influencers"]}],
   post(doc){ let i=0; doc.querySelectorAll(".section-num").forEach(n=>{ n.textContent="القسم "+(ORD[i++]||""); }); },
   price(doc,c){ const b=priceBits(c); const cl=doc.querySelector("section.closing");
     cl.insertAdjacentHTML("beforebegin",`<section id="invest" data-sahl="invest"><div class="section-head"><span class="section-num"></span><h2>الاستثمار وطريقة الدفع</h2><p>باقة ${esc(c.durTxt)} تشمل ${esc(c.svcTxt)}.</p></div>
       <div class="audit-grid"><div class="audit-item"><h3>قيمة الباقة</h3>${b.was?`<p class="now">بدلًا من <s>${b.was} ريال</s></p>`:""}<p class="opp" style="font-size:30px;font-family:var(--font-display)"><b>${b.now} ريال</b></p>${b.save?`<p class="now">توفير ${b.save} ريال</p>`:""}</div>
       <div class="audit-item"><h3>طرق الدفع</h3><p class="now">الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</p></div></div></section>`);
     let i=0; doc.querySelectorAll(".section-num").forEach(n=>{ n.textContent="القسم "+(ORD[i++]||""); }); },
   pdfCss:"" },

 { id:"launch90", kind:"plan", name:"أبيض وأزرق · إطلاق 90 يوم", note:"إطلاق بالأيام · سيناريوهات ومنحنى أرباح",
   origin:"خطة إطلاق 90 يومًا لمتجر شنط وإكسسوارات ومستحضرات تجميل وزيوت شعر (World of Beauty، salla.sa/world-of-beauty2030) مع سيناريوهات أرباح", originNames:["salla.sa/world-of-beauty2030","world.of.beauty2030","World of Beauty","WORLD OF BEAUTY"],
   width:1100,
   infTrim(doc,N){ const ph=infPhrase(N), the=N===1?"المشهور":"المشاهير ("+N+")";
     const w=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())){ const p=n.parentNode&&n.parentNode.nodeName; if(p==="STYLE"||p==="SCRIPT") continue; const t=n.data.split("و4 مشاهير").join("و"+ph).split("4 مشاهير").join(ph).split("المشاهير الأربعة").join(the); if(t!==n.data) n.data=t; }
     doc.querySelectorAll("script:not([src])").forEach(sc=>{ sc.textContent=sc.textContent.split("المشاهير الأربعة").join(the).replace("function sum(a)",launchCelebs(N)+"\nfunction sum(a)"); }); },
   scriptPrep(js,d){ const N=Math.min(12,Math.max(1,(d&&d.dur)||3)), MN=monthsFromNext(N);
     return js.replace("var M=3;var MN=['نوفمبر','ديسمبر','يناير'];var PL='90 يوماً';","var M="+N+";var MN="+JSON.stringify(MN)+";var PL="+JSON.stringify(DUR_DAYS[N])+";")
       .split("'نوفمبر · ").join("'"+MN[0]+" · ").split("'ديسمبر'").join("'"+MN[Math.min(1,N-1)]+"'"); },
   durTrim(doc,N){ N=Math.min(12,Math.max(1,N)); const MN=monthsFromNext(N), PH=launchPhases(N);
     const mLbl=([a,b])=>a===b?"الشهر "+a:"الشهر "+a+"–"+b, nLbl=([a,b])=>a===b?MN[a-1]:MN[a-1]+" – "+MN[b-1], sLbl=([a,b])=>a===b?"شهر "+a:"شهر "+a+"–"+b;
     const lb=doc.getElementById("lbl"); if(lb) lb.innerHTML=MN.map((m,i)=>`<div>الشهر ${i+1} · ${m}</div>`).join(""); if(lb&&N>6) lb.style.gap="10px";
     doc.querySelectorAll(".m").forEach(box=>{ const cards=[...box.children].filter(c=>c.querySelector(".tag")); cards.forEach((c,i)=>{ if(i>=PH.length){ c.remove(); return; } const t=c.querySelector(".tag"), x=t.textContent.trim();
       if(/^الشهر \d+$/.test(x)) t.textContent=mLbl(PH[i]); else if(/^(نوفمبر|ديسمبر|يناير)$/.test(x)) t.textContent=nLbl(PH[i]); }); });
     doc.querySelectorAll("table").forEach(tb=>{ const hr=tb.querySelector("tr"); if(!hr) return; const cols=[...hr.children].map((c,i)=>[i,c.textContent.trim()]).filter(([,t])=>/^الشهر [123]$/.test(t)); if(cols.length!==3) return;
       const kill=[]; cols.forEach(([ci],k)=>{ if(k>=PH.length) kill.push(ci); else hr.children[ci].textContent=mLbl(PH[k]); });
       kill.sort((a,b)=>b-a).forEach(ci=>tb.querySelectorAll("tr").forEach(r=>{ if(r.children[ci]) r.children[ci].remove(); })); });
     doc.querySelectorAll("td").forEach(td=>{ const m=/^شهر ([23])$/.exec(td.textContent.trim()); if(!m||td.cellIndex!==0) return; const k=+m[1]-2; const TP=N<=3?Array.from({length:N-1},(_,i)=>[i+2,i+2]):(()=>{ const h=Math.ceil((N-1)/2); return [[2,1+h],[2+h,N]]; })(); if(k>=TP.length) td.parentNode.remove(); else td.textContent=sLbl(TP[k]); }); },
   numbers:[{re:/var D=(\{[^;]*\});/, hint:"سيناريوهات c متحفظ/b الهدف/o متفائل: s معامل السيناريو، o الطلبات لكل شهر، r المبيعات بالريال لكل شهر، n صافي الربح بالريال لكل شهر (اكتب 3 قيم لأول 3 شهور، والأداة بتمدها لباقي مدة الخطة)"}],
   sections:[{sel:'[data-sec="seo"]',any:["seo"]},{sel:'[data-sec="social"]',any:["social"]},{sel:'[data-sec="ads"]',any:["ads"]},{sel:'[data-sec="influencers"]',any:["influencers"]},{sel:'[data-sec="design"]',any:["design"]}],
   post(doc){ let i=1; doc.querySelectorAll("main > section > .sn").forEach(n=>{ n.textContent=String(i++).padStart(2,"0"); }); },
   price(doc,c){ const b=priceBits(c); const m=doc.querySelector("main");
     m.insertAdjacentHTML("beforeend",`<section data-sahl="invest"><span class="sn"></span><h2>الاستثمار وطريقة الدفع</h2><p class="sub">باقة ${esc(c.durTxt)} تشمل ${esc(c.svcTxt)}</p>
       <div class="grid g3" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))"><div class="card"><h3>قيمة الباقة</h3>${b.was?`<p>بدلًا من <s>${b.was} ر.س</s></p>`:""}<p style="font-size:30px;font-weight:900;margin:6px 0">${b.now} ر.س</p>${b.save?`<p style="color:var(--ok);font-weight:700">توفير ${b.save} ر.س</p>`:""}</div>
       <div class="card"><h3>طرق الدفع</h3><p>الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</p></div></div></section>`);
     let i=1; doc.querySelectorAll("main > section > .sn").forEach(n=>{ n.textContent=String(i++).padStart(2,"0"); }); },
   pdfCss:".themebtn,.tabs{display:none!important}" },

 { id:"etqan_gold", kind:"plan", name:"أسود وأزرق · خدمات بالتفصيل", note:"كل خدمة بتفاصيلها ومراحلها وقياسها",
   origin:"ملف خدمات تسويقية تفصيلي لـ 8 خدمات (كان باسم وكالة أخرى)", originNames:[],
   width:1180, etqan:true,
   sections:[{sel:'#s-seo, a[href="#s-seo"]',any:["seo"]},{sel:'#s-social, a[href="#s-social"]',any:["social"]},{sel:'#s-ads, a[href="#s-ads"]',any:["ads"]},{sel:'#s-content, #s-brand, a[href="#s-content"], a[href="#s-brand"]',any:["design"]}],
   prep: etqanPrep, price: etqanPrice,
   pdfCss:".nav,.idx,.fab,.burger,#prt,.hero .cta{display:none!important}.panel{display:block!important}.tabs{display:none!important}.rv{opacity:1!important;transform:none!important}.orb{animation:none!important}" },

 { id:"etqan_green", kind:"plan", name:"كحلي · خدمات بالتفصيل", note:"نفس التفاصيل بالكحلي",
   origin:"ملف خدمات تسويقية تفصيلي لـ 8 خدمات (كان باسم وكالة أخرى)", originNames:[],
   width:1180, etqan:true,
   sections:[{sel:'#s-seo, a[href="#s-seo"]',any:["seo"]},{sel:'#s-social, a[href="#s-social"]',any:["social"]},{sel:'#s-ads, a[href="#s-ads"]',any:["ads"]},{sel:'#s-content, #s-brand, a[href="#s-content"], a[href="#s-brand"]',any:["design"]}],
   prep: etqanPrep, price: etqanPrice,
   pdfCss:".nav,.idx,.fab,.burger,#prt,.hero .cta{display:none!important}.panel{display:block!important}.tabs{display:none!important}.rv{opacity:1!important;transform:none!important}.orb{animation:none!important}" },

 { id:"proposal", view:1400, kind:"plan", name:"عرض كريمي وأزرق", note:"9 شرائح عرضية",
   origin:"عرض تسويقي متكامل عام (بدون متجر محدد)", originNames:["عميلنا الكريم"],
   paged:{sel:".slide"}, width:1280,
   sections:[{sel:'[data-sec="seo"]',any:["seo"]},{sel:'[data-sec="social"]',any:["social"]},{sel:'[data-sec="ads"]',any:["ads"]},{sel:'[data-sec="influencers"]',any:["influencers"]}],
   post(doc){ let i=0; doc.querySelectorAll("[data-sec] .kick").forEach(k=>{ k.textContent="الخدمة "+(["الأولى","الثانية","الثالثة","الرابعة"][i++]||""); });
     let p=1; doc.querySelectorAll(".slide").forEach(s=>{ const n=s.querySelector(".pno"); p++; if(n) n.textContent=String(p-1).padStart(2,"0"); }); },
   price(doc,c){ const b=priceBits(c); const sl=doc.querySelectorAll(".slide"); sl[sl.length-1].insertAdjacentHTML("beforebegin",`<section class="slide dark" data-sahl="invest"><span class="kick">الاستثمار</span><h2>الاستثمار وطريقة الدفع</h2><p class="lead">باقة ${esc(c.durTxt)} تشمل ${esc(c.svcTxt)}.</p>
     <div class="price"><div class="box">${b.was?`<div class="was">بدلًا من <s>${b.was} ريال</s></div>`:""}<div class="now">${b.now} <small>ريال</small></div>${b.save?`<span class="save">توفير ${b.save} ريال</span>`:""}</div>
     <div class="side"><b style="color:#fff;font-size:18px">طرق الدفع</b><span>الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</span></div></div><span class="pno"></span></section>`); },
   pdfCss:"body{padding:0!important}.slide{margin:0 auto!important}" },

 { id:"ipc", view:640, kind:"app", name:"خطة تطبيق · أزرق ملكي", note:"7 صفحات بمقاس الموبايل",
   origin:"خطة تنفيذية لتطوير تطبيق جوال لمتجر عطور (IPC PERFUMES، ipcperfumes.com، المركز الدولي للعطور والتجميل)", originNames:["ipcperfumes.com","IPC PERFUMES","IPC","المركز الدولي للعطور والتجميل"],
   paged:{sel:".page"}, width:600,
   prep(doc){ const st=doc.createElement("style"); st.textContent=".brand-name,.brand-mark{letter-spacing:0!important}"; doc.head.append(st); },
   price(doc,c){ const b=priceBits(c); const pg=doc.querySelectorAll(".page"); pg[pg.length-1].insertAdjacentHTML("beforebegin",`<section class="page" data-sahl="invest"><div class="page-head"><div class="phase-chip">﷼</div><div class="titles"><div class="kicker">الاستثمار</div><h2>تكلفة التطبيق<br>وطرق الدفع</h2></div></div>
     <div class="roi"><div class="metric">قيمة المشروع</div><div class="vs">${b.was?`<div class="col"><div class="lab">قبل الخصم</div><div class="val"><s>${b.was}</s><span class="unit"> ر.س</span></div></div>`:""}<div class="col app"><div class="lab">السعر</div><div class="val">${b.now}<span class="unit"> ر.س</span></div></div></div>${b.save?`<div class="note">توفير ${b.save} ر.س</div>`:""}</div>
     <div class="card accent"><h3><span class="dot"></span>طرق الدفع</h3><p>الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</p></div>
     <div class="foot"><span class="b">${esc(COMPANY)}</span><span>الاستثمار</span></div></section>`); },
   pdfCss:":root{--page-w:130mm!important;--pad-x:9mm!important;--pad-y:12mm!important}html,body{font-size:11.5pt!important}body{padding:0!important;background:#0b0f17!important}.page{width:130mm!important;max-width:130mm!important;min-height:230mm!important;height:auto!important;border-radius:0!important;margin:0!important;border:0!important;box-shadow:none!important}.page::after{border-radius:0!important}" },

 { id:"luxellia", view:1400, kind:"app", name:"خطة تطبيق · فاخر عرضي", note:"9 شرائح عرضية",
   origin:"خطة تطبيق جوال خاص لبراند أزياء فاخر (Luxellia Nada) مع برنامج VIP", originNames:["Luxellia Nada","LUXELLIA NADA","LUXELLIA","Luxellia"],
   paged:{sel:".slide"}, width:1280,
   price(doc,c){ const b=priceBits(c); const sl=doc.querySelectorAll(".slide"); sl[sl.length-1].insertAdjacentHTML("beforebegin",`<section class="slide light" data-sahl="invest"><span class="kick">٠٦ · الاستثمار</span><h2>تكلفة التطبيق وطرق الدفع</h2>
     <div class="pr"><div class="bx">${b.was?`<div class="was">بدلًا من <s>${b.was} ريال</s></div>`:""}<div class="now">${b.now} <small>ريال</small></div>${b.save?`<span class="save">توفير ${b.save} ريال</span>`:""}</div>
     <div class="side"><b>طرق الدفع</b><span>الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</span></div></div><div class="brandline"></div></section>`); },
   pdfCss:"body{padding:0!important}.slide{margin:0 auto!important}" }
];
// extra celebrity profiles for launch90 when more than its original 4 are chosen (each one different, spread over the plan months)
const LAUNCH_XCE=[["ر","المراجِعة","مراجِعة منتجات وتجارب (320K)","تيك توك + يوتيوب",320,"مراجعة صادقة لأكثر المنتجات طلبًا مع كود خصم"],
 ["ع","العائلية","مؤثرة عائلية ويوميات بيت (500K)","سناب + إنستغرام",500,"يوميات استخدام المنتجات في البيت ومع العائلة"],
 ["د","الهدايا","صانعة محتوى هدايا ومناسبات (300K)","إنستغرام + تيك توك",300,"أفكار هدايا من المتجر للمناسبات القادمة"],
 ["ل","اللايف ستايل","مؤثرة لايف ستايل (350K)","سناب + تيك توك",350,"المنتجات ضمن روتينها اليومي بشكل طبيعي"],
 ["ص","صانعة UGC","صانعة محتوى UGC (300K)","تيك توك",300,"فيديوهات تجربة قصيرة تُستخدم أيضًا في الإعلانات"],
 ["م","المحلية","مؤثرة محلية في مدينة المتجر (310K)","سناب",310,"زيارة وتجربة وعرض حصري لمتابعيها"],
 ["أ","الأناقة","مؤثرة أناقة وتنسيق (400K)","إنستغرام",400,"تنسيقات ولوكات بمنتجات المتجر"],
 ["ك","الكوميدية","صانعة محتوى خفيف (600K)","سناب + تيك توك",600,"محتوى خفيف وانتشار واسع بعرض محدود"]];
function launchCelebs(N){ N=Math.min(12,Math.max(1,N));
  return "CE=CE.slice(0,"+N+");var XCE="+JSON.stringify(LAUNCH_XCE)+";for(var _i=CE.length;_i<"+N+";_i++){var _a=XCE[(_i-4)%XCE.length];CE.push([_a[0],_a[1],_a[2],_a[3],_a[4],MN[Math.min(M-1,Math.floor(_i*M/"+N+"))],_a[5],Math.round(_a[4]*0.43)])}"; }
// splits a plan of N months into up to 3 phases ([from,to] month numbers); extra months go to the later phases
function launchPhases(N){ if(N<3) return Array.from({length:N},(_,i)=>[i+1,i+1]); const base=Math.floor(N/3), rem=N%3, sz=[base,base+(rem>=2?1:0),base+(rem>=1?1:0)]; let a=1; return sz.map(z=>{ const r=[a,a+z-1]; a+=z; return r; }); }
function etqanPrep(doc){
  doc.querySelectorAll(".fab, .ct-list").forEach(n=>n.remove());
  const f=doc.getElementById("lead"); if(f){ f.replaceChildren(); f.hidden=true; }
  const wm=doc.querySelector(".brand .wm"); if(wm) wm.innerHTML='<b>شراع</b><small>للتسويق الإلكتروني</small>';
  const br=doc.querySelector(".brand"); if(br) br.setAttribute("aria-label",COMPANY);
  doc.querySelectorAll("script").forEach(s=>{ s.textContent=s.textContent.replace(/var WA='\d+'/,"var WA=''"); });
}
function etqanPrice(doc,c){ const b=priceBits(c); const why=doc.getElementById("why");
  why.insertAdjacentHTML("beforebegin",`<section id="invest" data-sahl="invest"><div class="wrap"><div class="sh"><span class="tag">INVESTMENT</span><h2>الاستثمار <span class="gt">وطريقة الدفع</span></h2><p>باقة ${esc(c.durTxt)} تشمل ${esc(c.svcTxt)}.</p></div>
    <div class="g2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px"><div class="card" style="padding:26px">${b.was?`<p style="color:var(--mute)">بدلًا من <s>${b.was} ريال</s></p>`:""}<b class="gt" style="font-size:44px;font-weight:900;display:block;line-height:1.3">${b.now} ريال</b>${b.save?`<span style="color:var(--gold2);font-weight:700">توفير ${b.save} ريال</span>`:""}</div>
    <div class="card" style="padding:26px"><b style="font-size:19px;color:var(--gold2)">طرق الدفع</b><p style="color:var(--mute);margin-top:6px">الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد.</p></div></div></div></section>`); }
const TPL = Object.fromEntries(TEMPLATES.map(t=>[t.id,t]));

/* =====================================================================
   SEGMENTS: pull every visible sentence out of a template, rewrite, put back
   ===================================================================== */
const BLOCK_SEL="p,li,h1,h2,h3,h4,h5,h6,td,th,dt,dd,summary,label,button,option,title,figcaption,blockquote,caption,div,section,header,footer,article,aside,nav,main,a,form";
const SKIP_PARENTS=new Set(["SCRIPT","STYLE","NOSCRIPT","TEXTAREA"]);
const MONTH_SET=new Set(AR_MONTHS);
function extractSegments(doc, tpl){
  const groups=[]; const byEl=new Map();
  const walker=doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_TEXT);
  let n;
  while((n=walker.nextNode())){
    const t=n.data; if(!/\p{L}/u.test(t) || t.trim().length<2) continue;
    let p=n.parentNode, skip=false;
    for(let a=p;a&&a.nodeType===1;a=a.parentNode){ if(SKIP_PARENTS.has(a.nodeName)){skip=true;break;} }
    if(skip) continue;
    const blk=p.closest?p.closest(BLOCK_SEL):p;
    let g=byEl.get(blk);
    if(!g){ g={id:"g"+groups.length,segs:[],nodes:[],kind:"text"}; groups.push(g); byEl.set(blk,g); }
    g.segs.push(t.trim()); g.nodes.push(n);
  }
  // Arabic string literals inside inline scripts (labels that scripts render at runtime)
  doc.querySelectorAll("script:not([src])").forEach(s=>{
    for(const t of jsStrings(s.textContent)){
      if(!/[\u0600-\u06FF]/.test(t.raw)) continue;
      let val; try{ val=Function('"use strict";return '+t.q+t.raw+t.q)(); }catch(e){ continue; }
      if(MONTH_SET.has(val.trim())) continue;
      // keep HTML markup inside the string fixed; only the visible text pieces get rewritten
      const parts=val.split(/(<[^<>]*>|^[^<>]*>|<[^<>]*$)/).filter(x=>x!=="");
      const idx=parts.map((x,k)=>(!/^</.test(x)&&!/>$/.test(x)&&/[\u0600-\u06FF]/.test(x))?k:-1).filter(k=>k>=0);
      if(!idx.length) continue;
      groups.push({id:"g"+groups.length,segs:idx.map(k=>parts[k].trim()),kind:"js",parts,idx,script:s,start:t.start,end:t.end,quote:t.q});
    }
  });
  // numeric model objects (templates with calculators)
  (tpl.numbers||[]).forEach(nb=>{
    doc.querySelectorAll("script:not([src])").forEach(s=>{
      const m=s.textContent.match(nb.re); if(!m) return;
      groups.push({id:"g"+groups.length,segs:[m[1]],kind:"num",script:s,re:nb.re,hint:nb.hint});
    });
  });
  return groups;
}
function jsStrings(js){
  // tiny JS scanner: returns string literals ('..' / "..") with offsets; skips comments, regex and template literals
  const out=[]; let i=0, prev=""; const n=js.length;
  while(i<n){
    const ch=js[i];
    if(ch==="/" && js[i+1]==="/"){ const e=js.indexOf("\n",i); i=e<0?n:e; continue; }
    if(ch==="/" && js[i+1]==="*"){ const e=js.indexOf("*/",i+2); i=e<0?n:e+2; continue; }
    if(ch==="'"||ch==='"'){
      let j=i+1; while(j<n && js[j]!==ch){ if(js[j]==="\\") j++; else if(js[j]==="\n") break; j++; }
      out.push({q:ch,raw:js.slice(i+1,j),start:i,end:j+1}); i=j+1; prev="a"; continue;
    }
    if(ch==="`"){ let j=i+1, depth=0; while(j<n){ if(js[j]==="\\"){j+=2;continue;} if(depth===0&&js[j]==="`") break; if(js[j]==="$"&&js[j+1]==="{"){depth++;j+=2;continue;} if(depth&&js[j]==="}"){depth--;} j++; } i=j+1; prev="a"; continue; }
    if(ch==="/" && (prev===""||/[(,=:[!&|?{};+\-*%<>~^]/.test(prev))){
      let j=i+1, cls=false; while(j<n){ const c=js[j]; if(c==="\\"){j+=2;continue;} if(c==="[") cls=true; else if(c==="]") cls=false; else if(c==="/"&&!cls) break; else if(c==="\n") break; j++; }
      i=j+1; while(i<n && /[a-z]/i.test(js[i])) i++; prev="a"; continue;
    }
    if(!/\s/.test(ch)) prev=/[\w$)\]]/.test(ch)?"a":ch;
    i++;
  }
  return out;
}
function applySegments(doc, groups, out){
  // text nodes
  for(const g of groups){
    if(g.kind!=="text") continue;
    const segs=fitCount(out[g.id], g.segs);
    g.nodes.forEach((node,i)=>{ const old=node.data; const lead=old.match(/^\s*/)[0], trail=old.match(/\s*$/)[0]; node.data=lead+segs[i]+trail; });
  }
  // script literals: apply from the end so offsets stay valid
  const byScript=new Map();
  for(const g of groups){ if(g.kind==="js"||g.kind==="num"){ if(!byScript.has(g.script)) byScript.set(g.script,[]); byScript.get(g.script).push(g); } }
  for(const [s,list] of byScript){
    let js=s.textContent;
    list.filter(g=>g.kind==="js").sort((a,b)=>b.start-a.start).forEach(g=>{
      const segs=fitCount(out[g.id],g.segs); const parts=g.parts.slice();
      g.idx.forEach((k,i)=>{ const old=parts[k]; parts[k]=old.match(/^\s*/)[0]+String(segs[i]).replace(/[<>]/g,"")+old.match(/\s*$/)[0]; });
      const v=parts.join("");
      let body=JSON.stringify(String(v)).slice(1,-1).replace(/<\/(script)/gi,"<\\/$1"); if(g.quote==="'") body=body.replace(/\\"/g,'"').replace(/'/g,"\\'");
      const lit=g.quote+body+g.quote;
      js=js.slice(0,g.start)+lit+js.slice(g.end);
    });
    list.filter(g=>g.kind==="num").forEach(g=>{
      let v=out[g.id]&&out[g.id][0]; if(v&&typeof v==="object") v=JSON.stringify(v); v=String(v||"").trim();
      if(v && /^[\s\d{}\[\]:,.\-a-zA-Z"']+$/.test(v) && (g.segs[0][0]==="{"?v[0]==="{":/^\d+(\.\d+)?$/.test(v))) js=js.replace(g.re,(m0,cap)=>m0.replace(cap,()=>v));
    });
    s.textContent=js;
  }
}
function fitCount(arr, orig){
  if(!Array.isArray(arr)) return orig.slice();
  arr=arr.map(x=>typeof x==="string"?x:(x&&typeof x==="object")?JSON.stringify(x):String(x??""));
  if(arr.length===orig.length) return arr;
  if(orig.length===1) return [arr.join(" ")];
  if(arr.length>orig.length){ const head=arr.slice(0,orig.length-1); head.push(arr.slice(orig.length-1).join(" ")); return head; }
  return arr.concat(Array(orig.length-arr.length).fill(""));
}

/* =====================================================================
   GEMINI
   ===================================================================== */
class UserErr extends Error{}
async function geminiRaw(model,key,body,signal){
  let r;
  const headers={"Content-Type":"application/json"};
  const viaProxy=!!CFG.proxy && !key;
  if(viaProxy){ const tp=store.get("sahl_team_pass",""); if(tp) headers["X-Team-Pass"]=tp; } else headers["x-goog-api-key"]=key;
  try{ r=await fetch(viaProxy?(CFG.proxy+"?model="+encodeURIComponent(model)):(API+encodeURIComponent(model)+":generateContent"),{method:"POST",signal,headers,credentials:"same-origin",body:JSON.stringify(body)}); }
  catch(e){ if(e.name==="AbortError") throw new UserErr("Gemini اتأخر أكتر من اللازم. جرّب تاني."); throw new UserErr(CFG.proxy?"مقدرتش أوصل لسيرفر الأداة. حدّث الصفحة، ولو طلب منك تسجيل دخول سجّل تاني.":"مقدرتش أوصل لـ Gemini. اتأكد من النت، ولو فاتح الملف من الجهاز ارفعه على الموقع الأول."); }
  if(viaProxy && !/json/i.test(r.headers.get("content-type")||"")){
    let tx=""; try{ tx=(await r.text()).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,90); }catch(e){}
    console.warn("proxy non-json",r.status,tx);
    if(r.status>=500||r.status===429) return {ok:false,status:r.status,msg:"Cloudflare "+r.status+" "+tx};
    throw new UserErr(`سيرفر الأداة رجّع خطأ ${r.status}. حدّث الصفحة (Ctrl+Shift+R) وجرّب تاني. لو اتكررت ابعت الرسالة دي: ${tx}`);
  }
  let j=null; try{ j=await r.json(); }catch(e){}
  if(viaProxy && r.status===401 && j && j.error && j.error.code==="team_pass")throw new UserErr("TEAM_PASS");
  const msg=(j&&j.error&&j.error.message)||"";
  if(!r.ok) return {ok:false,status:r.status,msg};
  const c=j&&j.candidates&&j.candidates[0];
  if(!c){ const br=j&&j.promptFeedback&&j.promptFeedback.blockReason; throw new UserErr("Gemini رفض الطلب"+(br?` (${br})`:"")+"."); }
  const text=((c.content&&c.content.parts)||[]).filter(p=>p.text&&!p.thought).map(p=>p.text).join("\n");
  if(!text) return {ok:false,status:0,msg:"empty "+(c.finishReason||"")};
  return {ok:true,text,finish:c.finishReason};
}
let goodModel=null;
let geminiDownUntil=0;
let onGeminiWait=null;
function thinkFor(model,level="minimal"){ if(isBackup(model)) return null; if(/2\.5-pro/.test(model)) return null; if(/^gemini-2\.5/.test(model)) return level==="minimal"?{thinkingBudget:0}:{thinkingBudget:1024}; return {thinkingLevel:level}; }
let goodLite=null;
async function callOnce(model,key,b,signal,ms){
  const c=new AbortController(); const on=()=>c.abort(); if(signal){ if(signal.aborted) c.abort(); else signal.addEventListener("abort",on,{once:true}); }
  const t=setTimeout(()=>c.abort(),ms);
  try{ return await geminiRaw(model,key,b,c.signal); }
  catch(e){ if(c.signal.aborted && !(signal&&signal.aborted)) return {ok:false,status:504,msg:"timeout after "+Math.round(ms/1000)+"s"}; throw e; }
  finally{ clearTimeout(t); if(signal) signal.removeEventListener("abort",on); }
}
async function gemini(body,signal,{fast=false,lite=false,timeout=120000,think="minimal"}={}){
  const key=store.get("sahl_gemini_key","");
  if(!key && !CFG.proxy) throw new UserErr("NO_KEY");
  let first=goodModel||store.get("sahl_gemini_model",MODELS[0]);
  if(!MODELS.includes(first) && !LITE_MODELS.includes(first)) first=MODELS[0];   // موديل قديم محفوظ على الجهاز (زي 2.5-flash اللي جوجل قفلته)
  let chain=[first,...MODELS.filter(m=>m!==first)];
  if(lite){ const l=goodLite?[goodLite,...LITE_MODELS.filter(m=>m!==goodLite)]:LITE_MODELS; chain=[...l,...chain.filter(m=>!l.includes(m))]; }
  if(CFG.proxy && !key){
    chain=[...chain,...BK_MODELS.filter(m=>!chain.includes(m))];
    if(Date.now()<geminiDownUntil) chain=[...BK_MODELS,...chain.filter(m=>!BK_MODELS.includes(m))];   // Gemini وقع من شوية: ابدأ بالاحتياطي على طول
  }
  let last="", lastStatus=0, noGroq=false; const tried=[];
  const why=()=>tried.length?" — التفاصيل: "+tried.join(" | "):"";
  for(const model of chain){
    if(noGroq && /^groq:/.test(model)) continue;
    let b=body;
    if(fast){ const tc=thinkFor(model,think); if(tc){ b=JSON.parse(JSON.stringify(body)); b.generationConfig=Object.assign({},b.generationConfig,{thinkingConfig:tc}); } }
    let res=await callOnce(model,key,b,signal,timeout); let n5=0;
    for(let t=0;t<8 && !res.ok;t++){
      const msg=res.msg||"";
      if(res.status===429){
        if(/limit:\s*0\b|PerDay|per[_ ]day|daily/i.test(msg)) break;           // no free quota left for this model -> next model
        const m=/retry in ([\d.]+)\s*s/i.exec(msg); const wait=m?parseFloat(m[1])*1000:6000*(t+1);
        if(wait>70000) break;
        if(onGeminiWait) onGeminiWait(Math.ceil(wait/1000));
        await sleep(wait+700); res=await callOnce(model,key,b,signal,timeout); continue;
      }
      if(res.status===501) break;   // backup not set up on the server -> skip it at once
      if(res.status>=500){
        if(b.tools){ b=Object.assign({},b); delete b.tools; res=await callOnce(model,key,b,signal,timeout); continue; }   // the URL reader is often the slow/failing part
        if(n5<2 && res.status!==504){ await sleep(n5++===0?2500:7000); res=await callOnce(model,key,b,signal,timeout); continue; }
        break;
      }
      if(res.status===400 && b.tools && /tool|url_context|search|grounding|not supported|unsupported/i.test(msg)){ b=Object.assign({},b); delete b.tools; res=await callOnce(model,key,b,signal,timeout); continue; }
      if(res.status===400 && b.generationConfig && b.generationConfig.thinkingConfig && /thinking/i.test(msg)){ b=JSON.parse(JSON.stringify(b)); if(b.generationConfig.thinkingConfig.thinkingLevel==="minimal") b.generationConfig.thinkingConfig={thinkingLevel:"low"}; else delete b.generationConfig.thinkingConfig; res=await callOnce(model,key,b,signal,timeout); continue; }
      if(res.status===400 && b.generationConfig && b.generationConfig.responseMimeType && /mime|response_mime|responseMimeType/i.test(msg)){ b=JSON.parse(JSON.stringify(b)); delete b.generationConfig.responseMimeType; res=await callOnce(model,key,b,signal,timeout); continue; }
      break;
    }
    if(res.ok){ if(lite&&LITE_MODELS.includes(model)) goodLite=model; else if(!isBackup(model)) goodModel=model; if(isBackup(model)){ if(lastStatus>=500||lastStatus===429) geminiDownUntil=Date.now()+3*60*1000; console.info("Gemini واقع — الخطة اتكتبت بالاحتياطي",model); } else geminiDownUntil=0; return res; }
    last=res.msg; lastStatus=res.status;
    tried.push(model.replace(/^gemini-/,"")+": "+res.status+(res.msg?" "+String(res.msg).replace(/\s+/g," ").slice(0,70):""));
    console.warn("Gemini",model,res.status,res.msg);
    if(res.status===501 && /^groq:/.test(model)) noGroq=true;
    if(res.status===404 || res.status===429 || res.status>=500 || (res.status===400 && /model/i.test(res.msg) && !/key/i.test(res.msg))) continue;
    if(res.status===400 && /API key|API_KEY/i.test(res.msg)) throw new UserErr(CFG.proxy?"مفتاح Gemini اللي على السيرفر غلط. كلّم الأدمن يغيّره من إعدادات Cloudflare.":"مفتاح Gemini غلط. افتح «مفتاح Gemini» فوق وحط المفتاح الصح.");
    if(res.status===401) throw new UserErr("Google رفض المفتاح (401): "+String(res.msg||"").slice(0,160));
    if(res.status===403) throw new UserErr("Google رفض المفتاح (403). يا إما المفتاح متقفل، يا إما مقيّد بموقع تاني.");
    if(res.status>=500) throw new UserErr("Gemini واقع دلوقتي ("+res.status+"). جرّب كمان شوية."+why());
    if(res.status===0) return res;
    throw new UserErr("Gemini رجّع خطأ: "+(res.msg||res.status));
  }
  if(lastStatus>=500 && /^Cloudflare/.test(last)) throw new UserErr("سيرفر الأداة على Cloudflare بيرجّع خطأ ("+lastStatus+") — المشكلة مش من Gemini. اتأكد إن GEMINI_API_KEY لسه موجود في إعدادات Cloudflare."+why());
  if(lastStatus>=500) throw new UserErr("كل موديلات Gemini عليها ضغط دلوقتي ("+lastStatus+"). جرّب كمان دقيقتين."+why());
  
  
  if(lastStatus===429){ const res={status:429};
    if(res.status===429) throw new UserErr((CFG.proxy&&!store.get("sahl_gemini_key","")?"مفتاح Gemini المجاني بتاع الفريق خلص حده (في الدقيقة أو في اليوم) على كل الموديلات. استنى دقيقتين وجرّب تاني. ولو بتتكرر، اعمل مفتاح مجاني من حساب Gmail بتاعك وحطه من زرار «Gemini» فوق، والأداة هتشتغل بيه على جهازك.":"مفتاحك وصل لحد الاستخدام المجاني. استنى دقيقتين وجرّب تاني.")+why()); }
  throw new UserErr("ولا موديل من موديلات Gemini متاح للمفتاح ده."+why());
}
function parseJsonLoose(text){
  const s=text.replace(/```(?:json)?/gi,""); const a=s.indexOf("{"), b=s.lastIndexOf("}");
  try{ return JSON.parse(s.slice(a,b+1)); }catch(e){ return null; }
}
async function storeBrief(d,signal){
  const url=normUrl(d.url);
  const body={
    systemInstruction:{parts:[{text:"أنت باحث تسويق في وكالة «شراع للتسويق الإلكتروني» بالسعودية. اقرأ المتجر من رابطه بأداة قراءة الروابط، واستخدم البحث عند الحاجة. لا تخترع أي معلومة لم تجدها. أخرج JSON فقط."}]},
    contents:[{role:"user",parts:[{text:`رابط المتجر: ${url}
نوع المنتجات حسب السيلز: ${d.cat}
${d.notes?`ملاحظات السيلز: ${d.notes}\n`:""}أعد JSON بهذا الشكل:
{"store_read":true,"store_name":"اسم المتجر كما يظهر في الموقع","domain":"${hostOf(url)}","platform":"سلة/زد/لك/غيرها","category":"النشاط","products":["أبرز الأقسام أو المنتجات"],"price_range":"نطاق الأسعار إن ظهر","audience":"الجمهور المتوقع","positioning":"كيف يقدم نفسه","strengths":["نقاط قوة ظاهرة"],"gaps":["فجوات ظاهرة"],"social":"الحسابات الظاهرة إن وجدت","notes":"أي معلومة مهمة"}
لو لم تستطع فتح المتجر اجعل store_read=false واكتب ما تستطيع من الرابط فقط.`}]}],
    tools:[{url_context:{}}],
    generationConfig:{maxOutputTokens:2048}
  };
  const fallback={store_read:false,store_name:hostLabel(url),domain:hostOf(url),category:d.cat,notes:d.notes||""};
  // reading the store is a bonus, not a must: give it 45 seconds at most
  const c=new AbortController(); const onAbort=()=>c.abort(); if(signal) signal.addEventListener("abort",onAbort,{once:true});
  const cap=setTimeout(()=>c.abort(),45000);
  let res;
  try{ res=await gemini(body,c.signal,{fast:true,timeout:30000}); }
  catch(e){ if(signal&&signal.aborted) throw e; if(e instanceof UserErr && (["NO_KEY","TEAM_PASS"].includes(e.message)||/مفتاح|401|403/.test(e.message))) throw e; return fallback; }
  finally{ clearTimeout(cap); if(signal) signal.removeEventListener("abort",onAbort); }
  const j=res.ok?parseJsonLoose(res.text):null;
  if(!j) return fallback;
  j.domain=j.domain||hostOf(url); j.store_name=(j.store_name||"").trim()||hostLabel(url); j.category=d.cat+(j.category&&j.category!==d.cat?" — "+j.category:"");
  return j;
}
function rewriteSystem(tpl,d,brief){
  const svcTxt=tpl.kind==="app"?"تطوير تطبيق جوال للمتجر":d.services.map(k=>SVC[k].label).join("، ");
  const unsel=tpl.kind==="app"?"":SERVICES.filter(s=>!d.services.includes(s.key)).map(s=>s.label).join("، ");
  return `أنت كاتب محتوى أول في «${COMPANY}» بالسعودية. أمامك نص قالب خطة جاهز مقسّم لمجموعات، وكل مجموعة فيها مقاطع نصية بترتيبها في الصفحة.
القالب كُتب أصلًا لـ: ${tpl.origin}.
مهمتك: أعد صياغة الخطة كلها من جديد للمتجر الجديد أدناه، كأنك كاتبها له من الأول. القالب مجرد هيكل وتصميم: كل مقطع مكانه في الصفحة ثابت، لكن محتواه يُكتب للمتجر الجديد.
قواعد:
1) نفس عدد المقاطع في كل مجموعة بالضبط ونفس الترتيب، لأن كل مقطع له مكان في التصميم. داخل ذلك لك حرية كاملة: غيّر الأفكار والأمثلة والكلمات المفتاحية والمنتجات والأقسام والجمهور والمحتوى المقترح والحملات وأسماء المراحل لتناسب نشاط المتجر الجديد. لا تكتفِ بتبديل الأسماء في جمل العميل القديم. لو فكرة في القالب لا تناسب هذا المتجر، ضع مكانها فكرة تناسبه في نفس المقطع. الطول مرن (أقصر أو أطول حتى النصف تقريبًا)، لكن العنوان يبقى عنوانًا قصيرًا والتسمية تبقى تسمية.
2) في بيانات المتجر قد تجد category_guide: دليل للسوق السعودي لهذا النوع (الجمهور، الكلمات المفتاحية، المواسم، أفكار المحتوى، نوع المشاهير، زوايا الإعلانات، وملاحظات نظامية). استخدمه كمرجع وكيّفه للمتجر، ولا تنسخه حرفيًا في كل مكان. لو فيه note عن ضوابط هيئة الغذاء والدواء فالتزم بها.
2ب) اكتب تفاصيل المتجر الجديد الحقيقية (اسمه، منتجاته، جمهوره، أمثلة كلماته المفتاحية ومحتواه). احذف أي ذكر للعميل القديم أو منتجاته أو رابطه.
3) اسم الشركة الثابت هو «${COMPANY}». أي اسم وكالة آخر (مثل أسماء وكالات أخرى موجودة في القالب) يُستبدل به.
4) المنصات المعتمدة فقط: سناب شات وتيك توك وإنستجرام. أي مقطع عن فيسبوك أو إكس أو يوتيوب أو واتساب أو إعلانات Google يُعاد كتابته عن واحدة من الثلاث بدل حذفه.
5) الخدمات في هذه الباقة: ${svcTxt}.${unsel?` لا تذكر هذه الخدمات غير المختارة: ${unsel}.`:""}${tpl.kind==="app"?"":`
5ب) مدة الخطة المختارة: ${durTxt(d.dur)} (${DUR_DAYS[d.dur]})، وتبدأ من ${monthsFromNext(1)[0]} ${new Date().getFullYear()+(new Date().getMonth()===11?1:0)}. هذا إلزامي: أي ذكر لمدة الخطة الكلية في القالب (مثل «3 أشهر» أو «6 أشهر» أو «90 يومًا») يُكتب ${durTxt(d.dur)}، والأهداف والأرقام تُحسب على هذه المدة. لو القالب مقسم لمراحل أو أشهر عددها لا يساوي المدة، وزّع المدة على نفس عدد المقاطع (مثلًا 6 أعمدة لخطة 12 شهرًا = كل عمود شهران، و6 أعمدة لخطة 3 أشهر = كل عمود أسبوعان)، وسمِّ كل مرحلة بفترتها الصحيحة.`}${tpl.kind!=="app"&&d.services.includes("influencers")?`
5ج) عدد المشاهير في هذه الباقة: ${d.inf} بالضبط (${infPhrase(d.inf)}). أي ذكر لعدد المشاهير أو المؤثرين في الحملة يُكتب ${d.inf}، والأرقام والإيرادات المتوقعة منهم تُحسب على ${d.inf}، ووزّعهم على أشهر الباقة. (قاعدة بيانات المؤثرين أو قائمة الترشيحات ممكن تكون أكبر من العدد ده، لكن المتعاقد معهم في الباقة ${d.inf}.)`:""}${d.pkg?`
5د) الباقة المختارة: «${d.pkg.name}» لمدة ${durTxt(d.pkg.months)}. الخدمات المضمنة: ${d.pkg.items.join("، ")}.${d.pkg.app?` وتشمل ${d.pkg.app}.`:""} الجدول الشهري للباقة (إلزامي): ${pkgSched(d.pkg).join(" | ")}. أي جدول زمني أو خطة شهرية أو مراحل في القالب تمشي على الجدول ده بالظبط، وأي خدمة مش في الباقة ما تتكتبش كأنها جزء منها.`:""}
6) الأرقام: عدّلها لتناسب المتجر الجديد بشكل منطقي، وأبقِ أي عبارة في القالب تقول إنها أرقام توضيحية أو ليست ضمانًا. لا تكتب «نضمن» أو «مضمون» إلا منفية كما في الأصل.
7) لا تذكر أي سعر أو تكلفة للباقة نفسها.
8) اترك المصطلحات الإنجليزية التقنية كما هي (SEO, Reels, ROAS...). أي وسوم HTML أو رموز داخل المقطع تبقى كما هي.
9) المجموعات من نوع "num" هي كائنات أرقام لنموذج حسابي: أعدها بنفس المفاتيح والصيغة بالضبط (JavaScript literal) مع قيم تناسب المتجر.
10) أخرج JSON فقط بالشكل {"g12":["...","..."], ...} لكل مجموعة أُعطيت لك.`;
}
function chunkGroups(groups,maxChars=4500){
  const chunks=[]; let cur=[], size=0;
  for(const g of groups){
    const len=g.segs.join("").length+12;
    if(cur.length && (size+len>maxChars || cur.length>=400)){ chunks.push(cur); cur=[]; size=0; }
    cur.push(g); size+=len;
  }
  if(cur.length) chunks.push(cur);
  return chunks;
}
async function rewriteChunk(sys,brief,chunk,signal,vip=false){
  const payload={groups:chunk.map(g=>g.kind==="num"?{id:g.id,type:"num",hint:g.hint,segs:g.segs}:{id:g.id,segs:g.segs})};
  const body={
    systemInstruction:{parts:[{text:sys}]},
    contents:[{role:"user",parts:[{text:"بيانات المتجر الجديد:\n"+JSON.stringify(brief)+"\n\nالمجموعات:\n<<<GROUPS\n"+JSON.stringify(payload)+"\nGROUPS>>>"}]}],
    generationConfig:{maxOutputTokens:32768,responseMimeType:"application/json"}
  };
  const res=await gemini(body,signal,vip?{fast:true,lite:false,think:"low",timeout:180000}:{fast:true,lite:true});
  return res.ok?(parseJsonLoose(res.text)||{}):{};
}
async function runPool(items,limit,fn,onDone){
  const out=new Array(items.length); let i=0, done=0;
  async function worker(){ while(i<items.length){ const k=i++; out[k]=await fn(items[k]); done++; onDone&&onDone(done,items.length); } }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));
  return out;
}

/* =====================================================================
   BUILD a plan from a template
   ===================================================================== */
function readForm(){
  const f=$("#f");
  const dur=+((f.querySelector('input[name=dur]:checked')||{}).value||3);
  const services=[...f.querySelectorAll('input[name=svc]:checked')].map(i=>i.value);
  const tpl=((f.querySelector('input[name=tpl]:checked')||{}).value)||"";
  const catSel=$("#cat").value, cat=catSel==="__other"?$("#catOther").value.trim():catSel;
  const pmode=(f.querySelector('input[name=pmode]:checked')||{}).value||"fast";
  const infPick=+($("#infCount")||{}).value||6; let inf=INF_BY_DUR[dur]||infPick;
  const pkg=(mode==="plan"||mode==="app")?PKG[selPkg[mode]]||null:null;
  if(pkg){ return { pmode, pkg, pkgId:pkg.id, inf:pkg.inf, infPick, url:$("#url").value.trim(), notes:$("#notes").value.trim(), dur:pkg.months, services:pkg.svc.slice(), tpl, cat, catSel, catOther:$("#catOther").value.trim(), storeName:$("#storeName").value.trim(),
    price:$("#price").value===""?null:Math.max(0,Number($("#price").value)), was:$("#was").value===""?null:Math.max(0,Number($("#was").value)) }; }
  return { pmode, pkg:null, inf, infPick, url:$("#url").value.trim(), notes:$("#notes").value.trim(), dur, services, tpl, cat, catSel, catOther:$("#catOther").value.trim(), storeName:$("#storeName").value.trim(),
    price:$("#price").value===""?null:Math.max(0,Number($("#price").value)), was:$("#was").value===""?null:Math.max(0,Number($("#was").value)) };
}
function prepareDoc(tpl,d,src){
  const doc=new DOMParser().parseFromString(src,"text/html");
  { const it=doc.createNodeIterator(doc.documentElement,NodeFilter.SHOW_COMMENT); const cm=[]; let c; while((c=it.nextNode())) cm.push(c); cm.forEach(x=>x.remove()); }
  doc.querySelectorAll("style").forEach(st=>{ st.textContent=st.textContent.replace(/\/\*[\s\S]*?\*\//g,""); });
  if(tpl.prep) tpl.prep(doc);
  if(tpl.scriptPrep) doc.querySelectorAll("script:not([src])").forEach(s=>s.textContent=tpl.scriptPrep(s.textContent,d));
  if(tpl.kind==="plan" && tpl.infTrim && d.services.includes("influencers")) tpl.infTrim(doc,d.inf);
  if(tpl.kind==="plan" && tpl.durTrim && d.dur) tpl.durTrim(doc,d.dur);
  if(tpl.kind==="plan"){
    // find every node to drop BEFORE removing anything: removals shift :nth-child() matches
    const drops=[];
    for(const sec of (tpl.sections||[])){
      if(sec.any.some(k=>d.services.includes(k))) continue;
      drops.push([sec, sec.rows ? rowsByLabel(doc,sec.rows) : [...doc.querySelectorAll(sec.sel)]]);
    }
    for(const [sec,nodes] of drops){
      nodes.forEach(n=>{ if(sec.hide){ n.style.setProperty("display","none","important"); n.setAttribute("aria-hidden","true"); n.querySelectorAll("*").forEach(x=>{ if(x.childNodes) [...x.childNodes].forEach(c=>{ if(c.nodeType===3 && /\p{L}/u.test(c.data)) c.data=""; }); }); } else n.remove(); });
    }
  }
  return doc;
}
// put the chosen package (name, services, month-by-month schedule) into the plan, in the template's own style
function insertPkg(doc,tpl,p){
  const inv=doc.querySelector('[data-sahl="invest"]');
  // plain "•" bullets: html2canvas draws native list markers on the wrong side in RTL
  const li=t=>`<li style="list-style:none;margin:0">• ${esc(t)}</li>`;
  const items=p.items.map(li).join(""), sched=pkgSched(p).map(li).join("");
  const itemsT=p.items.map(t=>`<li>${esc(t)}</li>`).join(""), schedT=pkgSched(p).map(t=>`<li>${esc(t)}</li>`).join("");
  const title=`تفاصيل الباقة: ${esc(p.name)}`, sub=`${esc(durTxt(p.months))}${p.inf?` · ${esc(infPhrase(p.inf))}`:""}${p.app?` · ${esc(p.app)}`:""}`;
  if(tpl.id==="sahl22"){
    const html=`<section class="page"><div class="ph"><div class="t"><small>الباقة</small><h2>${esc(p.name)}</h2><p>${sub}</p></div><img src="${LOGO_LIGHT}" alt=""></div>
      <div class="card"><h3>الخدمات المضمنة</h3><ul>${itemsT}</ul></div><div class="card"><h3>الجدول الشهري</h3><ul>${schedT}</ul></div><div class="pn"></div></section>`;
    inv?inv.insertAdjacentHTML("beforebegin",html):null; return;
  }
  if(tpl.id==="proposal"||tpl.id==="luxellia"){
    const end=tpl.id==="proposal"?'<span class="pno"></span>':'<div class="brandline"></div>';
    const html=`<section class="slide light"><span class="kick">الباقة</span><h2>${esc(p.name)}</h2><p class="lead" style="margin-top:6px">${sub}</p>
      <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:34px;margin-top:22px;font-size:16px;line-height:1.85"><div><b style="font-size:18px">الخدمات المضمنة</b><ul style="margin:8px 0 0;padding:0">${items}</ul></div>
      <div><b style="font-size:18px">الجدول الشهري</b><ul style="margin:8px 0 0;padding:0">${sched}</ul></div></div>${end}</section>`;
    inv?inv.insertAdjacentHTML("beforebegin",html):null; return;
  }
  if(tpl.id==="ipc"){
    const html=`<section class="page"><div class="page-head"><div class="phase-chip">✦</div><div class="titles"><div class="kicker">الباقة</div><h2>${esc(p.name)}</h2></div></div>
      <div class="card accent"><h3><span class="dot"></span>الخدمات المضمنة</h3><ul style="margin:6px 0 0;padding:0;line-height:1.9">${items}</ul></div>
      <div class="card"><h3><span class="dot"></span>الجدول الشهري</h3><ul style="margin:6px 0 0;padding:0;line-height:1.9">${sched}</ul></div>
      <div class="foot"><span class="b">${esc(COMPANY)}</span><span>الباقة</span></div></section>`;
    inv?inv.insertAdjacentHTML("beforebegin",html):null; return;
  }
  // long-scroll templates: a block inside the investment section
  const blk=`<div class="sahl-pkg" style="margin-top:22px;border:1px solid rgba(128,128,128,.35);border-radius:14px;padding:18px 20px;line-height:1.9">
    <b style="font-size:19px;display:block">${title}</b><span style="opacity:.75">${sub}</span>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:10px">
      <div><b>الخدمات المضمنة</b><ul style="margin:6px 0 0;padding:0">${items}</ul></div>
      <div><b>الجدول الشهري</b><ul style="margin:6px 0 0;padding:0">${sched}</ul></div></div></div>`;
  if(inv){ const host=inv.querySelector(".wrap")||inv; host.insertAdjacentHTML("beforeend",blk); }
}
// how long each original template's plan was, and how it wrote it
const DUR_ORIG={
  sahl22:{m:3,months:["٣ أشهر","3 أشهر","ثلاثة أشهر"]},
  route6:{m:6,months:["6 أشهر","٦ أشهر","ستة أشهر"]},
  cozy:{m:3,days:["90 يومًا","90 يوم","٩٠ يومًا","٩٠ يوم"],months:["3 أشهر","ثلاثة أشهر"],numDays:"90"},
  launch90:{m:3,days:["90 يوماً","90 يومًا","90 يوم"],months:["3 أشهر","ثلاثة أشهر"],numDays:"90",range:"نوفمبر 2026 – يناير 2027"},
  etqan_gold:{m:3,days:["90 يومًا","90 يوم"],numDays:"90"},
  etqan_green:{m:3,days:["90 يومًا","90 يوم"],numDays:"90"}
};
const DUR_MONTHS=new Proxy({},{get:(_,k)=>durTxt(+k)}), DUR_DAYS=new Proxy({},{get:(_,k)=>(+k===12?"365 يومًا":durDays(+k))});
function infPhrase(n,noun="مشاهير"){ const one=noun==="مشاهير"?"مشهور":"مؤثر"; if(n===1) return one+" واحد"; if(n===2) return one+"ان"; if(n<=10) return n+" "+noun; return n+" "+one+"ًا"; }
function fixInfluencers(doc,tpl,N){
  const reps=[];
  const tech=N===1?"مؤثر تقني واحد":N===2?"مؤثران تقنيان":N+" مؤثرين تقنيين";
  ["6 مؤثرين تقنيين","٦ مؤثرين تقنيين","ستة مؤثرين تقنيين"].forEach(a=>reps.push([a,tech]));
  ["6 مشاهير","٦ مشاهير","ستة مشاهير"].forEach(a=>reps.push([a,infPhrase(N,"مشاهير")]));
  ["6 مؤثرين","٦ مؤثرين","ستة مؤثرين"].forEach(a=>reps.push([a,infPhrase(N,"مؤثرين")]));
  reps.push(["المؤثرون (6)","المؤثرون ("+N+")"],["المؤثرين الستة",N===1?"المؤثر":"المؤثرين ("+N+")"],["المشاهير الستة",N===1?"المشهور":"المشاهير ("+N+")"]);
  reps.sort((a,b)=>b[0].length-a[0].length);
  const w=doc.createTreeWalker(doc.documentElement,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){ const p=n.parentNode&&n.parentNode.nodeName; if(p==="STYLE"||p==="SCRIPT") continue; let t=n.data; for(const [a,b] of reps) t=t.split(a).join(b); if(t!==n.data) n.data=t; }
}
function rangeTxt(n){ const d=new Date(); const s=new Date(d.getFullYear(),d.getMonth()+1,1), e=new Date(s.getFullYear(),s.getMonth()+n-1,1);
  return n===1?`${AR_MONTHS[s.getMonth()]} ${s.getFullYear()}`:`${AR_MONTHS[s.getMonth()]} ${s.getFullYear()} – ${AR_MONTHS[e.getMonth()]} ${e.getFullYear()}`; }
function fixDuration(doc,tpl,dur){
  const o=DUR_ORIG[tpl.id]; if(!o||!dur) return;
  const reps=[];
  if(o.range) reps.push([o.range,rangeTxt(dur)]);
  if(o.m===dur){ if(!reps.length) return; }
  else {
  (o.months||[]).forEach(ph=>reps.push([ph, /[٠-٩]/.test(ph)?AR_DIG(DUR_MONTHS[dur]):DUR_MONTHS[dur]]));
  (o.days||[]).forEach(ph=>reps.push([ph, /[٠-٩]/.test(ph)?AR_DIG(DUR_DAYS[dur]):DUR_DAYS[dur]])); }
  reps.sort((a,b)=>b[0].length-a[0].length);
  const w=doc.createTreeWalker(doc.documentElement,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){ const p=n.parentNode&&n.parentNode.nodeName; if(p==="STYLE"||p==="SCRIPT") continue; let t=n.data; for(const [a,b] of reps) t=t.split(a).join(b); if(t!==n.data) n.data=t; }
  // a big number in its own tag followed by a "يومًا…" label (e.g. <b>90</b><span>يومًا لخطة أولى</span>)
  if(o.numDays && o.m!==dur) doc.querySelectorAll("b,strong,span,div").forEach(e=>{ if(e.children.length||e.textContent.trim()!==o.numDays) return; const nx=e.nextElementSibling; if(nx && /^\s*يوم/.test(nx.textContent)) e.textContent=String(dur===12?365:dur*30); });
}
function finishDoc(doc,tpl,d,brief){
  const name=brief.store_name||hostLabel(d.url), dom=brief.domain||hostOf(d.url);
  // remove any leftover identity of the old client / old agency name
  const reps=[...AGENCY_ALIASES.map(r=>[r,COMPANY])];
  (tpl.originNames||[]).slice().sort((a,b)=>b.length-a.length).forEach(o=>{ const rx=new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"); reps.push([rx, /\.|\//.test(o)?dom:name]); });
  const walker=doc.createTreeWalker(doc.documentElement,NodeFilter.SHOW_TEXT); let n;
  while((n=walker.nextNode())){ const p=n.parentNode&&n.parentNode.nodeName; if(p==="STYLE") continue; let t=n.data; for(const [rx,v] of reps) t=t.replace(rx,v); if(t!==n.data) n.data=t; }
  if(tpl.kind==="plan") fixDuration(doc,tpl,d.dur);
  if(tpl.kind==="plan" && d.services.includes("influencers")) fixInfluencers(doc,tpl,d.inf);
  if(tpl.kind==="plan"||tpl.kind==="app"){
    const c={price:d.price,was:d.was,hasDisc:d.was>0&&d.price>0&&d.was>d.price,durTxt:tpl.kind==="app"?(d.pkg?(d.pkg.app||"التطبيق"):"التطبيق"):durTxt(d.dur),
      svcTxt:d.pkg?d.pkg.items.join("، "):(tpl.kind==="app"?"تصميم التطبيق وتطويره ونشره":d.services.map(k=>SVC[k].label).join("، ")),store:name,pkg:d.pkg};
    if(d.price>0) tpl.price(doc,c);
    if(d.pkg) insertPkg(doc,tpl,d.pkg);
  }
  if(tpl.post) tpl.post(doc);
  doc.title=(tpl.kind==="app"?"خطة تطبيق ":"خطة تسويقية ")+"— "+name+" | "+COMPANY;
  return "<!DOCTYPE html>\n"+doc.documentElement.outerHTML;
}
let current=null; // {html, tpl, d, brief}
const lastPlan={plan:null,app:null}; let genBusy=null;
async function generate(){
  const d=readForm(); saveDraft();
  if(!validate(d)) return;
  if(!CFG.proxy && !store.get("sahl_gemini_key","")){ openKey("حط مفتاح Gemini الأول."); return; }
  const tpl=TPL[d.tpl]; const kind=mode; genBusy=kind;
  const btn=$("#genBtn"); btn.disabled=true; setEdit(false);
  const prog=$("#prog"), bar=prog.firstElementChild; prog.hidden=false;
  const setP=(t,p)=>{ if(t!=null){ $("#genTxt").textContent=t; $("#genOvT").textContent=t; } if(p!=null){ bar.style.width=p+"%"; $("#genOvBar").style.width=p+"%"; } };
  current=null; syncButtons(); $("#genOv").hidden=false; setP(null,4);
  const tStart=Date.now(); const tick=setInterval(()=>{ const t=Math.round((Date.now()-tStart)/1000); $("#genOvClock").textContent=`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`; },1000); try{ $("#frameWrap").scrollIntoView({block:"center",behavior:"smooth"}); }catch(e){}
  onGeminiWait=sec=>{ $("#genOvS").textContent=`حد المفتاح المجاني: Gemini طالب نستنى ${sec} ثانية، والأداة هتكمّل لوحدها.`; }; const t0=Date.now(); const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),12*60*1000);
  try{
    status("");
    let brief; const vip=d.pmode==="vip";
    if(!vip){ brief={store_read:true,source:"sales",store_name:d.storeName,domain:hostOf(d.url),category:d.cat,notes:d.notes||""}; }
    else { setP("1/3 بيقرأ المتجر...",null); $("#genOvS").textContent="Gemini بيفتح رابط المتجر يجيب اسمه ومنتجاته. لو اتأخر أكتر من 45 ثانية الأداة هتكمّل من غيره.";
      brief=await storeBrief(d,ctrl.signal); if(d.storeName){ brief.store_name=d.storeName; brief.name_from_sales=true; } }
    if(CAT_PACK[d.cat]) brief.category_guide=CAT_PACK[d.cat];
    setP(null,18);
    const doc=prepareDoc(tpl,d,await getTpl(tpl.id));
    const groups=extractSegments(doc,tpl);
    const sys=rewriteSystem(tpl,d,brief);
    const chunks=chunkGroups(groups,vip?6000:4500);
    const out={};
    setP(`2/3 بيكتب الخطة (0 من ${chunks.length})`,null); $("#genOvS").textContent=vip?`خطة VIP لمتجر «${brief.store_name}»: بيكتبها بموديل أقوى وبتفاصيل أكتر. بتاخد من 2 لـ 4 دقايق.`:`خطة سريعة لمتجر «${brief.store_name}». بتاخد حوالي دقيقة.`;
    let chunkErr=null;
    const fatal=e=>!(e instanceof UserErr) || ["NO_KEY","TEAM_PASS"].includes(e.message) || /مفتاح|403|401/.test(e.message);
    const results=await runPool(chunks,vip?3:4,ch=>rewriteChunk(sys,brief,ch,ctrl.signal,vip).catch(e=>{ if(fatal(e)) throw e; chunkErr=e; return {}; }),(k,n)=>{ setP(`2/3 بيكتب الخطة (${k} من ${n})`,18+70*k/n); });
    results.forEach(r=>Object.assign(out,r||{}));
    // retry what came back missing, once
    const missing=groups.filter(g=>!Array.isArray(out[g.id]));
    if(missing.length){
      setP(`2/3 بيكمّل ${missing.length} جزء ناقص`,null);
      const again=await runPool(chunkGroups(missing,2500),4,ch=>rewriteChunk(sys,brief,ch,ctrl.signal,vip).catch(e=>{ if(fatal(e)) throw e; chunkErr=e; return {}; }));
      again.forEach(r=>Object.assign(out,r||{}));
    }
    const still=groups.filter(g=>!Array.isArray(out[g.id])).length;
    if(still>groups.length*0.4) throw (chunkErr||new UserErr("Gemini ما رجّعش أغلب الخطة. جرّب تاني بعد دقيقة."));
    const fixed=groups.filter(g=>Array.isArray(out[g.id]) && out[g.id].length!==g.segs.length).length;
    applySegments(doc,groups,out);
    setP("3/3 بيجهّز المعاينة",94);
    const html=finishDoc(doc,tpl,d,brief);
    const done={html,tpl,d,brief}; lastPlan[kind]=done;
    if(mode===kind){ current=done; showInFrame(html,false,tpl.id); }
    setP(null,100); syncButtons();
    const secs=Math.round((Date.now()-t0)/1000);
    const warn=[];
    if(vip && !brief.store_read) warn.push(`Gemini مقدرش يفتح المتجر، فالخطة اتكتبت على نوع المتجر بس، واسمه اتاخد من الرابط («${brief.store_name}»). اكتب اسم المتجر بالعربي واضغط «اكتب الخطة» تاني لو الاسم مش مظبوط.`);
    if(still) warn.push(`${still} جزء فضل بنص القالب القديم بعد محاولتين. دوّر عليهم في المعاينة وعدّلهم بـ «تعديل النصوص».`);
    if(fixed) warn.push(`${fixed} جزء رجع بعدد جمل مختلف واتظبط على عدد القالب.`);
    const promises=countPromises(html);
    if(promises) warn.push(`فيه ${promises} مكان فيه كلمة «نضمن/مضمون». راجعهم قبل الإرسال.`);
    status((mode!==kind?`ارجع لقسم «${kind==="app"?"خطة تطبيق":"خطة تسويقية"}» تلاقيها. `:"")+`الخطة ${vip?"الـ VIP":"السريعة"} جاهزة لمتجر «${brief.store_name}» في ${secs} ثانية. اقراها، وعدّل أي جملة بزرار «تعديل النصوص»، وبعدين نزّلها.`+(warn.length?" تنبيه: "+warn.join(" "):""), warn.length?"warn":"ok");
    $("#exTag").hidden=true;
  }catch(e){
    if(e.message==="NO_KEY"){ openKey(); status(""); }
    else if(e.message==="TEAM_PASS"){ const p=window.prompt("اكتب كلمة سر فريق شراع (بتتطلب مرة واحدة على الجهاز ده):"); if(p){ store.set("sahl_team_pass",p.trim()); status("اتحفظت. اضغط «اكتب الخطة» تاني.","ok"); } else status("الأداة محتاجة كلمة سر الفريق.","warn"); }
    else status(e instanceof UserErr?e.message:"حصل خطأ غير متوقع: "+e.message,"bad");
  }finally{
    clearTimeout(to); onGeminiWait=null; genBusy=null; btn.disabled=false; $("#genOv").hidden=true; $("#genOvBar").style.width="0"; clearInterval(tick); $("#genOvClock").textContent="0:00"; syncButtons(); $("#genTxt").textContent=mode==="app"?"اكتب خطة التطبيق بـ Gemini":"اكتب الخطة بـ Gemini"; setTimeout(()=>{prog.hidden=true;bar.style.width="0"},800);
  }
}
function countPromises(html){ const t=html.replace(/<[^>]+>/g," "); return (t.match(/(?<!لا\s)(?<!ولا\s)(نضمن|مضمون|نتعهد)/g)||[]).length; }

/* =====================================================================
   PREVIEW, EDIT, EXPORT
   ===================================================================== */
const frame=()=>$("#tplFrame");
let frameTpl=null;
function fitFrame(){
  const f=frame(), wrap=$("#frameWrap"); const t=frameTpl&&TPL[frameTpl];
  const W=wrap.clientWidth; const H=Math.max(520,Math.round(window.innerHeight*0.78));
  if(t&&t.view&&W>=560&&t.view>W){ const k=W/t.view; f.style.width=t.view+"px"; f.style.height=Math.round(H/k)+"px"; f.style.transform=`scale(${k})`; f.style.transformOrigin="top right"; wrap.style.height=H+"px"; }
  else { f.style.width="100%"; f.style.height=H+"px"; f.style.transform=""; wrap.style.height=""; }
}
function showInFrame(html,isOriginal,tplId){
  setEdit(false);
  frameTpl=tplId||readForm().tpl; fitFrame();
  frame().srcdoc=html;
  $("#exTag").hidden=!isOriginal; syncButtons();
  $("#pvHint").textContent=isOriginal?"ده شكل القالب. اكتب رابط المتجر واضغط «اكتب الخطة»، وGemini هيعيد صياغة الخطة كلها للمتجر. أزرار التنزيل بتظهر لما الخطة تجهز.":"اضغط «تعديل النصوص» وبعدين اضغط على أي جملة في الخطة عشان تعدّلها. التنزيل بياخد النسخة اللي قدامك بتعديلاتك.";
}
function syncButtons(){
  const planLike=mode==="plan"||mode==="app", ready=!planLike||!!current;
  $("#pdfBtn").hidden=!ready; $("#htmlBtn").hidden=!ready||mode==="images"; $("#editBtn").hidden=!planLike||!current;
}
function setEdit(on){
  const doc=frame().contentDocument; if(doc) try{ doc.designMode=on?"on":"off"; }catch(e){}
  $("#frameWrap").classList.toggle("editing",on);
  $("#editBtn").textContent=on?"إنهاء التعديل":"تعديل النصوص";
  $("#editBtn").dataset.on=on?"1":"";
}
function currentHtml(){
  const doc=frame().contentDocument; if(!doc||!current) return null;
  const was=doc.designMode; try{ doc.designMode="off"; }catch(e){}
  const html="<!DOCTYPE html>\n"+doc.documentElement.outerHTML;
  if(was==="on") try{ doc.designMode="on"; }catch(e){}
  return html;
}
function fileBase(kind){
  const d=current.d; let slug=hostLabel(d.url)||"client";
  slug=slug.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"client";
  return `Sahl-${kind==="app"?"App-Plan":"Plan"}-${slug}-${new Date().toISOString().slice(0,10)}`;
}
function needPlan(){ if(!current){ status("اكتب الخطة الأول. القالب الأصلي فيه محتوى عميل قديم ومينفعش يتبعت.","warn"); return false; } return true; }
function exportHtml(){
  if(!needPlan()) return;
  const html=currentHtml(); if(!html) return;
  saveBlob(new Blob([html],{type:"text/html;charset=utf-8"}),fileBase(current.tpl.kind)+".html");
  status(`نزل الملف: ${fileBase(current.tpl.kind)}.html — بيتفتح في أي متصفح على الموبايل أو الكمبيوتر.`,"ok");
}
function makeRenderFrame(html,width,css){
  return new Promise((res,rej)=>{
    const host=$("#renderHost"); host.replaceChildren();
    const f=el("iframe",{sandbox:"allow-scripts allow-same-origin",style:`width:${width}px;height:1000px`});
    const inj=`<style id="__pdf">${css||""}</style><script src="${LIBS.h2c}"><\/script>`;
    f.srcdoc=html.replace(/<\/head>/i,inj+"</head>");
    f.onload=()=>res(f); f.onerror=rej;
    host.append(f);
    setTimeout(()=>rej(new Error("render timeout")),60000);
  });
}
async function waitFrameReady(f){
  const w=f.contentWindow, d=f.contentDocument;
  for(let i=0;i<100 && !w.html2canvas;i++) await sleep(100);
  if(!w.html2canvas) throw new Error("html2canvas");
  try{ await d.fonts.ready; }catch(e){}
  await sleep(900);
  fixColors(d,w);
}
function fixColors(doc,w){
  // html2canvas 1.4 can't parse color()/oklch()/lab() that modern CSS computes to; flatten them to rgba
  const cv=doc.createElement("canvas"); cv.width=cv.height=1; const cx=cv.getContext("2d",{willReadFrequently:true}); const cache=new Map();
  const conv=c=>{ if(cache.has(c)) return cache.get(c); let r=c;
    const m=/^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)$/.exec(c);
    if(m){ r=`rgba(${Math.round(m[1]*255)},${Math.round(m[2]*255)},${Math.round(m[3]*255)},${m[4]===undefined?1:+m[4]})`; }
    else { try{ cx.clearRect(0,0,1,1); cx.fillStyle="#000"; cx.fillStyle=c; cx.fillRect(0,0,1,1); const d=cx.getImageData(0,0,1,1).data; r=`rgba(${d[0]},${d[1]},${d[2]},${(d[3]/255).toFixed(3)})`; }catch(e){} }
    cache.set(c,r); return r; };
  const RX=/(?:color|oklch|oklab|lab|lch|color-mix)\((?:[^()]|\([^()]*\))*\)/g;
  const props=["color","background-color","background-image","border-top-color","border-right-color","border-bottom-color","border-left-color","outline-color","box-shadow","text-shadow","fill","stroke","text-decoration-color","caret-color","column-rule-color"];
  // letter-spacing breaks Arabic joining in html2canvas
  for(const e of doc.querySelectorAll("body *")){ if(/[\u0600-\u06FF]/.test(e.textContent||"")){ const ls=w.getComputedStyle(e).letterSpacing; if(ls&&ls!=="normal"&&parseFloat(ls)!==0) e.style.setProperty("letter-spacing","0","important"); } }
  // gradient text (background-clip:text) is not supported by html2canvas: paint it with the gradient's main color
  for(const e of doc.querySelectorAll("*")){
    const cs=w.getComputedStyle(e);
    const clip=cs.getPropertyValue("-webkit-background-clip")||cs.getPropertyValue("background-clip");
    if(/text/.test(clip)){
      const bg=cs.getPropertyValue("background-image"); const cols=bg.match(/(?:rgba?|color|oklch|oklab|lab|lch)\((?:[^()]|\([^()]*\))*\)|#[0-9a-f]{3,8}/gi)||[];
      let c=cols[Math.min(1,cols.length-1)]||cs.color; c=c.replace(RX,conv);
      e.style.setProperty("background-image","none","important"); e.style.setProperty("background-color","transparent","important");
      e.style.setProperty("-webkit-text-fill-color",c,"important"); e.style.setProperty("color",c,"important");
    }
  }
  for(const e of doc.querySelectorAll("*")){
    const cs=w.getComputedStyle(e);
    for(const pr of props){ const v=cs.getPropertyValue(pr); if(v && RX.test(v)){ RX.lastIndex=0; e.style.setProperty(pr,v.replace(RX,conv),"important"); } RX.lastIndex=0; }
    for(const pe of ["::before","::after"]){ const ps=w.getComputedStyle(e,pe); if(!ps||ps.content==="none") continue;
      for(const pr of ["color","background-color","background-image","border-top-color","border-bottom-color","box-shadow"]){ const v=ps.getPropertyValue(pr); if(v && RX.test(v)){ RX.lastIndex=0; e.dataset.fx=(e.dataset.fx||"")+1; } RX.lastIndex=0; } }
  }
  // pseudo-elements: rewrite their rules by cloning computed values into a stylesheet
  let css="", k=0;
  doc.querySelectorAll("[data-fx]").forEach(e=>{ const id="fx"+(k++); e.setAttribute("data-fxid",id);
    for(const pe of ["::before","::after"]){ const ps=w.getComputedStyle(e,pe); if(ps.content==="none") continue; let decl="";
      for(const pr of ["color","background-color","background-image","border-top-color","border-bottom-color","box-shadow"]){ const v=ps.getPropertyValue(pr); if(v && RX.test(v)){ RX.lastIndex=0; decl+=`${pr}:${v.replace(RX,conv)}!important;`; } RX.lastIndex=0; }
      if(decl) css+=`[data-fxid="${id}"]${pe}{${decl}}`; } });
  if(css){ const st=doc.createElement("style"); st.textContent=css; doc.head.append(st); }
}
function cutPoints(doc,H,pageH,top0){
  // y positions where cutting would split text or a card
  const bad=[]; const cap=pageH*0.45;
  doc.querySelectorAll("p,li,h1,h2,h3,h4,h5,h6,tr,img,svg,dt,dd,summary,details,blockquote,pre,.card,[class*=card],[class*=item],[class*=kpi],[class*=pill],[class*=tier],[class*=step],[class*=month],[class*=layer],[class*=chip],[class*=model],[class*=pillar],[class*=hook],[class*=fstep],[class*=im],[class*=goal],[class*=ov],[class*=stp]").forEach(e=>{
    const r=e.getBoundingClientRect(); const t=r.top+top0, b=r.bottom+top0; if(r.height>2 && r.height<cap) bad.push([t,b]);
  });
  bad.sort((a,b)=>a[0]-b[0]);
  return y=>{ let c=y, moved=true, guard=0; while(moved && guard++<200){ moved=false; for(const [t,b] of bad){ if(t<c-1 && b>c+1){ c=t-2; moved=true; } } } return c; };
}
async function downloadPdf(){
  if(!needPlan()) return;
  const btn=$("#pdfBtn"); if(btn.disabled) return;
  btn.disabled=true; const old=btn.innerHTML; btn.innerHTML='<span class="spin"></span> بيجهّز الـ PDF';
  try{
    await loadScript(LIBS.pdf);
    const {jsPDF}=window.jspdf; const tpl=current.tpl;
    const html=currentHtml();
    const f=await makeRenderFrame(html,tpl.paged?Math.max(tpl.width,1400):tpl.width,tpl.pdfCss);
    await waitFrameReady(f);
    const w=f.contentWindow, doc=f.contentDocument;
    let pdf=null;
    if(tpl.paged){
      const pages=[...doc.querySelectorAll(tpl.paged.sel)].filter(p=>p.offsetHeight>0);
      f.style.height=(doc.documentElement.scrollHeight+50)+"px"; await sleep(200);
      for(let i=0;i<pages.length;i++){
        btn.innerHTML=`<span class="spin"></span> صفحة ${i+1} من ${pages.length}`;
        const p=pages[i]; const pw=p.offsetWidth, ph=p.offsetHeight;
        const cv=await w.html2canvas(p,{scale:pw<700?3:2,backgroundColor:null,logging:false,useCORS:true});
        const wpt=pw*0.75, hpt=ph*0.75;
        if(!pdf) pdf=new jsPDF({unit:"pt",format:[wpt,hpt],orientation:wpt>hpt?"landscape":"portrait",compress:true}); else pdf.addPage([wpt,hpt],wpt>hpt?"landscape":"portrait");
        pdf.addImage(cv.toDataURL("image/jpeg",0.9),"JPEG",0,0,wpt,hpt,undefined,"FAST");
      }
    } else {
      const W=tpl.width, H0=doc.documentElement.scrollHeight;
      f.style.height=H0+"px"; await sleep(400);
      const H=doc.documentElement.scrollHeight;
      const pageH=Math.round(W*297/210), pad=36;
      const fix=cutPoints(doc,H,pageH,w.scrollY||0);
      const bg=getComputedStyle(doc.body).backgroundColor; const bgc=(bg&&!/rgba\(0, 0, 0, 0\)|transparent/.test(bg))?bg:(getComputedStyle(doc.documentElement).backgroundColor||"#ffffff");
      const slices=[]; let y=0;
      while(y<H-4){ const room=pageH-(slices.length?pad*2:pad); let end=Math.min(H,y+room); if(end<H){ const c=fix(end); end=(c>y+room*0.35)?c:end; } slices.push([y,end]); y=end; }
      pdf=new jsPDF({unit:"pt",format:"a4",orientation:"portrait",compress:true});
      const k=595.28/W;
      for(let i=0;i<slices.length;i++){
        btn.innerHTML=`<span class="spin"></span> صفحة ${i+1} من ${slices.length}`;
        const [a,b]=slices[i];
        const cv=await w.html2canvas(doc.documentElement,{x:0,y:a,width:W,height:b-a,scale:2,windowWidth:W,windowHeight:H,backgroundColor:bgc,logging:false,useCORS:true,scrollX:0,scrollY:0});
        if(i) pdf.addPage("a4","portrait");
        pdf.setFillColor(bgc.startsWith("rgb")?bgc.match(/\d+/g).slice(0,3).map(Number)[0]:255, ...(bgc.startsWith("rgb")?bgc.match(/\d+/g).slice(1,3).map(Number):[255,255]));
        pdf.rect(0,0,595.28,841.89,"F");
        const top=(i?pad:0)*k;
        pdf.addImage(cv.toDataURL("image/jpeg",0.9),"JPEG",0,top,595.28,(b-a)*k,undefined,"FAST");
      }
    }
    pdf.setProperties({title:frame().contentDocument.title,author:COMPANY,creator:"منشئ خطط شراع"});
    saveBlob(pdf.output("blob"),fileBase(tpl.kind)+".pdf");
    $("#renderHost").replaceChildren();
    status(`نزل الملف: ${fileBase(tpl.kind)}.pdf`,"ok");
  }catch(e){
    console.error(e);
    status("مقدرتش أجهّز الـ PDF. اتأكد من النت (الأداة بتحمّل مكتبة الـ PDF أول مرة) وجرّب تاني.","bad");
  }finally{ btn.disabled=false; btn.innerHTML=old; }
}

/* =====================================================================
   FORM UI
   ===================================================================== */
let mode="plan";
function syncPmode(){
  const vip=(document.querySelector('input[name=pmode]:checked')||{}).value==="vip";
  $("#nameReq").hidden=vip;
  $("#storeName").placeholder=vip?"اختياري، مثال: عود الريان":"مثال: عود الريان";
  $("#nameHint").textContent=vip?"الخطة الـ VIP بتفتح موقع المتجر وتقرأ منتجاته وأقسامه، وبتكتب بموديل أقوى. لو سبت الاسم فاضي، بتجيبه من الموقع.":"الخطة السريعة مش بتفتح الموقع. بتتكتب من نوع المنتجات واسم المتجر وملاحظاتك، فاكتب في الملاحظات أي تفاصيل مهمة عن المتجر.";
}
function buildCats(){
  const sel=$("#cat"); CATS.forEach(c=>sel.append(el("option",{value:c,text:c}))); sel.append(el("option",{value:"__other",text:"أخرى (اكتبها)"}));
  sel.addEventListener("change",()=>{ const o=sel.value==="__other"; $("#catOther").hidden=!o; if(o) $("#catOther").focus(); });
}
let selPkg={plan:"",app:""}, pkgFilter="all";
function pkgCard(p,interactive){
  const card=el("div",{class:"pkg-card"+(selPkg[mode]===p.id?" sel":""),tabindex:interactive?"0":null,role:interactive?"button":null,"data-id":p.id});
  card.append(el("h3",{text:p.name}));
  const bd=el("div",{class:"pkg-badges"}); bd.append(el("span",{text:durTxt(p.months)}));
  if(p.inf) bd.append(el("span",{text:infPhrase(p.inf)})); if(p.app) bd.append(el("span",{class:"app",text:p.app}));
  card.append(bd, el("div",{class:"pkg-price"},"السعر من ",el("b",{text:fmtNum(p.min)})," لـ ",el("b",{text:fmtNum(p.max)})," ر.س"));
  const ul=el("ul"); p.items.forEach(t=>ul.append(el("li",{text:t}))); card.append(ul);
  const sc=pkgSched(p); if(sc.length) card.append(el("div",{class:"pk-sched",text:sc.join(" · ")}));
  return card;
}
function pkgMatches(p){
  if(mode==="app"?p.kind!=="app":p.kind==="app") return false;
  const q=($("#pkgSearch").value||"").trim();
  if(q && !(p.name+" "+p.items.join(" ")+" "+durTxt(p.months)).includes(q)) return false;
  if(pkgFilter==="full") return ["seo","social","ads"].every(k=>p.svc.includes(k));
  if(pkgFilter==="inf") return p.svc.length===1&&p.svc[0]==="influencers"&&!p.app;
  if(pkgFilter==="app") return !!p.app;
  if(pkgFilter==="short") return p.months<=3;
  if(pkgFilter==="long") return p.months>=4;
  return true;
}
function renderPkgList(){
  const box=$("#pkgList"); box.replaceChildren();
  const list=PACKAGES.filter(pkgMatches).sort((a,b)=>a.months-b.months||a.min-b.min);
  if(!list.length){ box.append(el("p",{class:"hint",text:"مفيش باقة بالبحث ده."})); return; }
  list.forEach(p=>box.append(pkgCard(p,true)));
}
function openPkg(){
  const f=$("#pkgFilters"); f.replaceChildren();
  const opts=mode==="app"?[["all","الكل"]]:[["all","الكل"],["full","فل باكدج"],["inf","مشاهير بس"],["app","مع تطبيق"],["short","3 شهور أو أقل"],["long","4 شهور وأكتر"]];
  opts.forEach(([k,t])=>f.append(el("button",{type:"button","data-f":k,"aria-pressed":String(pkgFilter===k)},t)));
  if(!opts.some(o=>o[0]===pkgFilter)) pkgFilter="all";
  renderPkgList(); const dlg=$("#pkgDlg"); if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","");
}
function closePkg(){ const dlg=$("#pkgDlg"); if(dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
function choosePkg(id){ selPkg[mode]=id; store.set("sahl_pkg_"+mode,id); closePkg(); syncPkg(); saveDraft(); }
function syncPkg(){
  const p=PKG[selPkg[mode]]; const isPlan=mode==="plan";
  const sum=$("#pkgSum"); sum.replaceChildren(); if(p) sum.append(pkgCard(p,false));
  $("#pkgOpen").textContent=p?"غيّر الباقة":"اختار من الباقات"; $("#pkgClear").hidden=!p;
  $("#durStep").hidden=!isPlan||!!p; $("#svcStep").hidden=!isPlan||!!p;
  let n=2; $("#pkgN").textContent=n++; if(isPlan&&!p){ $("#durN").textContent=n++; $("#svcN").textContent=n++; } $("#tplN").textContent=n++; $("#priceN").textContent=n++;
  $("#price").placeholder=p?`من ${fmtNum(p.min)} لـ ${fmtNum(p.max)}`:""; $("#was").placeholder=p?`مثال: ${fmtNum(p.max)}`:"اختياري";
}
function bootPkg(){
  selPkg.plan=store.get("sahl_pkg_plan",""); selPkg.app=store.get("sahl_pkg_app","");
  if(!PKG[selPkg.plan]) selPkg.plan=""; if(!PKG[selPkg.app]) selPkg.app="";
  $("#pkgOpen").addEventListener("click",openPkg); $("#pkgClose").addEventListener("click",closePkg);
  $("#pkgClear").addEventListener("click",()=>{ selPkg[mode]=""; store.set("sahl_pkg_"+mode,""); syncPkg(); saveDraft(); });
  $("#pkgSearch").addEventListener("input",renderPkgList);
  $("#pkgFilters").addEventListener("click",e=>{ const b=e.target.closest("button[data-f]"); if(!b) return; pkgFilter=b.dataset.f; [...$("#pkgFilters").children].forEach(x=>x.setAttribute("aria-pressed",String(x===b))); renderPkgList(); });
  $("#pkgList").addEventListener("click",e=>{ const c=e.target.closest(".pkg-card[data-id]"); if(c) choosePkg(c.dataset.id); });
  $("#pkgList").addEventListener("keydown",e=>{ if(e.key!=="Enter"&&e.key!==" ") return; const c=e.target.closest(".pkg-card[data-id]"); if(c){ e.preventDefault(); choosePkg(c.dataset.id); } });
  $("#pkgDlg").addEventListener("click",e=>{ if(e.target.id==="pkgDlg") closePkg(); });
}
function syncInf(){
  const dur=+((document.querySelector('input[name=dur]:checked')||{}).value||3), fixed=INF_BY_DUR[dur];
  $("#infPick").hidden=!!fixed;
  $("#infHint").textContent=fixed?`باقة ${DUR_TXT[dur]} فيها ${infPhrase(fixed)}.`:`باقة ${DUR_TXT[dur]}: اختار من 3 لـ 6 مشاهير.`;
}
function buildServices(){
  const box=$("#svcs");
  for(const s of SERVICES){
    const id="svc_"+s.key;
    let body=null;
    if(s.key==="influencers"){
      const sel=el("select",{id:"infCount",name:"infCount"}); [3,4,5,6].forEach(n=>sel.append(el("option",{value:n,text:infPhrase(n)}))); sel.value="6";
      body=el("div",{class:"svc-b"},el("div",{class:"inline",id:"infPick"},el("label",{for:"infCount",class:"lbl",text:"عدد المشاهير"}),sel),el("span",{class:"hint",id:"infHint"}));
    }
    const card=el("div",{class:"svc",id:id+"_card"},el("label",{class:"svc-h",for:id},el("input",{type:"checkbox",id,name:"svc",value:s.key}),el("b",{text:s.label}),el("small",{text:s.hint})),body);
    box.append(card);
    card.querySelector("#"+id).addEventListener("change",e=>card.classList.toggle("on",e.target.checked));
  }
}
function buildTemplates(){
  const box=$("#tpls"); box.replaceChildren();
  TEMPLATES.filter(t=>t.kind===(mode==="app"?"app":"plan")).forEach(t=>{
    const id="tp_"+t.id;
    const inp=el("input",{type:"radio",name:"tpl",id,value:t.id});
    box.append(inp,el("label",{for:id},el("img",{src:thumbOf(t.id),alt:"",loading:"lazy"}),el("span",{class:"nm",text:t.name}),el("span",{class:"nt",text:t.note})));
    inp.addEventListener("change",()=>{ saveDraft(); if(genBusy){ status("الخطة لسه بتتكتب. القالب الجديد هيتطبّق في الخطة الجاية.","warn"); return; } if(!current||current.tpl.id!==t.id||current.tpl.kind!==t.kind){ current=null; lastPlan[mode]=null; showOriginal(); } });
  });
  const want=store.get(mode==="app"?"sahl_tpl_app":"sahl_tpl_plan","");
  const pick=box.querySelector(`input[value="${want}"]`)||box.querySelector("input");
  pick.checked=true;
}
function showOriginal(){
  const id=readForm().tpl; if(!id) return;
  getTpl(id).then(h=>{ if(readForm().tpl===id && !current) showInFrame(h,true,id); }).catch(()=>status("مقدرتش أحمّل القالب. اتأكد من النت وحدّث الصفحة.","bad"));
}
function saveDraft(){
  const d=readForm(); delete d.pkg;
  store.set("sahl_plan_draft",JSON.stringify(d));
  if(d.tpl) store.set(mode==="app"?"sahl_tpl_app":"sahl_tpl_plan",d.tpl);
}
function loadDraft(){
  let d; try{d=JSON.parse(store.get("sahl_plan_draft","null"))}catch(e){d=null}
  if(!d) return false;
  if(d.url) $("#url").value=d.url; if(d.notes) $("#notes").value=d.notes;
  if(d.catSel){ $("#cat").value=d.catSel; } if(d.catOther) $("#catOther").value=d.catOther; $("#catOther").hidden=$("#cat").value!=="__other";
  if(d.storeName) $("#storeName").value=d.storeName;
  if(d.pmode==="vip") $("#pmVip").checked=true;
  if(d.infPick) $("#infCount").value=String(d.infPick);
  if(d.price!=null) $("#price").value=d.price; if(d.was!=null) $("#was").value=d.was;
  const r=document.querySelector(`input[name=dur][value="${d.dur}"]`); if(r) r.checked=true;
  for(const k of d.services||[]){ const c=$("#svc_"+k); if(c){c.checked=true;c.dispatchEvent(new Event("change"));} }
  return true;
}
function validate(d){
  const errs=[];
  if(!normUrl(d.url)) errs.push("رابط المتجر (رابط صحيح)");
  if(!d.cat) errs.push(d.catSel==="__other"?"نوع المنتجات (اكتبه)":"نوع المنتجات");
  if(d.pmode!=="vip" && !d.storeName) errs.push("اسم المتجر بالعربي (مطلوب في الخطة السريعة)");
  if(mode==="plan" && !d.services.length) errs.push("خدمة واحدة على الأقل");
  if(d.price==null || !(d.price>0)) errs.push("السعر بعد الخصم");
  if(!errs.length && d.pkg && d.price<d.pkg.min && !confirm(`السعر ${fmtNum(d.price)} ر.س أقل من الحد الأدنى للباقة (${fmtNum(d.pkg.min)} ر.س). تكمّل؟`)) return false;
  $("#svcErr").hidden = mode!=="plan" || d.services.length>0;
  const fe=$("#formErr");
  if(errs.length){ fe.textContent="ناقص: "+errs.join("، ")+"."; fe.hidden=false; fe.scrollIntoView({block:"center",behavior:"smooth"}); } else fe.hidden=true;
  return errs.length===0;
}
function setMode(m){
  if(genBusy && (m==="plan"||m==="app") && m!==genBusy){ status(`استنى ${genBusy==="app"?"خطة التطبيق":"الخطة التسويقية"} اللي شغالة تخلص الأول، وبعدين ادخل ${m==="app"?"خطة التطبيق":"الخطة التسويقية"}. تقدر تشتغل على عرض السعر أو الإنذار أو الصور لحد ما تخلص.`,"warn"); return; }
  if((mode==="plan"||mode==="app") && current){ const h=currentHtml(); if(h) current.html=h; lastPlan[mode]=current; }
  mode=m;
  ["Plan","App","Quote","Notice","Images"].forEach(x=>$("#mode"+x).setAttribute("aria-pressed",String(m===x.toLowerCase())));
  const isQ=m==="quote", isN=m==="notice", isI=m==="images", isDoc=isQ||isN||isI;
  $("#f").hidden=isDoc; $("#q").hidden=!isQ; $("#n").hidden=!isN; $("#im").hidden=!isI; $("#imagesView").hidden=!isI;
  $("#durStep").hidden=m!=="plan"; $("#svcStep").hidden=m!=="plan";
  if(m==="plan"||m==="app") syncPkg();
  $("#frameWrap").hidden=isDoc; $("#quoteView").hidden=!isQ; $("#noticeView").hidden=!isN;
  $("#pvName").textContent=isI?"معاينة الصور":isQ?"معاينة عرض السعر":isN?"معاينة الإنذار":m==="app"?"معاينة خطة التطبيق":"معاينة الخطة";
  status("");
  if(isQ){ $("#pvHint").textContent="اختار الباقات واكتب السعر، والعرض بيتحدّث على طول. تقدر تعدّل المقدمة واسم الباقة بالضغط عليهم."; renderQuote(); $("#exTag").hidden=Q.sel.length>0; }
  else if(isI){ $("#pvHint").textContent="الصور بتظهر هنا بنفس ترتيب القايمة. غيّر الترتيب بالأسهم، وبعدين اضغط «تنزيل PDF»."; $("#exTag").hidden=true; renderImages(); }
  else if(isN){ $("#pvHint").textContent="اكتب بيانات العميل والمبلغ، والإنذار بيتحدّث على طول. تقدر تعدّل أي فقرة بالضغط عليها قبل التنزيل."; renderNotice(); }
  else { if(!genBusy) $("#genTxt").textContent=m==="app"?"اكتب خطة التطبيق بـ Gemini":"اكتب الخطة بـ Gemini";
    current=null; buildTemplates();
    const lp=lastPlan[m];
    if(lp && !genBusy){ const r=document.querySelector(`input[name=tpl][value="${lp.tpl.id}"]`); if(r) r.checked=true; current=lp; showInFrame(lp.html,false,lp.tpl.id); }
    else if(!genBusy) showOriginal(); }
  syncButtons();
  store.set("sahl_mode",m);
}

/* =====================================================================
   IMAGES -> ONE PDF
   ===================================================================== */
const IM=[]; // {id,name,url,img,w,h}
let imSeq=0;
function addImageFiles(files){
  const list=[...files].filter(f=>/^image\//.test(f.type));
  if(!list.length){ status("الملف ده مش صورة. اختار صور PNG أو JPG.","warn"); return; }
  // load all, then add in the same order they were picked
  Promise.all(list.map(f=>new Promise(res=>{ const url=URL.createObjectURL(f); const img=new Image();
    img.onload=()=>res({id:++imSeq,name:f.name||("image-"+imSeq+".png"),url,img,w:img.naturalWidth,h:img.naturalHeight});
    img.onerror=()=>{ URL.revokeObjectURL(url); status(`مقدرتش أفتح الصورة ${f.name}. لو صيغتها HEIC (صور الآيفون) حوّلها لـ JPG الأول.`,"bad"); res(null); };
    img.src=url; }))).then(items=>{ items.forEach(x=>{ if(x) IM.push(x); }); renderImages(); });
}
function renderImages(){
  const ul=$("#imList"); ul.replaceChildren();
  IM.forEach((it,i)=>{ const li=el("li",{},el("img",{src:it.url,alt:""}),el("span",{class:"nm",text:it.name}),
      el("button",{type:"button",title:"لفوق","aria-label":"حرّك لفوق",disabled:i===0,"data-a":"up","data-i":i},"↑"),
      el("button",{type:"button",title:"لتحت","aria-label":"حرّك لتحت",disabled:i===IM.length-1,"data-a":"down","data-i":i},"↓"),
      el("button",{type:"button",title:"امسح","aria-label":"امسح الصورة","data-a":"del","data-i":i},"✕"));
    ul.append(li); });
  $("#imCount").textContent=IM.length?`${IM.length} صورة. اللي فوق في القايمة بتبقى فوق في الملف.`:"";
  const v=$("#imStackView"); v.replaceChildren(); v.classList.toggle("sep",$("#imSep").checked && (document.querySelector('input[name=imLayout]:checked')||{}).value!=="pages");
  if(!IM.length) v.append(el("div",{class:"im-empty",text:"لسه مفيش صور. ضيف صورتين أو أكتر من الخانة اللي على الجنب."}));
  else IM.forEach(it=>v.append(el("img",{src:it.url,alt:it.name})));
  if(IM.length && !$("#imErr").hidden){ $("#imErr").hidden=true; status(""); }
}
function moveImage(a,i){ if(a==="del"){ const [x]=IM.splice(i,1); URL.revokeObjectURL(x.url); } else { const j=a==="up"?i-1:i+1; if(j<0||j>=IM.length) return; [IM[i],IM[j]]=[IM[j],IM[i]]; } renderImages(); }
function imagesFile(){ let n=($("#imName").value||"").trim().replace(/\.pdf$/i,"").replace(/[^A-Za-z0-9_-]+/g,"-").replace(/^-+|-+$/g,""); return (n||"Sahl-Images-"+new Date().toISOString().slice(0,10))+".pdf"; }
function imageJpeg(it,maxW){
  const w=Math.min(it.w,maxW), h=Math.round(it.h*w/it.w);
  const c=document.createElement("canvas"); c.width=w; c.height=h; const x=c.getContext("2d");
  x.fillStyle="#ffffff"; x.fillRect(0,0,w,h); x.drawImage(it.img,0,0,w,h);
  return {data:c.toDataURL("image/jpeg",0.9),w,h};
}
async function imagesPdf(){
  if(IM.length<1){ const e=$("#imErr"); e.textContent="ضيف صورة واحدة على الأقل."; e.hidden=false; status("ضيف صورة واحدة على الأقل.","warn"); return; }
  const btn=$("#pdfBtn"); if(btn.disabled) return;
  btn.disabled=true; const old=btn.innerHTML; btn.innerHTML='<span class="spin"></span> بيجهّز الـ PDF';
  try{
    await loadScript(LIBS.pdf); const { jsPDF } = window.jspdf;
    const layout=(document.querySelector('input[name=imLayout]:checked')||{}).value||"stack";
    const PW=595.28, MAXH=14000; let pdf=null;
    if(layout==="pages"){
      const PH=841.89, M=24;
      IM.forEach((it,i)=>{ const j=imageJpeg(it,1800); const k=Math.min((PW-2*M)/j.w,(PH-2*M)/j.h); const w=j.w*k, h=j.h*k;
        if(!pdf) pdf=new jsPDF({unit:"pt",format:"a4",orientation:"portrait",compress:true}); else pdf.addPage("a4","portrait");
        pdf.addImage(j.data,"JPEG",(PW-w)/2,(PH-h)/2,w,h,undefined,"FAST"); });
    } else {
      // all images stacked, same width; split into several tall pages only if the PDF would be too tall to open
      const GAP=$("#imSep").checked?28:0;   // white space with a thin line between images
      const items=IM.map(it=>{ const j=imageJpeg(it,1600); return {j,h:j.h*PW/j.w}; });
      const pages=[]; let cur=[], hsum=0;
      for(const x of items){ const add=x.h+(cur.length?GAP:0); if(cur.length && hsum+add>MAXH){ pages.push(cur); cur=[]; hsum=0; } hsum+=cur.length?GAP+x.h:x.h; cur.push(x); }
      if(cur.length) pages.push(cur);
      pages.forEach(pg=>{ const H=Math.min(MAXH,pg.reduce((a,x)=>a+x.h,0)+GAP*(pg.length-1));
        if(!pdf) pdf=new jsPDF({unit:"pt",format:[PW,H],orientation:"portrait",compress:true}); else pdf.addPage([PW,H],"portrait");
        let y=0; pg.forEach((x,k)=>{ if(k&&GAP){ pdf.setDrawColor(208,215,212); pdf.setLineWidth(1); pdf.line(40,y+GAP/2,PW-40,y+GAP/2); y+=GAP; }
          const h=Math.min(x.h,MAXH); const w=h<x.h?PW*h/x.h:PW; pdf.addImage(x.j.data,"JPEG",(PW-w)/2,y,w,h,undefined,"FAST"); y+=h; }); });
    }
    pdf.setProperties({title:imagesFile().replace(/\.pdf$/,""),creator:COMPANY});
    saveBlob(pdf.output("blob"),imagesFile());
    status(`نزل الملف: ${imagesFile()} (${IM.length} صورة).`,"ok");
  }catch(e){ console.error(e); status("مقدرتش أعمل الـ PDF. جرّب صور أصغر أو حدّث الصفحة.","bad"); }
  finally{ btn.disabled=false; btn.innerHTML=old; }
}
function bootImages(){
  $("#imFile").addEventListener("change",e=>{ addImageFiles(e.target.files); e.target.value=""; });
  const dz=$("#imDrop");
  ["dragenter","dragover"].forEach(t=>dz.addEventListener(t,e=>{ e.preventDefault(); dz.classList.add("over"); }));
  ["dragleave","drop"].forEach(t=>dz.addEventListener(t,e=>{ e.preventDefault(); dz.classList.remove("over"); }));
  dz.addEventListener("drop",e=>{ if(e.dataTransfer&&e.dataTransfer.files) addImageFiles(e.dataTransfer.files); });
  $("#imSep").addEventListener("change",renderImages);
  document.querySelectorAll('input[name=imLayout]').forEach(r=>r.addEventListener("change",()=>{ $("#imSep").closest("label").hidden=r.value==="pages"&&r.checked; renderImages(); }));
  $("#imList").addEventListener("click",e=>{ const b=e.target.closest("button[data-a]"); if(b) moveImage(b.dataset.a,+b.dataset.i); });
  document.addEventListener("paste",e=>{ if(mode!=="images") return; const fs=[...(e.clipboardData&&e.clipboardData.files||[])]; if(fs.length){ e.preventDefault(); addImageFiles(fs); } });
  renderImages();
}

/* =====================================================================
   PAYMENT NOTICE (إنذار نهائي بالسداد)
   ===================================================================== */
const STAMPS={
  sheraa:{label:"ختم شراع الآفاق المتقدمة",note:"مؤسسة شراع الآفاق المتقدمة للتجارة والاستثمار · الرقم الوطني الموحد 7054121681",img:AS.stampMain,cls:"",
    entity:"مؤسسة شراع الآفاق المتقدمة للتجارة والاستثمار",idLabel:"الرقم الوطني الموحد",idVal:"7054121681"}
};
function tafqeet(num){
  num=Math.floor(Math.abs(num)); if(!num) return "صفر";
  const ones=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"];
  const tens=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"];
  const hund=["","مائة","مائتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانمائة","تسعمائة"];
  const b1000=n=>{ const h=Math.floor(n/100), r=n%100, out=[]; if(h) out.push(hund[h]);
    if(r){ if(r<20) out.push(ones[r]); else { const u=r%10,t=Math.floor(r/10); out.push(u?ones[u]+" و"+tens[t]:tens[t]); } } return out.join(" و"); };
  const scale=(n,one,two,few,many,acc)=>{ if(n===1) return one; if(n===2) return two; if(n<=10) return b1000(n)+" "+few;
    const r=n%100; if(r>=11) return b1000(n)+" "+acc; if(r===0) return b1000(n).replace(/مائتان$/,"مائتا")+" "+many; if(r>=3) return b1000(n)+" "+few; return b1000(n)+" "+many; };
  const parts=[]; const m=Math.floor(num/1e6), k=Math.floor(num%1e6/1000), r=num%1000;
  if(m) parts.push(scale(m,"مليون","مليونان","ملايين","مليون","مليونًا"));
  if(k) parts.push(scale(k,"ألف","ألفان","آلاف","ألف","ألفًا"));
  if(r) parts.push(b1000(r));
  return parts.join(" و");
}
function daysTxt(n){ n=+n||3; if(n===1) return "يوم عمل واحد"; if(n===2) return "يومَي عمل"; if(n<=10) return `${n} أيام عمل`; return `${n} يوم عمل`; }
function arDate(v){ const d=v?new Date(v+"T12:00:00"):new Date(); if(isNaN(d)) return ""; return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}م`; }
function nextRef(){ const y=new Date().getFullYear(); const k=+store.get("sahl_ntc_"+y,"0")+1; return `NTC-${y}/${String(k).padStart(3,"0")}`; }
function shortName(full){ const w=full.trim().split(/\s+/).filter(x=>!/^(بن|ابن|بنت)$/.test(x)); return w.length>2?w[0]+" "+w[w.length-1]:w.join(" "); }
function readN(){ const sig=(document.querySelector('input[name=nsig]:checked')||{}).value||"sheraa";
  return {name:$("#nName").value.trim(),title:$("#nTitle").value,rep:$("#nRep").value.trim(),addr:$("#nAddr").value.trim(),email:$("#nEmail").value.trim(),site:$("#nSite").value.trim(),cphone:$("#nCPhone").value.trim(),docType:$("#nDocType").value,docNo:$("#nDocNo").value.trim(),
    amount:Math.max(0,Math.round(+$("#nAmount").value||0)),days:Math.max(1,Math.round(+$("#nDays").value||3)),date:$("#nDate").value,ref:$("#nRef").value.trim(),sig}; }
function buildNotice(){
  const box=$("#nSigs");
  Object.entries(STAMPS).forEach(([k,v],i)=>{ const id="nsig_"+k;
    box.append(el("input",{type:"radio",name:"nsig",id,value:k,checked:i===0}),el("label",{for:id},el("img",{src:v.img,alt:""}),el("span",{},el("b",{text:v.label}),el("small",{text:v.note})))); });
  $("#nDate").value=new Date().toISOString().slice(0,10); $("#nRef").value=nextRef();
  loadN();
  $("#n").addEventListener("input",()=>{ saveN(); renderNotice(); if(!$("#nErr").hidden){ $("#nErr").hidden=true; status(""); } });
  $("#n").addEventListener("change",()=>{ saveN(); renderNotice(); });
}
function saveN(){ const d=readN(); delete d.ref; delete d.date; delete d.amount; store.set("sahl_notice_draft",JSON.stringify(d)); }
function loadN(){ let d; try{d=JSON.parse(store.get("sahl_notice_draft","null"))}catch(e){d=null} if(!d) return;
  if(d.addr) $("#nAddr").value=d.addr; if(d.days) $("#nDays").value=d.days;
  const r=$("#nsig_"+d.sig); if(r) r.checked=true; }
function renderNotice(){
  const d=readN(), S=STAMPS[d.sig]; const host=$("#nScale"); host.replaceChildren();
  const amt=d.amount?fmtNum(d.amount):"0"; const words=d.amount?`${tafqeet(d.amount)} ريال سعودي`:"";
  $("#nWords").textContent=d.amount?`بالحروف: فقط ${words} لا غير`:"";
  const nm=d.name||"اسم العميل", sn=d.name?shortName(d.name):"اسم العميل", ttl=d.title?d.title+"/ ":"";
  const pg=el("div",{class:"npage",id:"npage"}); 
  pg.innerHTML=`
  <div class="n-head"><div class="t"><img src="${LOGO_LIGHT}" alt="شراع للتسويق الإلكتروني"><h1>إنذار نهائي بالسداد وتكليف بالوفاء</h1><div class="sub">إشعار رسمي قبل اتخاذ الإجراءات النظامية والقضائية</div></div>
    <div class="n-meta"><b>التاريخ:</b><span>${esc(arDate(d.date))}</span><b>رقم المرجع:</b><span dir="ltr">${esc(d.ref)}</span><b>النوع:</b><span>إعذار نظامي بالسداد</span></div></div>
  <div class="n-sec"><h2 class="n-h"><i>أولًا</i>أطراف الإنذار</h2>
    <div class="n-parties">
      <div class="n-party"><div class="ph">الطرف الأول (المُنذِر)</div><dl>
        <dt>المؤسسة:</dt><dd>${esc(S.entity)}</dd>${S.idVal?`<dt>${esc(S.idLabel)}:</dt><dd class="ltr">${esc(S.idVal)}</dd>`:""}
        <dt>العلامة التجارية:</dt><dd>${esc(COMPANY)}</dd></dl></div>
      <div class="n-party"><div class="ph">الطرف الثاني (المُنذَر)</div><dl>
        <dt>الاسم:</dt><dd>${esc(nm)}</dd>${d.docNo?`<dt>${esc(d.docType)}:</dt><dd class="ltr">${esc(d.docNo)}</dd>`:""}${d.cphone?`<dt>رقم الجوال:</dt><dd class="ltr">${esc(d.cphone)}</dd>`:""}${d.addr?`<dt>العنوان:</dt><dd>${esc(d.addr)}</dd>`:""}${d.email?`<dt>البريد الإلكتروني:</dt><dd class="ltr">${esc(d.email)}</dd>`:""}
        ${d.site?`<dt>الموقع الإلكتروني:</dt><dd class="ltr">${esc(d.site)}</dd>`:""}<dt>الممثل النظامي:</dt><dd>${esc(d.rep||nm)}</dd></dl></div>
    </div></div>
  <div class="n-sec"><h2 class="n-h"><i>ثانيًا</i>الموضوع وأصل المديونية والتكليف بالوفاء</h2>
    <p class="n-p" contenteditable="true">نفيدكم بأنه بناءً على العقد المبرم بين ${esc(S.entity)} و${esc(ttl)}${esc(sn)} لتقديم خدمات تسويقية متفق عليها، وحيث تم توقيع العقد رسميًا والتزام المؤسسة بالبدء فور استيفاء الدفعة الأولى، إلا أنكم لم تلتزموا بسداد الدفعة المستحقة بموجب العقد وقدرها <b>(${amt}) ${esc(words)}</b>، مما تسبب في تعطيل بدء تنفيذ الخدمات وإرجاء العمل المعتمد.</p>
    <div class="n-amount"><div class="l">إجمالي الدفعة المستحقة بموجب العقد الموقَّع:</div><div class="v">${amt} <small>ريال سعودي</small></div><div class="w">(فقط ${esc(words||"—")} لا غير)</div></div></div>
  <div class="n-sec"><h2 class="n-h"><i>ثالثًا</i>المهلة المحددة والمطلوب</h2>
    <p class="n-p" contenteditable="true">نطلب منكم المبادرة بتحويل كامل المبلغ المستحق قدره <b>(${amt} ريال سعودي)</b> لتنفيذ التزاماتكم التعاقدية للتمكن من البدء في تقديم الخدمات المتفق عليها، وتزويدنا بإشعار التحويل خلال مدة أقصاها <b>(${esc(daysTxt(d.days))})</b> من تاريخ هذا الإنذار.</p>
    <div class="n-warn"><h3>تنبيه وإشعار بالإجراءات النظامية عند استمرار الإخلال بالعقد:</h3><ul contenteditable="true">
      <li><b>قيد دعوى قضائية</b> عبر بوابة (ناجز) لإلزامكم بالسداد وإثبات مسؤوليتكم عن الإخلال بالالتزامات التعاقدية.</li>
      <li><b>المطالبة بالتعويض عن الأضرار</b> الناجمة عن تعطيل التنفيذ وفوات المنفعة، وإلزامكم بـ<b>أتعاب المحاماة والرسوم القضائية</b>.</li>
      <li><b>فسخ العقد</b> مع تحميلكم كامل المسؤولية المالية والنظامية المترتبة على ذلك.</li></ul></div>
    <p class="n-close" contenteditable="true">نأمل منكم سرعة براءة الذمة وتجنب التبعات القانونية والمؤثرات على السجل التجاري والمالي.</p></div>
  <div class="n-sign">
    <div class="n-box"><h4>عن المُنذِر / ${esc(S.entity)}</h4><div class="line">التوقيع والختم:</div><img class="n-stamp ${S.cls}" src="${S.img}" alt=""></div>
    <div class="n-box"><h4>صفة الإشعار</h4><p>إشعار رسمي بالسداد وتكليف بالوفاء</p></div></div>
  <div class="n-foot"><span><b>${esc(S.entity)}</b> — سند إنذار نهائي بالسداد</span><span>صفحة 1 من 1</span></div>`;
  host.append(pg); fitNotice();
  $("#exTag").hidden=!!(d.name&&d.amount);
}
function fitNotice(){ const host=$("#nScale"), pg=$("#npage"); if(!pg||$("#noticeView").hidden) return;
  const k=Math.min(1,host.clientWidth/794); pg.style.transform=`scale(${k})`; host.style.height=(pg.offsetHeight*k)+"px"; }
function noticeValid(){ const d=readN(), errs=[]; if(!d.name) errs.push("اسم العميل"); if(!(d.amount>0)) errs.push("المبلغ المستحق");
  const e=$("#nErr"); if(errs.length){ e.textContent="ناقص: "+errs.join("، ")+"."; e.hidden=false; status("ناقص: "+errs.join("، ")+".","warn"); return false; } e.hidden=true; return true; }
function noticeFile(){ const d=readN(); return `Sahl-Notice-${(d.ref||"NTC").replace(/[^A-Za-z0-9-]+/g,"-")}-${(d.date||new Date().toISOString().slice(0,10))}`; }
function cleanNotice(){ const pg=$("#npage").cloneNode(true); pg.style.transform=""; pg.removeAttribute("id"); pg.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable")); return pg; }
function bumpRef(){ const d=readN(); const m=/^NTC-(\d{4})\/(\d+)$/.exec(d.ref); if(m){ const cur=+store.get("sahl_ntc_"+m[1],"0"); if(+m[2]>cur) store.set("sahl_ntc_"+m[1],String(+m[2])); } }
async function noticePdf(){
  const btn=$("#pdfBtn"); if(btn.disabled||!noticeValid()) return;
  btn.disabled=true; const old=btn.innerHTML; btn.innerHTML='<span class="spin"></span> بيجهّز الـ PDF';
  try{
    await Promise.all([loadScript(LIBS.h2c),loadScript(LIBS.pdf)]);
    try{ await Promise.all([400,700,800,900].map(w=>document.fonts.load(`${w} 16px "Cairo"`,"شراع abc"))); await document.fonts.ready; }catch(e){}
    const stage=$("#stage"); stage.replaceChildren(); const pg=cleanNotice(); stage.append(pg);
    const h=Math.max(1123,pg.offsetHeight); pg.style.height=h+"px";
    const canvas=await html2canvas(pg,{scale:2.5,backgroundColor:"#ffffff",logging:false,useCORS:true,width:794,height:h,windowWidth:794});
    const { jsPDF } = window.jspdf; const wpt=794*0.75, hpt=h*0.75;
    const pdf=new jsPDF({unit:"pt",format:[wpt,hpt],orientation:"portrait",compress:true});
    pdf.addImage(canvas.toDataURL("image/jpeg",0.93),"JPEG",0,0,wpt,hpt,undefined,"FAST");
    pdf.setProperties({title:"إنذار نهائي بالسداد - "+readN().name,author:STAMPS[readN().sig].entity});
    saveBlob(pdf.output("blob"),noticeFile()+".pdf"); stage.replaceChildren(); bumpRef();
    status(`نزل الملف: ${noticeFile()}.pdf`,"ok");
  }catch(e){ console.error(e); status("مقدرتش أجهّز الـ PDF. اتأكد من النت وجرّب تاني.","bad"); }
  finally{ btn.disabled=false; btn.innerHTML=old; }
}
async function noticeHtml(){
  if(!noticeValid()) return;
  const pg=cleanNotice(); const css=await cssText("notice");
  const html=`<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc("إنذار نهائي بالسداد - "+readN().name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap">
<style>${css}
html,body{margin:0}body{background:#E9EEEC;padding:24px 16px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.npage{margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,.15);border-radius:6px}
@media (max-width:820px){body{padding:0}.npage{width:100%;min-height:100vh;border-radius:0;padding:18px 14px 0}.n-head{flex-direction:column;align-items:flex-start}.n-meta{align-self:flex-start}.n-parties,.n-sign{grid-template-columns:1fr}}
@page{size:A4;margin:0}@media print{body{background:none;padding:0}.npage{box-shadow:none;border-radius:0}}
</style></head><body>
${pg.outerHTML}
</body></html>`;
  saveBlob(new Blob([html],{type:"text/html;charset=utf-8"}),noticeFile()+".html"); bumpRef();
  status(`نزل الملف: ${noticeFile()}.html`,"ok");
}

/* ---------- Gemini settings dialog ---------- */
function refreshKeyPill(){ const own=!!store.get("sahl_gemini_key",""); const has=!!CFG.proxy||own; $("#keyBtn").classList.toggle("ok",has); $("#keyTxt").textContent=own&&CFG.proxy?"Gemini (مفتاحك)":has?"Gemini متوصّل":"حط مفتاح Gemini"; }
function openKey(msg){
  $("#keyIn").value=store.get("sahl_gemini_key","");
  const kl=document.querySelector('label[for="keyIn"]'); if(kl) kl.textContent=CFG.proxy?"مفتاحك الشخصي (اختياري)":"المفتاح";
  const ks=$("#keyStatus"); if(msg){ks.className="status warn";ks.textContent=msg;ks.hidden=false;} else if(CFG.proxy){ ks.className="status"; ks.textContent="الأداة شغالة بمفتاح الفريق اللي على السيرفر، ومش محتاج تحط حاجة. لو لقيت رسالة «حد الاستخدام» بتتكرر، اعمل مفتاح مجاني من حساب Gmail بتاعك وحطه هنا، والأداة هتشتغل بيه على جهازك بس."; ks.hidden=false; } else ks.hidden=true;
  const dlg=$("#dlg"); if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","");
}
function closeKey(){ const dlg=$("#dlg"); if(dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
async function testKey(){
  const key=$("#keyIn").value.trim(), ks=$("#keyStatus");
  if(!CFG.proxy && !key){ ks.className="status bad"; ks.textContent="الصق المفتاح الأول."; ks.hidden=false; return; }
  ks.className="status"; ks.textContent="بيختبر..."; ks.hidden=false;
  const model=$("#modelIn").value;
  try{
    const res=await geminiRaw(model,key,{contents:[{parts:[{text:"رد بكلمة واحدة: تمام"}]}],generationConfig:{maxOutputTokens:64}});
    if(res.ok||res.status===0){ ks.className="status ok"; ks.textContent=`الاتصال شغال مع ${model}.`; }
    else if(res.status===404){ ks.className="status warn"; ks.textContent=`الموديل ${model} مش متاح. اختار موديل تاني.`; }
    else { ks.className="status bad"; ks.textContent=`مرفوض (${res.status}): ${res.msg||""}`.slice(0,220); }
  }catch(e){ ks.className="status bad"; ks.textContent=e.message==="TEAM_PASS"?"السيرفر طالب كلمة سر الفريق. اضغط «اكتب الخطة» وهيطلبها منك.":e.message; }
}

/* =====================================================================
   PRICE QUOTE (unchanged)
   ===================================================================== */
/* ---------- price quote ---------- */
const QPKG={1:{name:"باقة التجربة",dur:"شهر واحد"},3:{name:"باقة الانطلاقة",dur:"3 أشهر"},6:{name:"باقة الاستدامة",dur:"6 أشهر"},12:{name:"باقة الشراكة",dur:"12 شهرًا"}};
const QSVC=[
  {k:"store",t:"إدارة المتجر",s:"إدارة وتحديث المتجر ومنتجاته"},
  {k:"seo",t:"تحسين محركات البحث (SEO)",s:"لظهور المتجر في نتائج بحث Google"},
  {k:"social",t:"إدارة السوشيال ميديا",s:"محتوى ونشر على سناب وتيك توك وإنستجرام"},
  {k:"ads",t:"حملات إعلانية",s:"حملات ممولة على سناب وتيك توك وإنستجرام"},
  {k:"influencers",t:"إعلانات المشاهير",s:null},
  {k:"design",t:"خدمات التصميم",s:"تصاميم بوستات وإعلانات بهوية المتجر"},
  {k:"app",t:"تطبيق على آب ستور وقوقل بالي",s:"مدى الحياة",bonus:true}
];
const Q={pk:{},sel:[],svc:new Set(["seo","social","ads","influencers"])};
function buildQuote(){
  const box=$("#qPkgs");
  for(const dur of [1,3,6,12]){
    const b=el("button",{type:"button","aria-pressed":"false","data-dur":String(dur)},el("b",{text:QPKG[dur].dur}),el("span",{text:QPKG[dur].name}));
    b.addEventListener("click",()=>toggleQPkg(dur));
    box.append(b);
  }
  const sv=$("#qSvcs");
  QSVC.forEach(x=>{
    const id="qs_"+x.k;
    const inp=el("input",{type:"checkbox",id,checked:Q.svc.has(x.k)});
    inp.addEventListener("change",()=>{ inp.checked?Q.svc.add(x.k):Q.svc.delete(x.k); renderQPrices(); renderQuote(); saveQ(); });
    sv.append(el("label",{class:"check",for:id},inp,x.t));
  });
  for(const id of ["qTo","qSite","qOfferT","qOfferX"]) $("#"+id).addEventListener("input",()=>{renderQuote();saveQ();});
}
function toggleQPkg(dur){
  const i=Q.sel.indexOf(dur);
  if(i>=0) Q.sel.splice(i,1);
  else { if(Q.sel.length>=3){ qErr("الحد 3 باقات في العرض الواحد. شيل باقة الأول."); return; } Q.sel.push(dur); }
  Q.sel.sort((a,b)=>a-b);
  if(!Q.pk[dur]) Q.pk[dur]={price:"",was:"",inf:INF_DEFAULT[dur]||""};
  qErr("");
  syncQButtons(); renderQPrices(); renderQuote(); saveQ();
}
function syncQButtons(){ document.querySelectorAll("#qPkgs button").forEach(b=>b.setAttribute("aria-pressed",String(Q.sel.includes(+b.dataset.dur)))); }
function renderQPrices(){
  const box=$("#qPrices"); box.replaceChildren();
  for(const dur of Q.sel){
    const st=Q.pk[dur];
    const mk=(key,label,ph,req)=>{ const id=`qp_${dur}_${key}`; const inp=el("input",{type:"number",id,min:"0",step:"1",dir:"ltr",inputmode:"numeric",placeholder:ph||""}); inp.value=st[key]; inp.addEventListener("input",()=>{st[key]=inp.value;renderQuote();saveQ();});
      return el("div",{class:"fld"},el("label",{for:id},label,req?el("span",{class:"req",text:" *"}):null),inp); };
    const grid=el("div",{class:"row2"},mk("price","السعر (ريال)","",true),mk("was","قبل الخصم","اختياري"));
    if(Q.svc.has("influencers")) grid.append(mk("inf","إعلانات المشاهير","",true));
    box.append(el("div",{class:"qrow"},el("h3",{text:`${QPKG[dur].name} · ${QPKG[dur].dur}`}),grid));
  }
}
function qErr(t){ const e=$("#qErr"); e.textContent=t; e.hidden=!t; }
const nOf=v=>{ const n=Number(v); return isFinite(n)&&n>0?n:0; };
function qIntro(n){
  const cnt=n===1?"باقة متكاملة":n===2?"باقتين متكاملتين":"ثلاث باقات متكاملة";
  const parts=QSVC.filter(x=>Q.svc.has(x.k)&&x.k!=="app").map(x=>x.t);
  let t=`نقدّم لكم ${cnt} لإدارة متجركم وتسويقه رقميًا على سناب شات وتيك توك وإنستجرام`;
  if(parts.length) t+=`، تشمل ${parts.join("، ")}`;
  if(Q.svc.has("app")) t+=`، مع تطبيق جوال خاص بمتجركم على آب ستور وقوقل بالي`;
  return t+".";
}
let qEdits={}; // texts the sales edited in the preview, kept across re-renders
function qce(key,tag,attrs,text){ const n=el(tag,{...attrs,contenteditable:"true",spellcheck:"false","data-k":key}); n.textContent=(key in qEdits)?qEdits[key]:text; return n; }
function renderQuote(){
  const host=$("#qScale"); host.replaceChildren();
  const pg=el("div",{class:"qpage",id:"qpage"});
  pg.append(el("div",{class:"q-arc"}));
  pg.append(el("div",{class:"q-top"},el("img",{src:LOGO_LIGHT,alt:"شراع للتسويق الإلكتروني"}),
    el("div",{class:"side"},el("span",{class:"q-badge",text:"عرض سعر"}),el("span",{class:"q-date",text:"التاريخ: "+todayTxt()}))));
  const to=$("#qTo").value.trim(), site=$("#qSite").value.trim();
  const toBlk=el("div",{class:"q-to"},el("small",{text:"مقدَّم إلى"}),el("h1",{text:to||"اسم العميل"}));
  if(site) toBlk.append(el("div",{class:"site",text:site.replace(/^https?:\/\//,"").replace(/\/$/,"")}));
  pg.append(toBlk);
  const sel=Q.sel.length?Q.sel:[3,6];
  pg.append(qce("intro","p",{class:"q-intro"},qIntro(sel.length)));
  const cards=el("div",{class:"q-cards n"+sel.length});
  const best = sel.length>1 ? sel[sel.length-1] : null;
  for(const dur of sel){
    const st=Q.pk[dur]||{price:"",was:"",inf:INF_DEFAULT[dur]||""};
    const card=el("div",{class:"q-card"+(dur===best?" best":"")});
    if(dur===best) card.append(el("span",{class:"q-best",text:"الأفضل قيمة"}));
    card.append(el("div",{class:"q-dur",text:"مدة الباقة: "+QPKG[dur].dur}));
    card.append(qce("name"+dur,"div",{class:"q-name"},QPKG[dur].name));
    card.append(el("div",{class:"q-all",text:`كل الخدمات مستمرة طوال ${QPKG[dur].dur}`}));
    const ul=el("ul",{class:"q-items"});
    for(const x of QSVC){ if(!Q.svc.has(x.k)) continue;
      const sub = x.k==="influencers" ? `${adsCount(nOf(st.inf)||0)} مع مشاهير +1 مليون متابع` : x.s;
      ul.append(el("li",{class:x.bonus?"bonus":""},el("i",{class:"q-ck"}),el("div",{},el("b",{text:x.t}),el("span",{text:sub}))));
    }
    card.append(ul);
    const price=nOf(st.price), was=nOf(st.was);
    const pb=el("div",{class:"q-price"});
    if(was>price && price>0) pb.append(el("div",{class:"q-was"},"بدلًا من ",el("s",{text:fmtNum(was)+" ر.س"})));
    pb.append(el("div",{class:"q-now"},el("b",{text:price?fmtNum(price):"—"}),el("small",{text:"ر.س"})));
    if(was>price && price>0) pb.append(el("span",{class:"q-save",text:`توفير ${fmtNum(was-price)} ر.س`}));
    pb.append(el("div",{class:"q-note",text:"السعر شامل جميع الخدمات طوال مدة الباقة"}));
    card.append(pb);
    cards.append(card);
  }
  pg.append(cards);
  const ot=$("#qOfferT").value.trim(), ox=$("#qOfferX").value.trim();
  if(ot||ox) pg.append(el("div",{class:"q-offer"},el("div",{},el("h3",{text:ot||"ميزة خاصة"}),ox?el("p",{text:ox}):null),el("div",{class:"q-pct",text:"%"})));
  pg.append(el("div",{class:"q-pay"},el("span",{text:"الدفع مرة واحدة أو على دفعات حسب الاتفاق في العقد."})));
  pg.append(el("div",{class:"q-foot"},el("div",{},el("strong",{},"شراعك نحو ",el("em",{text:"النمو"})),el("span",{text:"شراع للتسويق الإلكتروني"}))));
  pg.addEventListener("input",e=>{ const k=e.target.closest("[data-k]"); if(k) qEdits[k.dataset.k]=k.textContent; });
  host.append(pg);
  $("#exTag").hidden=Q.sel.length>0;
  fitQuote();
}
function fitQuote(){
  const host=$("#qScale"), pg=$("#qpage"); if(!pg||$("#quoteView").hidden) return;
  const s=Math.min(1,host.clientWidth/794); pg.style.transform=`scale(${s})`; host.style.height=(pg.offsetHeight*s)+"px";
}
function saveQ(){ store.set("sahl_quote_draft",JSON.stringify({to:$("#qTo").value,site:$("#qSite").value,ot:$("#qOfferT").value,ox:$("#qOfferX").value,sel:Q.sel,pk:Q.pk,svc:[...Q.svc]})); }
function loadQ(){
  let d; try{d=JSON.parse(store.get("sahl_quote_draft","null"))}catch(e){d=null}
  if(!d) return;
  $("#qTo").value=d.to||""; $("#qSite").value=d.site||"";
  $("#qOfferT").value=d.ot||""; $("#qOfferX").value=d.ox||"";
  Q.sel=(d.sel||[]).filter(x=>QPKG[x]).slice(0,3); Q.pk=d.pk||{};
  if(Array.isArray(d.svc)){ Q.svc=new Set(d.svc); QSVC.forEach(x=>$("#qs_"+x.k).checked=Q.svc.has(x.k)); }
  syncQButtons(); renderQPrices();
}
function quoteValid(){
  const errs=[];
  if(!$("#qTo").value.trim()) errs.push("اسم العميل");
  if(!Q.sel.length) errs.push("باقة واحدة على الأقل");
  for(const dur of Q.sel){ const st=Q.pk[dur]; if(!nOf(st.price)) errs.push("سعر "+QPKG[dur].name); if(Q.svc.has("influencers")&&!nOf(st.inf)) errs.push("عدد إعلانات المشاهير في "+QPKG[dur].name); }
  if(!Q.svc.size) errs.push("خدمة واحدة على الأقل");
  qErr(errs.length?"ناقص: "+errs.join("، ")+".":"");
  if(errs.length) status("ناقص بيانات في عرض السعر. شوف الرسالة تحت الفورم.","bad");
  return !errs.length;
}
function quoteFile(){
  let slug=""; const site=$("#qSite").value.trim();
  if(site) slug=hostLabel(site);
  slug=(slug||"client").toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"client";
  return `Sahl-Quote-${slug}-${new Date().toISOString().slice(0,10)}`;
}
function cleanQuote(){
  const c=$("#qpage").cloneNode(true); c.removeAttribute("id"); c.style.transform="";
  c.querySelectorAll("[contenteditable]").forEach(x=>{x.removeAttribute("contenteditable");x.removeAttribute("spellcheck");x.removeAttribute("data-k");});
  return c;
}
async function quotePdf(){
  const btn=$("#pdfBtn"); if(btn.disabled||!quoteValid()) return;
  btn.disabled=true; const old=btn.innerHTML; btn.innerHTML='<span class="spin"></span> بيجهّز الـ PDF';
  try{
    await Promise.all([loadScript(LIBS.h2c),loadScript(LIBS.pdf)]);
    try{ await Promise.all([400,700,800,900].map(w=>document.fonts.load(`${w} 16px "Cairo"`,"شراع abc"))); await document.fonts.ready; }catch(e){}
    const stage=$("#stage"); stage.replaceChildren(); const pg=cleanQuote(); stage.append(pg);
    const h=Math.max(1123,pg.offsetHeight); pg.style.height=h+"px";
    const canvas=await html2canvas(pg,{scale:2,backgroundColor:"#0A0A0A",logging:false,useCORS:true,width:794,height:h,windowWidth:794});
    const { jsPDF } = window.jspdf; const wpt=794*0.75, hpt=h*0.75;
    const pdf=new jsPDF({unit:"pt",format:[wpt,hpt],orientation:"portrait",compress:true});
    pdf.addImage(canvas.toDataURL("image/jpeg",0.92),"JPEG",0,0,wpt,hpt,undefined,"FAST");
    pdf.setProperties({title:"عرض سعر - شراع للتسويق الإلكتروني",author:"شراع للتسويق الإلكتروني"});
    saveBlob(pdf.output("blob"),quoteFile()+".pdf"); stage.replaceChildren();
    status(`نزل الملف: ${quoteFile()}.pdf`,"ok");
  }catch(e){ console.error(e); status("مقدرتش أجهّز الـ PDF. اتأكد من النت وجرّب تاني.","bad"); }
  finally{ btn.disabled=false; btn.innerHTML=old; }
}
async function quoteHtml(){
  if(!quoteValid()) return;
  const pg=cleanQuote(); const css=await cssText("quote");
  const html=`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc("عرض سعر - "+$("#qTo").value.trim())} | شراع للتسويق الإلكتروني</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap">
<style>
${css}
html,body{margin:0}
body{background:#1B1D1C;padding:24px 16px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.qpage{margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,.4);border-radius:6px}
@media (max-width:820px){body{padding:0}.qpage{width:100%;min-height:100vh;border-radius:0;padding:26px 18px 0}.q-cards.n2,.q-cards.n3{grid-template-columns:1fr}.q-cards.n3 .q-name{font-size:24px}.q-cards.n3 .q-now b{font-size:38px}.q-arc{left:-120px}}
@page{size:A4;margin:0}
@media print{body{background:none;padding:0}.qpage{box-shadow:none;border-radius:0}}
</style>
</head>
<body>
${pg.outerHTML}
</body>
</html>`;
  saveBlob(new Blob([html],{type:"text/html;charset=utf-8"}),quoteFile()+".html");
  status(`نزل الملف: ${quoteFile()}.html`,"ok");
}

/* ---------- boot ---------- */
buildServices(); buildCats(); bootPkg();
document.querySelectorAll('input[name=dur]').forEach(r=>r.addEventListener("change",syncInf));
document.querySelectorAll('input[name=pmode]').forEach(r=>r.addEventListener("change",syncPmode));
const modelSel=$("#modelIn"); MODELS.forEach(m=>modelSel.append(el("option",{value:m,text:m})));
modelSel.value=store.get("sahl_gemini_model",MODELS[0]);
loadDraft(); syncPmode(); syncInf(); syncPkg();
$("#f").addEventListener("input",saveDraft);
$("#f").addEventListener("change",saveDraft);
$("#f").addEventListener("submit",e=>{e.preventDefault();generate();});
$("#pdfBtn").addEventListener("click",()=>mode==="quote"?quotePdf():mode==="notice"?noticePdf():mode==="images"?imagesPdf():downloadPdf());
$("#htmlBtn").addEventListener("click",()=>mode==="quote"?quoteHtml():mode==="notice"?noticeHtml():exportHtml());
$("#editBtn").addEventListener("click",()=>{ if(!needPlan()) return; setEdit(!$("#editBtn").dataset.on); });
$("#modePlan").addEventListener("click",()=>setMode("plan"));
$("#modeApp").addEventListener("click",()=>setMode("app"));
$("#modeQuote").addEventListener("click",()=>setMode("quote"));
$("#modeNotice").addEventListener("click",()=>setMode("notice"));
$("#modeImages").addEventListener("click",()=>setMode("images"));
$("#keyBtn").addEventListener("click",()=>openKey());
$("#keyClose").addEventListener("click",closeKey);
$("#keyTest").addEventListener("click",testKey);
$("#keySave").addEventListener("click",()=>{ const k=$("#keyIn").value.trim(); if(k) store.set("sahl_gemini_key",k); store.set("sahl_gemini_model",$("#modelIn").value); refreshKeyPill(); closeKey(); });
$("#keyClear").addEventListener("click",()=>{ store.del("sahl_gemini_key"); $("#keyIn").value=""; refreshKeyPill(); });
window.addEventListener("resize",()=>{fitQuote();fitFrame();fitNotice();});
refreshKeyPill();
buildQuote(); loadQ(); buildNotice(); bootImages();
if(window.ResizeObserver){ let lastW=0; new ResizeObserver(en=>{ const w=Math.round(en[0].contentRect.width); if(w===lastW) return; lastW=w; requestAnimationFrame(fitQuote); }).observe($("#qScale")); let lastNW=0; new ResizeObserver(en=>{ const w=Math.round(en[0].contentRect.width); if(w===lastNW) return; lastNW=w; requestAnimationFrame(fitNotice); }).observe($("#nScale")); }
setMode(["plan","app","quote","notice","images"].includes(store.get("sahl_mode","plan"))?store.get("sahl_mode","plan"):"plan");
