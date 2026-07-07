import React, { useState } from "react";
import { initSync, pullNow, getSyncToken, setSyncToken, getSyncStatus } from "./sync.js";

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEM_EL = ["木","木","火","火","土","土","金","金","水","水"];
const BRANCH_EL = ["水","土","木","木","土","火","火","土","金","金","土","水"];
const STEM_YIN = [false,true,false,true,false,true,false,true,false,true];
const ZOKAN = [["癸",null,null],["己","癸","辛"],["甲","丙","戊"],["乙",null,null],["戊","乙","癸"],["丙","庚","戊"],["丁","己",null],["己","丁","乙"],["庚","壬","戊"],["辛",null,null],["戊","辛","丁"],["壬","甲",null]];
const SETSU = [[1,6],[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,7],[9,8],[10,8],[11,7],[12,7]];
const JUNISHI_YO = ["長生","沐浴","冠帯","建禄","帝旺","衰","病","死","墓","絶","胎","養"];
const JUNISHI_DESC = {
  長生:{kw:"誕生・成長",txt:"新たな始まりと成長のエネルギーを持つ吉星。何事も順調に伸び、人から可愛がられ育まれる。"},
  沐浴:{kw:"若気・色気",txt:"感性が豊かで魅力的。異性縁や芸術才能に恵まれるが、誘惑に流されやすい面も。"},
  冠帯:{kw:"華やか・向上",txt:"才能が開花し、社会的に認められる時期。向上心が強く、活躍できる運気。"},
  建禄:{kw:"自立・安定",txt:"自分の力で道を切り拓く安定した運気。実力が発揮でき、独立に向く吉星。"},
  帝旺:{kw:"頂点・支配",txt:"運気の頂点を示す最強の星。リーダーシップと権威を持つが、プライドが高くなりやすい。"},
  衰:{kw:"安定・保守",txt:"盛りを過ぎ安定期へ。変化より現状維持を好む時期。慎重さが大切。"},
  病:{kw:"病弱・感受性",txt:"体力や気力が低下しやすい時期。繊細な感受性を持つが、健康に注意が必要。"},
  死:{kw:"静止・変革",txt:"一つの区切りを示す星。外見上は停滞でも内側では変革のエネルギーが蓄積する。"},
  墓:{kw:"蓄積・保守",txt:"財や力を蓄える星。コツコツと積み上げることが得意。整理・収納・管理に向く。"},
  絶:{kw:"断絶・変化",txt:"一度無になってから再生する転換点。変化や移動が多く、価値観の大きな転換期。"},
  胎:{kw:"準備・潜在",txt:"新しいものが宿り始める段階。表には出ないが、大きな可能性を内包している。"},
  養:{kw:"育成・継承",txt:"育まれ守られる吉星。人から助けられ、育てられる恵まれた環境を示す。"},
};
const CHOSEICHI = [11,6,2,9,2,9,5,0,8,3];
const CHOSEICHI_FWD = [true,false,true,false,true,false,true,false,true,false];
const EC = {木:{bg:"#e8f5e2",bd:"#5aaa40",tx:"#2d7a1a"},火:{bg:"#fdecea",bd:"#e05050",tx:"#c02020"},土:{bg:"#fdf5e0",bd:"#c09020",tx:"#8a6010"},金:{bg:"#f0f0f8",bd:"#7080b0",tx:"#404878"},水:{bg:"#e4f0fa",bd:"#3070b0",tx:"#1a5090"}};
const KANGOKAN = {0:{p:5,e:"土"},5:{p:0,e:"土"},1:{p:6,e:"金"},6:{p:1,e:"金"},2:{p:7,e:"水"},7:{p:2,e:"水"},3:{p:8,e:"木"},8:{p:3,e:"木"},4:{p:9,e:"火"},9:{p:4,e:"火"}};
const ROKUGOU = [[0,1,"土"],[2,11,"木"],[3,10,"火"],[4,9,"金"],[5,8,"水"],[6,7,"土"]];
const SOCHUU = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const KAN_KOKOKU_PAIRS = [[0,6],[1,7],[2,8],[3,9]];
const SANGOU = [[0,4,8,"水"],[2,6,10,"火"],[11,3,7,"木"],[5,9,1,"金"],[5,6,7,"火"]];
const KEI_PAIRS = [[2,5],[5,8],[8,2],[1,10],[10,7],[7,1],[0,3],[3,0]];
const KEI_JIKE = [4,6,9,11];
const KOKOKU = {木:"土",土:"水",水:"火",火:"金",金:"木"};
const KIMON = {0:[1,7],1:[0,8],2:[11,9],3:[11,9],4:[1,7],5:[0,8],6:[1,7],7:[6,2],8:[5,3],9:[5,3]};
const BUNCHOU = {0:5,1:6,2:8,3:6,4:8,5:6,6:11,7:0,8:8,9:3};
const BUNCHOU_KYO = {0:11,1:0,2:1,3:2,4:3,5:4,6:5,7:6,8:7,9:8};
const GAKUDO = {0:11,1:6,2:2,3:9,4:2,5:9,6:5,7:0,8:8,9:3};
const EKIBA = {0:2,4:2,8:2,11:5,3:5,7:5,2:8,6:8,10:8,5:11,9:11,1:11};
const KOSHIN = {11:2,0:2,1:2,2:5,3:5,4:5,5:8,6:8,7:8,8:11,9:11,10:11};
const KASHUKU = {2:1,3:1,4:1,5:4,6:4,7:4,8:7,9:7,10:7,11:10,0:10,1:10};
const GOUSATSU = {0:5,4:5,8:5,11:8,3:8,7:8,2:11,6:11,10:11,5:2,9:2,1:2};
const ROKU_BI = {0:2,1:3,2:5,3:6,4:5,5:6,6:8,7:9,8:11,9:0};
const SHOUSEI = {0:0,4:0,8:0,11:3,3:3,7:3,2:6,6:6,10:6,5:9,9:9,1:9};
const CHOUKYAKU = {0:7,4:7,8:7,11:4,3:4,7:4,2:1,6:1,10:1,5:10,9:10,1:10};
const SOUMON_BI = (yBi) => (yBi+2)%12;
const TOUKA = {0:9,4:9,8:9,2:3,6:3,10:3,11:0,3:0,7:0,5:6,9:6,1:6};
const BOUSHIN = {2:5,6:5,10:5,5:8,9:8,1:8,8:11,0:11,4:11,11:2,3:2,7:2};
const KOUYEN = {0:6,1:6,2:2,3:7,4:4,5:4,6:10,7:9,8:0,9:8};
const YOUJIN_BI = {0:3,1:7,2:6,3:5,4:6,5:5,6:9,7:8,8:0,9:11};
const TENTOKU = {2:3,3:7,4:8,5:7,6:0,7:9,8:2,9:1,10:6,11:3,0:8,1:7};
const TSUKITOKU = {2:2,6:2,10:2,8:8,0:8,4:8,11:0,3:0,7:0,5:6,9:6,1:6};
function getKuubou(si, bi) {
  // 旬頭（甲○）の支 = bi - si。旬に含まれない残り2支が空亡
  const jun = ((bi - si) % 12 + 12) % 12;
  return [(jun + 10) % 12, (jun + 11) % 12];
}
const TSUHEN_DESC = {
  比肩:{kw:"独立・自立",txt:"意志が強く独立心旺盛。自分のペースを大切にし、一人で物事を成し遂げる力があります。"},
  劫財:{kw:"協力・競争",txt:"仲間と力を合わせる場面で輝きます。社交的で人との繋がりを大切にしますが、時に感情的になりやすい面も。"},
  食神:{kw:"表現・楽しむ",txt:"豊かな表現力と創造性を持ち、自分の才能を自然に発揮できます。"},
  傷官:{kw:"才能・反骨心",txt:"鋭い感性と高い知性が際立ちます。ルールに縛られず、自由な発想で道を切り拓く力があります。"},
  偏財:{kw:"社交・財運",txt:"人付き合いが上手く、多くの人から慕われます。広い人脈から財を引き寄せる才能があります。"},
  正財:{kw:"堅実・誠実",txt:"コツコツと積み上げる誠実さが持ち味。計画的で安定した財運を持ちます。"},
  偏官:{kw:"行動・克服",txt:"困難を力で突破するエネルギーを持ちます。強いリーダーシップを発揮できます。"},
  正官:{kw:"責任・品格",txt:"責任感が強く、社会的なルールを重んじます。組織の中で力を発揮します。"},
  偏印:{kw:"直感・探求",txt:"鋭い直感と旺盛な知的好奇心を持ちます。専門分野を極める力があります。"},
  正印:{kw:"包容・知性",txt:"深い知性と温かい包容力を兼ね備えます。周囲の人を育てる才能があります。"},
};
const SEIKAKU = {"甲":{kw:"大樹・開拓者",intro:"甲木の人は、まっすぐに天へ向かって伸びる大樹のような存在です。",p:["強い意志と理想を持ち、一度決めた目標に向かってぶれることなく進んでいく力があります。","リーダーシップを発揮する場面では頼もしい存在となり、周囲から自然と尊敬を集めます。","頑固さや柔軟性の欠如が課題になることもあります。変化を恐れず、周囲の意見に耳を傾ける柔軟さを身につけることで、さらに大きな成長を遂げられます。"]},"乙":{kw:"草花・適応の人",intro:"乙木の人は、しなやかに風に揺れる草花のような存在です。",p:["繊細な感受性と高い共感能力を持ち、場の空気を読む能力に優れています。","美的センスが豊かで、芸術や文化への関心が深い傾向があります。","周囲に合わせすぎるあまり自分の意見を主張できなくなることがあります。自分の軸をしっかり持つことが大切です。"]},"丙":{kw:"太陽・情熱家",intro:"丙火の人は、全てを明るく照らす太陽のような存在です。",p:["エネルギッシュで明朗快活、どんな場所でもその存在感で周囲を明るくします。","情熱的で行動力があり、アイデアを素早く形にしていく力に優れています。","感情の起伏が激しくなりやすく、一つのことを継続する忍耐力を意識的に鍛えることが成長への鍵となります。"]},"丁":{kw:"灯火・洞察者",intro:"丁火の人は、暗闇を静かに照らす灯火のような存在です。",p:["知性的で洞察力に優れ、物事の本質を見抜く鋭い眼力を持っています。","内向的に見えることもありますが、その内側には強い情熱と信念を秘めています。","思慮深いゆえに行動が慎重になりすぎることがあります。積極的に世界に関わっていくことが大切です。"]},"戊":{kw:"大山・安定の柱",intro:"戊土の人は、どっしりと構えた大山のような存在です。",p:["安定感と信頼性が際立ち、周囲から頼りにされる存在です。長期的な視野で着実に成果を上げます。","度量が大きく、様々な人や意見を受け入れる包容力があります。","変化への対応が遅くなりがちで、新しいことへの挑戦に臆してしまうことも。柔軟さを意識しましょう。"]},"己":{kw:"田畑・育む人",intro:"己土の人は、万物を育む肥沃な田畑のような存在です。",p:["細やかな気配りと面倒見の良さが特徴で、周囲の人を自然とサポートする優しさを持っています。","協調性が高く、チームの調和を保つことを得意とします。","自己主張が苦手で、他人に振り回されやすい傾向があります。自分の意見をはっきり伝えることも重要です。"]},"庚":{kw:"鋭刃・改革者",intro:"庚金の人は、不純物を断ち切る鋭い刃のような存在です。",p:["意志が強く決断力があり、論理的で合理的な思考を持ちます。","正直で率直な物言いは真実を追求する誠実さの表れです。義理を重んじる責任感の強さも持ち合わせています。","頑固で融通が利かない面が出ることがあります。人の感情に寄り添う優しさを意識することが大切です。"]},"辛":{kw:"宝玉・繊細な輝き",intro:"辛金の人は、丁寧に磨かれた宝石のような存在です。",p:["高い審美眼と繊細な感性を持ち、美しさや品質へのこだわりが強いです。","鋭い観察眼を持ち、小さな変化や違和感にいち早く気づく能力があります。","プライドが高く傷つきやすい繊細な一面もあります。適度な余裕を持つことが心の安定につながります。"]},"壬":{kw:"大海・包容の人",intro:"壬水の人は、全てを包み込む大海原のような存在です。",p:["スケールの大きな思考と広い視野を持ち、知的好奇心が旺盛です。","柔軟性が高く、どんな環境にも順応できる適応力の高さが魅力です。","気が向いた方向に流れやすく、継続性に欠けることがあります。深い関係を築いていくことで人生が豊かになります。"]},"癸":{kw:"雨露・洞察の知性",intro:"癸水の人は、大地に静かに染み渡る雨露のような存在です。",p:["鋭い直感と高い知性を兼ね備え、物事の深層まで洞察する力があります。","献身的で思いやりがあり、困っている人を見ると放っておけない優しさを持っています。","内気で自分の気持ちを表現することが苦手な面があります。信頼できる人に心を開いていくことで、その豊かな内面が輝きを放つでしょう。"]}};

function getSetsu(y, m) { const [mm, dd] = SETSU[m-1]; return new Date(y, mm-1, dd); }
function getTsuhen(niSi, tSi) {
  const ne = STEM_EL[niSi], te = STEM_EL[tSi], ny = STEM_YIN[niSi], ty = STEM_YIN[tSi];
  if (ne===te) return ny===ty?"比肩":"劫財";
  const sg={木:"火",火:"土",土:"金",金:"水",水:"木"}, ko={木:"土",火:"金",土:"水",金:"木",水:"火"};
  if (sg[ne]===te) return ny===ty?"食神":"傷官";
  if (sg[te]===ne) return ny===ty?"偏印":"正印";
  if (ko[ne]===te) return ny===ty?"偏財":"正財";
  if (ko[te]===ne) return ny===ty?"偏官":"正官";
  return "";
}
function getJunishi(niSi, bi) {
  const st=CHOSEICHI[niSi], fwd=CHOSEICHI_FWD[niSi];
  const pos = fwd ? ((bi-st+12)%12) : ((st-bi+12)%12);
  return JUNISHI_YO[pos];
}
function toJD(y, m, d) { let yy=y,mm=m; if(mm<=2){yy--;mm+=12;} return Math.floor(365.25*(yy+4716))+Math.floor(30.6001*(mm+1))+d-1524; }
const JD_KIJUN = 2423834;
function calcYear(y, m, d) {
  const setsu = getSetsu(y,2), birth = new Date(y,m-1,d);
  const ey = birth < setsu ? y-1 : y;
  const si=((ey-4)%10+10)%10, bi=((ey-4)%12+12)%12;
  return {stem:STEMS[si],branch:BRANCHES[bi],stemIdx:si,branchIdx:bi,stemEl:STEM_EL[si],branchEl:BRANCH_EL[bi]};
}
function calcMonth(y, m, d) {
  const s = getSetsu(y, m), birth = new Date(y,m-1,d);
  let em = birth < s ? m-1 : m, ey = y;
  if (em<=0) { em+=12; ey--; }
  if (em===1) ey--;
  const bi = em%12;
  const ySi = ((ey-4)%10+10)%10;
  const base = [2,4,6,8,0][ySi%5];
  const si = (base+(bi-2+12)%12)%10;
  return {stem:STEMS[si],branch:BRANCHES[bi],stemIdx:si,branchIdx:bi,stemEl:STEM_EL[si],branchEl:BRANCH_EL[bi]};
}
function calcDay(y, m, d) {
  const diff = toJD(y,m,d) - JD_KIJUN;
  const si=((diff%10)+10)%10, bi=((diff+2)%12+12)%12;
  return {stem:STEMS[si],branch:BRANCHES[bi],stemIdx:si,branchIdx:bi,stemEl:STEM_EL[si],branchEl:BRANCH_EL[bi]};
}
function calcHour(h, dSi) {
  const bi=Math.floor(((h+1)%24)/2), si=([0,2,4,6,8][dSi%5]+bi)%10;
  return {stem:STEMS[si],branch:BRANCHES[bi],stemIdx:si,branchIdx:bi,stemEl:STEM_EL[si],branchEl:BRANCH_EL[bi]};
}
function calcDaiun(y, m, d, gender, mp) {
  // 順逆判定は暦年の年干基準（はるさん指示 2026-07-05：立春補正は適用しない）
  const ySi=((y-4)%10+10)%10, yang=!STEM_YIN[ySi], fwd=(yang&&gender==="male")||(!yang&&gender==="female");
  const birth=new Date(y,m-1,d);
  let ns, nm=m, ny=y;
  if (fwd) {
    ns=getSetsu(ny,nm); if (ns<=birth){nm++;if(nm>12){nm=1;ny++;} ns=getSetsu(ny,nm);}
  } else {
    ns=getSetsu(ny,nm); if (ns>=birth){nm--;if(nm<=0){nm=12;ny--;} ns=getSetsu(ny,nm);}
  }
  const diff=Math.abs((ns-birth)/86400000), age=Math.floor(diff/3);
  const list=[];
  let si=mp.stemIdx, bi=mp.branchIdx;
  for (let i=0;i<10;i++) {
    si=fwd?(si+1)%10:(si-1+10)%10; bi=fwd?(bi+1)%12:(bi-1+12)%12;
    const kazoeAge = age+i*10+1;
    list.push({stem:STEMS[si],branch:BRANCHES[bi],stemIdx:si,branchIdx:bi,stemEl:STEM_EL[si],branchEl:BRANCH_EL[bi],startYear:y+age+i*10,age:kazoeAge});
  }
  const seigo={stem:STEMS[mp.stemIdx],branch:BRANCHES[mp.branchIdx],stemIdx:mp.stemIdx,branchIdx:mp.branchIdx,stemEl:STEM_EL[mp.stemIdx],branchEl:BRANCH_EL[mp.branchIdx]};
  return {list,startAge:age+1,forward:fwd,seigo};
}
function calcRyunen(startY, n, dSi) {
  return Array.from({length:n},(_,i)=>{
    const y=startY+i, si=((y-4)%10+10)%10, bi=((y-4)%12+12)%12;
    return {year:y,stem:STEMS[si],branch:BRANCHES[bi],stemIdx:si,branchIdx:bi,stemEl:STEM_EL[si],branchEl:BRANCH_EL[bi],tsuhen:getTsuhen(dSi,si)};
  });
}
function calcYoujin(ec, dayEl) {
  const SG = {木:"火",火:"土",土:"金",金:"水",水:"木"};
  const KO = {木:"土",火:"金",土:"水",金:"木",水:"火"};
  const inki = Object.keys(SG).find(k=>SG[k]===dayEl);
  const hikaku = dayEl;
  const kyouCount = (ec[inki]||0) + (ec[hikaku]||0);
  const total = Object.values(ec).reduce((a,b)=>a+b,0);
  const ratio = total>0 ? kyouCount/total : 0;
  let youjinEl, kijiinEl, desc, bodyStr;
  if (ratio >= 0.5) {
    bodyStr = "身強"; youjinEl = KO[dayEl]; kijiinEl = SG[dayEl];
    desc = `日干（${dayEl}）が強すぎます。${youjinEl}（官殺）で抑えるか、${kijiinEl}（食傷）で気を洩らすことでバランスを取ります。`;
  } else {
    bodyStr = "身弱"; youjinEl = inki; kijiinEl = hikaku;
    desc = `日干（${dayEl}）が弱い状態です。${youjinEl}（印）に生じてもらうか、${kijiinEl}（比劫）の助けを借りることでバランスを取ります。`;
  }
  return {youjinEl, kijiinEl, bodyStr, ratio: Math.round(ratio*100), desc, inki, hikaku};
}
function calcShinSatsu(dSi, dBi, yBi, mBi, mSi, allBi, allSi) {
  const byBi = {}; const bySi = {};
  allBi.forEach(b=>{byBi[b]=byBi[b]||[];});
  const add=(bi,mark)=>{if(byBi[bi]!==undefined&&!byBi[bi].includes(mark))byBi[bi].push(mark);};
  const ySi = allSi[0];
  (KIMON[dSi]||[]).forEach(b=>add(b,"貴")); (KIMON[ySi]||[]).forEach(b=>add(b,"貴"));
  add(BUNCHOU[dSi],"文"); add(BUNCHOU[ySi],"文"); add(GAKUDO[dSi],"学"); add(GAKUDO[ySi],"学");
  add(EKIBA[yBi],"驛"); add(KOSHIN[yBi],"孤"); add(KOSHIN[dBi],"孤"); add(KASHUKU[yBi],"寡"); add(KASHUKU[dBi],"寡"); add(BOUSHIN[yBi],"亡"); add(BOUSHIN[dBi],"亡");
  add(GOUSATSU[dBi],"劫"); add(GOUSATSU[yBi],"劫"); add(ROKU_BI[dSi],"禄"); add(ROKU_BI[ySi],"禄"); add(SHOUSEI[yBi],"将");
  add((yBi+10)%12,"弔"); add((dBi+10)%12,"弔"); add(SOUMON_BI(yBi),"喪"); add(SOUMON_BI(dBi),"喪"); add(TOUKA[yBi],"桃"); add(TOUKA[dBi],"桃");
  add(KOUYEN[dSi],"紅"); add(KOUYEN[ySi],"紅"); add(YOUJIN_BI[dSi],"羊"); add(YOUJIN_BI[ySi],"羊");
  getKuubou(dSi,dBi).forEach(b=>add(b,"空"));
  const tdSi=TENTOKU[mBi];
  allSi.forEach((si,i)=>{
    if(si===tdSi){bySi[i]=bySi[i]||[];if(!bySi[i].includes("天"))bySi[i].push("天");}
    const mdSi=TSUKITOKU[mBi];
    if(si===mdSi){bySi[i]=bySi[i]||[];if(!bySi[i].includes("月"))bySi[i].push("月");}
  });
  const keiResult = {};
  allBi.forEach((a,i)=>{
    allBi.forEach((b,j)=>{
      if(i>=j)return;
      if(KEI_PAIRS.some(([x,y])=>a===x&&b===y||a===y&&b===x)){
        if(!keiResult[a])keiResult[a]=[];if(!keiResult[a].includes("刑"))keiResult[a].push("刑");
        if(!keiResult[b])keiResult[b]=[];if(!keiResult[b].includes("刑"))keiResult[b].push("刑");
      }
    });
    if(KEI_JIKE.includes(a)&&allBi.filter(b=>b===a).length>=2){
      if(!keiResult[a])keiResult[a]=[];if(!keiResult[a].includes("刑"))keiResult[a].push("刑");
    }
  });
  Object.entries(keiResult).forEach(([bi,marks])=>marks.forEach(m=>add(Number(bi),m)));
  const summary = {};
  const LABEL={貴:"天乙貴人",文:"文昌",学:"学堂",驛:"驛馬",禄:"禄神",将:"将星",桃:"桃花",紅:"紅艶",羊:"羊刃",弔:"弔客",喪:"喪門",孤:"孤辰",寡:"寡宿",亡:"亡神",劫:"劫煞",空:"空亡",元:"元辰",刑:"刑"};
  Object.entries(byBi).forEach(([bi,marks])=>{
    marks.forEach(m=>{
      const k=LABEL[m]||m;
      if(!summary[k])summary[k]=[];
      if(!summary[k].includes(BRANCHES[Number(bi)]))summary[k].push(BRANCHES[Number(bi)]);
    });
  });
  const summaryStr={};
  Object.entries(summary).forEach(([k,arr])=>{summaryStr[k]=arr.join("・");});
  return {byBi, bySi, summary: summaryStr};
}
function calcAll(name, bd, bt, gender) {
  // 時刻は "H:MM" 形式のみ有効（URL経由の不正値はNaN時柱を防ぐため無視）
  const [y,m,d]=bd.split("-").map(Number), h=(bt&&/^\d{1,2}:\d{2}$/.test(bt))?parseInt(bt):null;
  const yp=calcYear(y,m,d), mp=calcMonth(y,m,d), dp=calcDay(y,m,d), hp=h!=null?calcHour(h,dp.stemIdx):null;
  const pillars={year:yp,month:mp,day:dp,hour:hp};
  const tsuhen={year:getTsuhen(dp.stemIdx,yp.stemIdx),month:getTsuhen(dp.stemIdx,mp.stemIdx),hour:hp?getTsuhen(dp.stemIdx,hp.stemIdx):null};
  const junishi={year:getJunishi(dp.stemIdx,yp.branchIdx),month:getJunishi(dp.stemIdx,mp.branchIdx),day:getJunishi(dp.stemIdx,dp.branchIdx),hour:hp?getJunishi(dp.stemIdx,hp.branchIdx):null};
  const zokan={year:ZOKAN[yp.branchIdx],month:ZOKAN[mp.branchIdx],day:ZOKAN[dp.branchIdx],hour:hp?ZOKAN[hp.branchIdx]:null};
  const ec={木:0,火:0,土:0,金:0,水:0};
  const stemEc={木:0,火:0,土:0,金:0,水:0};
  const branchEc={木:0,火:0,土:0,金:0,水:0};
  // 化合前の元の五行色を記録（色はそのまま、位置だけ移動）
  const stemElOriginal={}; // stemIdx -> 元の五行
  const branchElOriginal={}; // branchIdx(柱index) -> 元の五行
  [yp,mp,dp,hp].filter(Boolean).forEach(p=>{
    ec[p.stemEl]++; ec[p.branchEl]++; stemEc[p.stemEl]++; branchEc[p.branchEl]++;
  });
  // 干合の化合チェック（天干2柱が干合する場合）
  const KAN_GOKA={0:"土",5:"土",1:"金",6:"金",2:"水",7:"水",3:"木",8:"木",4:"火",9:"火"};
  const activePillars=[yp,mp,dp,hp].filter(Boolean);
  const gokaMoveStem={}; // pillarIdx -> {from:五行, to:五行}
  activePillars.forEach((a,i)=>{
    activePillars.forEach((b,j)=>{
      if(i>=j)return;
      const kg=KANGOKAN[a.stemIdx];
      if(kg&&kg.p===b.stemIdx){
        // 干合成立: 化合後の五行にカウントを移動
        const newEl=KAN_GOKA[a.stemIdx];
        if(newEl&&newEl!==a.stemEl){
          gokaMoveStem[i]={from:a.stemEl,to:newEl};
        }
        if(newEl&&newEl!==b.stemEl){
          gokaMoveStem[j]={from:b.stemEl,to:newEl};
        }
      }
    });
  });
  // 三合・方合の化合チェック（地支3柱が揃う場合）
  const SANGOU_GOKA=[[0,4,8,"水"],[2,6,10,"火"],[11,3,7,"木"],[5,9,1,"金"]];
  const HOUGOU_GOKA=[[2,3,4,"木"],[5,6,7,"火"],[8,9,10,"金"],[11,0,1,"水"]];
  const branchIdxList=activePillars.map(p=>p.branchIdx);
  const gokaMoveBranch={}; // pillarIdx -> {from:五行, to:五行}
  [...SANGOU_GOKA,...HOUGOU_GOKA].forEach(([b1,b2,b3,newEl])=>{
    if([b1,b2,b3].every(b=>branchIdxList.includes(b))){
      activePillars.forEach((p,i)=>{
        if([b1,b2,b3].includes(p.branchIdx)&&p.branchEl!==newEl){
          gokaMoveBranch[i]={from:p.branchEl,to:newEl,origEl:p.branchEl};
        }
      });
    }
  });
  // 化合で移動: 元の五行を減らして新しい五行を増やす（stemEc/branchEcも更新）
  Object.entries(gokaMoveStem).forEach(([i,{from,to}])=>{
    ec[from]--; ec[to]++; stemEc[from]--; stemEc[to]++;
  });
  Object.entries(gokaMoveBranch).forEach(([i,{from,to}])=>{
    ec[from]--; ec[to]++; branchEc[from]--; branchEc[to]++;
  });
  const daiun=calcDaiun(y,m,d,gender,mp);
  const cy=new Date().getFullYear();
  const ryunen=calcRyunen(cy-2,10,dp.stemIdx);
  const youjin=calcYoujin(ec, dp.stemEl);
  const shinSatsu = calcShinSatsu(dp.stemIdx, dp.branchIdx, yp.branchIdx, mp.branchIdx, mp.stemIdx, [yp,mp,dp,hp].filter(Boolean).map(p=>p.branchIdx), [yp,mp,dp,hp].filter(Boolean).map(p=>p.stemIdx));
  return {name,bd,bt,gender,pillars,tsuhen,junishi,zokan,ec,stemEc,branchEc,daiun,ryunen,youjin,shinSatsu,gokaMoveStem,gokaMoveBranch};
}
function calcUnnenKankei(targetBi, targetSi, meishikiBis, daySi) {
  const BN = BRANCHES;
  const tags = [];
  meishikiBis.forEach(mbi => {
    ROKUGOU.forEach(([a,b,e])=>{if((mbi===a&&targetBi===b)||(mbi===b&&targetBi===a))tags.push(`六合(${BN[mbi]}${BN[targetBi]})`);});
    SOCHUU.forEach(([a,b])=>{if((mbi===a&&targetBi===b)||(mbi===b&&targetBi===a))tags.push(`冲(${BN[mbi]}${BN[targetBi]})`);});
    KEI_PAIRS.forEach(([a,b])=>{if((mbi===a&&targetBi===b)||(mbi===b&&targetBi===a))tags.push(`刑(${BN[mbi]}${BN[targetBi]})`);});
  });
  SANGOU.forEach(([b1,b2,b3,el])=>{
    const group=[b1,b2,b3];
    if(group.includes(targetBi)){
      const others=group.filter(g=>g!==targetBi);
      if(others.every(o=>meishikiBis.includes(o)))tags.push(`三合${el}局`);
    }
  });
  if(KEI_JIKE.includes(targetBi)&&meishikiBis.includes(targetBi))tags.push(`自刑(${BN[targetBi]})`);
  const kg=KANGOKAN[targetSi];
  if(kg&&kg.p===daySi)tags.push(`干合(${kg.e})`);
  return {tags:[...new Set(tags)]};
}

const HS = {border:"1px solid #c8b89a",padding:"4px 14px",textAlign:"center",fontSize:12,color:"#7a6a55",background:"#f5efe6",fontWeight:600};
const CS = {border:"1px solid #c8b89a",padding:"4px 14px",textAlign:"center",fontSize:13,color:"#3a2e22",minWidth:74};

function ElBadge({el}) {
  const c=EC[el]||{};
  return <span style={{display:"inline-block",background:c.bg,color:c.tx,border:`1px solid ${c.bd}`,borderRadius:4,padding:"1px 5px",fontSize:11,fontWeight:600}}>{el}</span>;
}


// ═══════════════════════════════════════════════════════
// 保存リスト管理ユーティリティ
// ═══════════════════════════════════════════════════════
const SAVE_KEY = 'shichuPersons';
function savedList()  { try { return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]'); } catch { return []; } }
function saveList(l)  { localStorage.setItem(SAVE_KEY, JSON.stringify(l)); }
function savePerson(result) {
  const list = savedList();
  const exists = list.find(p=>p.name===result.name && p.bd===result.bd);
  if (exists) return false;
  list.unshift({
    name: result.name, bd: result.bd, bt: result.bt||'', gender: result.gender,
    dayEl: result.pillars.day.stemEl,
    pillars: { year: result.pillars.year, month: result.pillars.month, day: result.pillars.day },
    stemEc: result.stemEc, branchEc: result.branchEc, ec: result.ec,
    mbti: result.mbti || '',
    savedAt: new Date().toISOString()
  });
  saveList(list);
  return true;
}
// MBTIを既存人物に対して更新（命式計算は触らない、独立レイヤー）
function updateMbti(name, bd, mbti) {
  const list = savedList();
  const idx = list.findIndex(p=>p.name===name && p.bd===bd);
  if (idx<0) return false;
  list[idx].mbti = mbti;
  saveList(list);
  return true;
}
function getMbti(name, bd) {
  const list = savedList();
  const p = list.find(x=>x.name===name && x.bd===bd);
  return p?.mbti || '';
}

// ─── 五行図比較コンポーネント ────────────────────────────
function GogyouCompare({ persons, onClose }) {
  const ELS    = ["木","火","土","金","水"];
  const COLORS = {木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};

  React.useEffect(() => {
    persons.forEach((p,i) => {
      const canvas = document.getElementById('cmpCanvas'+i);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W=canvas.width, H=canvas.height, CX=W/2, CY=H/2+5;
      const R = Math.min(W,H)/2-36, cR=R*0.28, dotR=R*0.055, dotGap=R*0.115;
      ctx.clearRect(0,0,W,H);
      const dayElIdx = ELS.indexOf(p.dayEl||'木');
      const baseAngle = -90 - dayElIdx*72;
      const angles = ELS.map((_,i)=>(baseAngle+i*72)*Math.PI/180);
      const POS = angles.map(a=>({x:CX+R*Math.cos(a),y:CY+R*Math.sin(a)}));
      const DIR = angles.map(a=>({dx:Math.cos(a),dy:Math.sin(a)}));
      // 五角形
      ctx.beginPath();
      POS.forEach((pt,i)=>i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y));
      ctx.closePath(); ctx.strokeStyle='#c8b89a55'; ctx.lineWidth=1.5; ctx.stroke();
      ELS.forEach((el,i)=>{
        const col=COLORS[el], pt=POS[i], dir=DIR[i];
        const perpX=-dir.dy, perpY=dir.dx;
        const sCount=(p.stemEc&&p.stemEc[el])||0;
        const bCount=(p.branchEc&&p.branchEc[el])||0;
        // 天干点（外側）
        if(sCount>0){
          const sCX=pt.x+dir.dx*(cR+dotGap), sCY=pt.y+dir.dy*(cR+dotGap);
          for(let d=0;d<sCount;d++){
            const ox=sCX+(d-(sCount-1)/2)*dotGap*perpX, oy=sCY+(d-(sCount-1)/2)*dotGap*perpY;
            ctx.beginPath();ctx.arc(ox,oy,dotR,0,Math.PI*2);
            ctx.fillStyle=col;ctx.globalAlpha=0.95;ctx.fill();ctx.globalAlpha=1;
          }
        }
        // メイン円
        ctx.beginPath();ctx.arc(pt.x,pt.y,cR,0,Math.PI*2);
        ctx.fillStyle=col+'25';ctx.fill();
        ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
        ctx.fillStyle=col;ctx.font=`bold ${Math.round(cR*0.78)}px sans-serif`;
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(el,pt.x,pt.y);
        // 地支点（内側）
        if(bCount>0){
          const bCX=pt.x-dir.dx*(cR+dotGap), bCY=pt.y-dir.dy*(cR+dotGap);
          for(let d=0;d<bCount;d++){
            const ox=bCX+(d-(bCount-1)/2)*dotGap*perpX, oy=bCY+(d-(bCount-1)/2)*dotGap*perpY;
            ctx.beginPath();ctx.arc(ox,oy,dotR,0,Math.PI*2);
            ctx.fillStyle=col;ctx.globalAlpha=0.65;ctx.fill();ctx.globalAlpha=1;
          }
        }
      });
    });
  }, [persons]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={onClose}>
      <div style={{background:"#fdf8f2",borderRadius:16,maxWidth:720,width:"100%",boxShadow:"0 8px 40px #0004"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"linear-gradient(135deg,#1a1410,#3d2a1a)",padding:"16px 20px",borderRadius:"16px 16px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:15,fontWeight:700,color:"white"}}>📊 五行バランス比較</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",color:"white",borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:12}}>閉じる</button>
        </div>
        <div style={{padding:16,display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
          {persons.map((p,i)=>{
            const yr=p.pillars?.year, mo=p.pillars?.month, dy=p.pillars?.day;
            return (
              <div key={i} style={{background:"white",borderRadius:12,border:"1px solid #e0d8c8",padding:12,textAlign:"center",minWidth:150,flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1a1410"}}>{p.name}</div>
                <div style={{fontSize:11,color:"#7a6e68"}}>{p.bd.replace(/-/g,'/')}</div>
                {yr&&mo&&dy&&<div style={{fontSize:12,color:"#5a3a1a",letterSpacing:2,marginTop:4}}>{yr.stem}{yr.branch}・{mo.stem}{mo.branch}・{dy.stem}{dy.branch}</div>}
                <canvas id={"cmpCanvas"+i} width={180} height={180} style={{marginTop:8,display:"block",marginLeft:"auto",marginRight:"auto"}}/>
                <div style={{fontSize:10,color:"#7a6e68",marginTop:4}}>日主：<b style={{color:{木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"}[p.dayEl]||"#888"}}>{p.dayEl}</b></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 家族運勢ボード（保存リスト全員の今年の運勢一覧） ─────────────
function FamilyFortuneBoard({list}) {
  const cy = new Date().getFullYear();
  const ySi=((cy-4)%10+10)%10, yBi=((cy-4)%12+12)%12;
  const rows = list.map(p=>{
    try {
      const r = calcAll(p.name, p.bd, p.bt||"", p.gender||"male");
      const dSi = r.pillars.day.stemIdx;
      const ku = getKuubou(dSi, r.pillars.day.branchIdx);
      const du = r.daiun.list.filter(d=>d.startYear<=cy).slice(-1)[0] || r.daiun.seigo;
      return {p, dSi, dayStem:r.pillars.day.stem, dayEl:r.pillars.day.stemEl, ku, du, age: cy - Number(p.bd.split("-")[0]) + 1};
    } catch { return null; }
  }).filter(Boolean);
  const th = {border:"1px solid #c8b89a",padding:"4px 8px",fontSize:11,color:"#7a6a55",background:"#f0e8da",whiteSpace:"nowrap"};
  const td = {border:"1px solid #c8b89a",padding:"5px 8px",fontSize:12,background:"#fdf8f2",textAlign:"center",verticalAlign:"middle"};
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:700,color:"#5a3a1a",marginBottom:6}}>
        ⛩ {cy}年（{STEMS[ySi]}{BRANCHES[yBi]}年）みんなの運勢
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%"}}>
          <thead><tr><th style={th}>名前</th><th style={th}>数え</th><th style={th}>日主</th><th style={th}>今の大運</th><th style={th}>今年の通変星</th><th style={th}>今年の十二運</th><th style={th}>空亡</th></tr></thead>
          <tbody>
            {rows.map(({p,dSi,dayStem,dayEl,ku,du,age},i)=>(
              <tr key={i}>
                <td style={{...td,fontWeight:700,color:"#3a2e22",whiteSpace:"nowrap",textAlign:"left"}}>{p.name}<div style={{fontSize:9,color:"#9a8a70",fontWeight:400}}>{p.bd.replace(/-/g,"/")}</div></td>
                <td style={{...td,fontSize:11,color:"#8a6a3a"}}>{age}歳</td>
                <td style={td}><span style={{color:EC[dayEl]?.tx,fontSize:16,fontWeight:700}}>{dayStem}</span></td>
                <td style={td}>{du?<><span style={{color:EC[STEM_EL[du.stemIdx]]?.tx,fontWeight:700,fontSize:14}}>{STEMS[du.stemIdx]}</span><span style={{position:"relative",display:"inline-block",color:EC[BRANCH_EL[du.branchIdx]]?.tx,fontWeight:700,fontSize:14,marginRight:8}}>{BRANCHES[du.branchIdx]}{ku.includes(du.branchIdx)&&<span style={{position:"absolute",top:-3,right:-9,fontSize:8,color:"#c06060",fontWeight:700}}>空</span>}</span><div style={{fontSize:9,color:"#8a7a60"}}>{getTsuhen(dSi,du.stemIdx)||"—"}</div></>:"—"}</td>
                <td style={td}>{getTsuhen(dSi,ySi)||"—"}</td>
                <td style={td}>{getJunishi(dSi,yBi)}</td>
                <td style={td}>{ku.includes(yBi)?<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"#f8e0e0",color:"#c04040",fontWeight:700,border:"1px solid #e0a0a0"}}>空亡の年</span>:<span style={{color:"#b0a090"}}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{fontSize:10,color:"#8a7a60",marginTop:4}}>※ 通変星・十二運は各人の日干から見た{cy}年（{STEMS[ySi]}{BRANCHES[yBi]}）の星　／　地支右上の「空」・「空亡の年」＝空亡</div>
    </div>
  );
}

// ─── 保存リスト用 人生メモパネル ──────────────────────────
// 鑑定画面の人生メモ（shichusuimei_memo_${bd}）と同じ保管場所を共有する。
// calcAll でその場で命式を再計算し、LifeTimelineTable で大運・年運と照合表示する。
function memoCountOf(bd) {
  try { return JSON.parse(localStorage.getItem(`shichusuimei_memo_${bd}`)||'[]').length; } catch { return 0; }
}
function SavedMemoPanel({ person, onChanged }) {
  const storageKey = `shichusuimei_memo_${person.bd}`;
  const birthYear  = Number(person.bd.split("-")[0]);
  const result = React.useMemo(() => {
    try { return calcAll(person.name, person.bd, person.bt||'', person.gender||'male'); }
    catch { return null; }
  }, [person]);
  const [memos, setMemos]     = React.useState([]);
  const [newYear, setNewYear] = React.useState(String(new Date().getFullYear()));
  const [newDate, setNewDate] = React.useState("");
  const [newText, setNewText] = React.useState("");

  React.useEffect(() => {
    try { const ms = localStorage.getItem(storageKey); setMemos(ms?JSON.parse(ms):[]); } catch { setMemos([]); }
  }, [storageKey]);

  const save = (m) => {
    const sorted = [...m].sort((a,b)=> a.year!==b.year ? a.year-b.year : (a.isWork?1:0)-(b.isWork?1:0));
    setMemos(sorted);
    try { localStorage.setItem(storageKey, JSON.stringify(sorted)); } catch { /* 容量超過等 */ }
    if (onChanged) onChanged();
  };
  const add = () => {
    const year = parseInt(newYear);
    if (!year || year<1900 || year>2200 || !newText.trim()) return;
    save([...memos, {age: year-birthYear+1, year, date:newDate.trim(), text:newText.trim()}]);
    setNewText(""); setNewDate("");
  };
  const del = (i) => { if (window.confirm('このメモを削除しますか？')) save(memos.filter((_,idx)=>idx!==i)); };

  return (
    <div style={{margin:"0 4px 6px 24px",padding:"10px 12px",background:"#faf5ec",border:"1px dashed #c4a070",borderRadius:10}}>
      <div style={{fontSize:12,fontWeight:600,color:"#8a5a1a",marginBottom:6}}>📝 {person.name} さんの人生メモ<span style={{fontWeight:400,color:"#a08a68",fontSize:10,marginLeft:8}}>鑑定画面の人生メモと共通（編集は鑑定画面から）</span></div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
        <input value={newYear} onChange={e=>setNewYear(e.target.value)} placeholder="年" style={{width:56,padding:"5px 6px",border:"1px solid #d8c8a8",borderRadius:6,fontSize:12}}/>
        <input value={newDate} onChange={e=>setNewDate(e.target.value)} placeholder="日付任意 7/7" style={{width:86,padding:"5px 6px",border:"1px solid #d8c8a8",borderRadius:6,fontSize:12}}/>
        <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')add();}} placeholder="出来事（例：癌で入院／結婚／長男誕生）" style={{flex:1,minWidth:150,padding:"5px 8px",border:"1px solid #d8c8a8",borderRadius:6,fontSize:12}}/>
        <button onClick={add} style={{background:"#c88a2a",color:"#fff",border:"none",padding:"6px 14px",borderRadius:16,fontSize:12,cursor:"pointer",fontWeight:600}}>追加</button>
      </div>
      {memos.length===0 ? (
        <div style={{fontSize:11,color:"#b0a090",padding:"2px 0"}}>メモはまだありません。「2026／癌で入院」のように年＋出来事で追加すると、大運・年運との照合表が下に出ます。</div>
      ) : (
        <>
          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:10}}>
            {memos.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#3a3028",background:"#fff",border:"1px solid #ece2d0",borderRadius:6,padding:"4px 8px"}}>
                <span style={{color:"#8a6010",fontWeight:600,whiteSpace:"nowrap"}}>{m.year}年{m.date?` ${m.date}`:""}（数え{m.age||m.year-birthYear+1}歳）</span>
                <span style={{flex:1}}>{m.text}</span>
                <button onClick={()=>del(i)} style={{background:"none",border:"none",color:"#bbb",cursor:"pointer",fontSize:12}}>✕</button>
              </div>
            ))}
          </div>
          <LifeTimelineTable memos={memos} birthYear={birthYear} mainResult={result}/>
        </>
      )}
    </div>
  );
}

// ─── 保存リストタブ ──────────────────────────────────────
// ─── クラウド同期バー（GitHub非公開リポジトリ） ──────────────────
function SyncBar() {
  const [st, setSt] = React.useState(getSyncStatus());
  const [open, setOpen] = React.useState(false);
  const [tok, setTok] = React.useState("");
  const [hasToken, setHasToken] = React.useState(!!getSyncToken());
  React.useEffect(() => {
    const h = (e) => setSt(e.detail);
    window.addEventListener('shichuSyncStatus', h);
    return () => window.removeEventListener('shichuSyncStatus', h);
  }, []);
  const label = !hasToken ? "☁ 同期設定"
    : st.status === 'syncing' ? "☁ 同期中…"
    : st.status === 'error' ? "☁ ⚠ エラー"
    : "☁ 同期✓";
  const saveToken = () => {
    if (!tok.trim()) return;
    setSyncToken(tok); setTok(""); setHasToken(true); setOpen(false);
    pullNow();
  };
  const clearToken = () => {
    if (!window.confirm('この端末の同期を解除しますか？（クラウドのデータは残ります）')) return;
    setSyncToken(""); setHasToken(false); setOpen(false);
  };
  return (
    <div style={{position:"relative",display:"inline-block"}}>
      <button onClick={()=>setOpen(v=>!v)} title={st.msg}
        style={{background:hasToken?(st.status==='error'?"#fdecec":"#eef8ee"):"#f5f0e8",border:`1px solid ${hasToken?(st.status==='error'?"#d08080":"#80b080"):"#c4a070"}`,color:hasToken?(st.status==='error'?"#a04040":"#2a6a2a"):"#8a6010",padding:"7px 16px",borderRadius:20,fontSize:12,cursor:"pointer"}}>{label}</button>
      {open && (
        <div style={{position:"absolute",top:"110%",left:0,zIndex:200,background:"#fff",border:"1px solid #c4a070",borderRadius:10,padding:12,minWidth:290,boxShadow:"0 4px 20px #0003"}}>
          {hasToken ? (
            <>
              <div style={{fontSize:11,color:"#5a4a3a",marginBottom:8}}>この端末は自動同期が有効です。<br/>状態：{st.msg||st.status}</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{pullNow();setOpen(false);}} style={{padding:"5px 12px",borderRadius:6,background:"#2a7a2a",border:"none",color:"#fff",fontSize:11,cursor:"pointer"}}>今すぐ同期</button>
                <button onClick={clearToken} style={{padding:"5px 12px",borderRadius:6,background:"#fff",border:"1px solid #d08080",color:"#a04040",fontSize:11,cursor:"pointer"}}>同期を解除</button>
              </div>
            </>
          ) : (
            <>
              <div style={{fontSize:11,color:"#5a4a3a",marginBottom:6,lineHeight:1.6}}>GitHubトークンを貼り付けると、保存リスト・メモ・家族がこの端末とクラウドで自動同期されます（初回1回だけ）。</div>
              <input type="password" value={tok} onChange={e=>setTok(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveToken();}} placeholder="github_pat_… を貼り付け"
                style={{width:"100%",boxSizing:"border-box",padding:"6px 8px",border:"1px solid #c8b8a0",borderRadius:6,fontSize:12,marginBottom:8}}/>
              <button onClick={saveToken} disabled={!tok.trim()} style={{padding:"5px 14px",borderRadius:6,background:tok.trim()?"#2a7a2a":"#ccc",border:"none",color:"#fff",fontSize:11,cursor:tok.trim()?"pointer":"not-allowed",fontWeight:700}}>保存して同期開始</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 保存リスト用 家族パネル ──────────────────────────────
// 鑑定画面の家族情報（shichusuimei_children_${bd}）と同じ保管場所を共有する。
function familyCountOf(bd) {
  try { return JSON.parse(localStorage.getItem(`shichusuimei_children_${bd}`)||'[]').length; } catch { return 0; }
}
function SavedFamilyPanel({ person, onChanged }) {
  const childrenKey = `shichusuimei_children_${person.bd}`;
  const [children, setChildren] = React.useState([]);
  const [newName, setNewName]     = React.useState("");
  const [newYear, setNewYear]     = React.useState(String(new Date().getFullYear()-30));
  const [newMonth, setNewMonth]   = React.useState("1");
  const [newDay, setNewDay]       = React.useState("1");
  const [newTime, setNewTime]     = React.useState("");
  const [newGender, setNewGender] = React.useState("male");
  const [view, setView]           = React.useState(null); // {member, result}

  React.useEffect(() => {
    try { const cs = localStorage.getItem(childrenKey); setChildren(cs?JSON.parse(cs):[]); } catch { setChildren([]); }
  }, [childrenKey]);

  const save = (c) => {
    setChildren(c);
    try { localStorage.setItem(childrenKey, JSON.stringify(c)); } catch { /* 容量超過等 */ }
    if (onChanged) onChanged();
  };
  const add = () => {
    if (!newName.trim()) return;
    save([...children, {name:newName.trim(), birthYear:Number(newYear), birthMonth:Number(newMonth), birthDay:Number(newDay), birthTime:newTime, gender:newGender}]);
    setNewName(""); setNewTime("");
  };
  const del = (i) => { if (window.confirm(children[i].name+'さんを家族から削除しますか？')) save(children.filter((_,idx)=>idx!==i)); };
  const openMeishiki = (c) => {
    try {
      const bd = `${c.birthYear}-${String(c.birthMonth).padStart(2,'0')}-${String(c.birthDay).padStart(2,'0')}`;
      setView({ member:c, result: calcAll(c.name, bd, c.birthTime||'', c.gender||'male') });
    } catch { /* 生年月日不備は無視 */ }
  };

  return (
    <div style={{margin:"0 4px 6px 24px",padding:"10px 12px",background:"#f5faf0",border:"1px dashed #8ab070",borderRadius:10}}>
      {view && <FamilyMeishikiModal member={view.member} memberResult={view.result} onClose={()=>setView(null)}/>}
      <div style={{fontSize:12,fontWeight:600,color:"#3a6a2a",marginBottom:6}}>👨‍👩‍👧‍👦 {person.name} さんの家族<span style={{fontWeight:400,color:"#7a9a7a",fontSize:10,marginLeft:8}}>鑑定画面の家族情報と共通</span></div>
      <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="名前" style={{width:70,padding:"4px 6px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}/>
        <select value={newYear} onChange={e=>setNewYear(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
          {Array.from({length:101},(_,i)=>new Date().getFullYear()-i).map(y=><option key={y} value={y}>{y}年</option>)}
        </select>
        <select value={newMonth} onChange={e=>setNewMonth(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
          {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{m}月</option>)}
        </select>
        <select value={newDay} onChange={e=>setNewDay(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
          {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}日</option>)}
        </select>
        <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11,width:90}}/>
        <select value={newGender} onChange={e=>setNewGender(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
        <button onClick={add} disabled={!newName.trim()} style={{padding:"4px 10px",borderRadius:5,background:newName.trim()?"#5a9a5a":"#ccc",border:"none",color:"#fff",fontSize:11,cursor:newName.trim()?"pointer":"not-allowed",fontWeight:700}}>追加</button>
      </div>
      {children.length===0 ? (
        <div style={{fontSize:11,color:"#90a888",padding:"2px 0"}}>家族はまだ登録されていません。名前と生年月日を入れて「追加」してください。</div>
      ) : children.map((c,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 6px",background:"#fff",borderRadius:5,border:"1px solid #c0d8b0",marginBottom:3}}>
          <span style={{fontSize:11,flex:1,color:"#3a5a3a"}}>{c.name}（{c.birthYear}/{c.birthMonth}/{c.birthDay}{c.birthTime?" "+c.birthTime:""}・{c.gender==="female"?"女":"男"}）</span>
          <button onClick={()=>openMeishiki(c)} style={{padding:"1px 8px",borderRadius:4,background:"#eef5e8",border:"1px solid #a0c080",color:"#3a6a2a",fontSize:10,cursor:"pointer"}}>命式</button>
          <button onClick={()=>del(i)} style={{padding:"1px 6px",borderRadius:4,background:"transparent",border:"1px solid #e0a0a0",color:"#c06060",fontSize:9,cursor:"pointer"}}>✕</button>
        </div>
      ))}
    </div>
  );
}

function SavedListTab({ onLoad }) {
  const [list, setList]       = React.useState(savedList());
  const [selected, setSelected] = React.useState([]);
  const [comparing, setComparing] = React.useState(false);
  const [showBoard, setShowBoard] = React.useState(true);
  const [memoOpen, setMemoOpen] = React.useState(null);   // 人生メモパネルを開いている行index
  const [memoTick, setMemoTick] = React.useState(0);      // メモ更新時に件数バッジを再描画
  const [familyOpen, setFamilyOpen] = React.useState(null); // 家族パネルを開いている行index
  const [familyTick, setFamilyTick] = React.useState(0);    // 家族更新時に件数バッジを再描画
  const memoCounts = React.useMemo(() => list.map(p=>memoCountOf(p.bd)), [list, memoTick]);
  const familyCounts = React.useMemo(() => list.map(p=>familyCountOf(p.bd)), [list, familyTick]);

  // タブ表示・保存イベント・クラウド同期のたびに最新データを読み込む
  React.useEffect(() => {
    setList(savedList());
    const handler = () => setList(savedList());
    const syncHandler = () => { setList(savedList()); setMemoTick(t=>t+1); setFamilyTick(t=>t+1); };
    window.addEventListener('shichuSaved', handler);
    window.addEventListener('shichuSynced', syncHandler);
    return () => { window.removeEventListener('shichuSaved', handler); window.removeEventListener('shichuSynced', syncHandler); };
  }, []);

  const reload = () => setList(savedList());

  // ── グループ（カテゴリー）分け ──
  const [groupFilter, setGroupFilter] = React.useState('all'); // 'all' | '__none__' | グループ名
  // 旧アプリのメモ「／グループ：○○」から初期グループを復元（group未設定の人のみ）
  React.useEffect(() => {
    const l = savedList(); let changed = false;
    l.forEach(p=>{
      if (p.group !== undefined) return;
      let g = '';
      try {
        const ms = JSON.parse(localStorage.getItem(`shichusuimei_memo_${p.bd}`)||'[]');
        for (const m of ms) { const mt = /グループ[：:]\s*([^\s／、,]+)/.exec(m.text||''); if (mt) { g = mt[1]; break; } }
      } catch { /* 破損データは無視 */ }
      if (g === '未分類') g = '';
      p.group = g; changed = true;
    });
    if (changed) { saveList(l); setList(l.slice()); }
  }, []);
  const changeGroup = (i, g) => {
    const l = savedList();
    if (!l[i] || (l[i].group||'') === g.trim()) return;
    l[i].group = g.trim(); saveList(l); reload();
  };
  const groups = React.useMemo(()=>[...new Set(list.map(p=>p.group).filter(Boolean))], [list]);
  const items = list.map((p,i)=>({p,i})).filter(({p}) =>
    groupFilter==='all' ? true : groupFilter==='__none__' ? !p.group : p.group===groupFilter
  );

  const toggle = (i) => setSelected(prev =>
    prev.includes(i) ? prev.filter(x=>x!==i) : [...prev,i]
  );

  const doDelete = (i) => {
    const l = savedList(); l.splice(i,1); saveList(l);
    setSelected(s=>s.filter(x=>x!==i).map(x=>x>i?x-1:x));
    setMemoOpen(null);
    reload();
  };

  const doCompare = () => {
    if (selected.length<2) { alert('2人以上選択してください'); return; }
    if (selected.length>4) { alert('4人まで選択できます'); return; }
    setComparing(true);
  };

  // ── JSONバックアップ（保存リスト＋各人の人生メモ・家族データを丸ごと） ──
  const downloadJSON = () => {
    const l = savedList();
    const memos = {}, children = {};
    l.forEach(p=>{
      try { const m = localStorage.getItem(`shichusuimei_memo_${p.bd}`); if(m) memos[p.bd]=JSON.parse(m); } catch { /* 破損データは無視 */ }
      try { const c = localStorage.getItem(`shichusuimei_children_${p.bd}`); if(c) children[p.bd]=JSON.parse(c); } catch { /* 破損データは無視 */ }
    });
    const data = {app:"shichusuimei", type:"persons_backup", exportedAt:new Date().toISOString(), persons:l, memos, children};
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download = `四柱推命_保存リスト_${new Date().toISOString().slice(0,10)}.json`; a.click();
  };
  // ── JSONインポート（重複はスキップしてマージ） ──
  const importJSON = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result.trim());
        if (data.savedKantei) { alert('旧HTML版のバックアップ形式のため取り込めません。\nこのアプリの「⬇ バックアップ」で出力したJSONを使ってください。'); return; }
        if (!Array.isArray(data.persons)) { alert('形式が正しくありません（personsキーが見つかりません）。'); return; }
        const cur = savedList();
        // 最小項目（名前・生年月日・性別・時刻）だけの人物は calcAll で命式を再計算して補完する
        const normalize = (np) => {
          if (np.pillars && np.dayEl && np.ec) return np;
          try {
            const r = calcAll(np.name, np.bd, np.bt||'', np.gender||'male');
            return {
              name: np.name, bd: np.bd, bt: np.bt||'', gender: np.gender||'male',
              dayEl: r.pillars.day.stemEl,
              pillars: { year: r.pillars.year, month: r.pillars.month, day: r.pillars.day },
              stemEc: r.stemEc, branchEc: r.branchEc, ec: r.ec,
              mbti: np.mbti||'', group: np.group||'', savedAt: np.savedAt||new Date().toISOString()
            };
          } catch { return null; }
        };
        const newPersons = data.persons
          .filter(np=>np&&np.name&&np.bd&&!cur.find(p=>p.name===np.name&&p.bd===np.bd))
          .map(normalize).filter(Boolean);
        saveList([...cur, ...newPersons]);
        let memoAdd = 0;
        Object.entries(data.memos||{}).forEach(([bd, arr])=>{
          if (!Array.isArray(arr)) return;
          let curM = [];
          try { curM = JSON.parse(localStorage.getItem(`shichusuimei_memo_${bd}`)||'[]'); } catch { curM = []; }
          arr.forEach(m=>{ if(m&&m.year&&m.text&&!curM.find(x=>x.year===m.year&&x.text===m.text)){ curM.push(m); memoAdd++; } });
          curM.sort((a,b)=>a.year-b.year);
          try { localStorage.setItem(`shichusuimei_memo_${bd}`, JSON.stringify(curM)); } catch { /* 容量超過等 */ }
        });
        Object.entries(data.children||{}).forEach(([bd, arr])=>{
          if (Array.isArray(arr) && !localStorage.getItem(`shichusuimei_children_${bd}`)) {
            try { localStorage.setItem(`shichusuimei_children_${bd}`, JSON.stringify(arr)); } catch { /* 容量超過等 */ }
          }
        });
        setMemoTick(t=>t+1);
        reload();
        alert(`インポート完了\n人物：${newPersons.length}件追加（重複${data.persons.length-newPersons.length}件スキップ）\n人生メモ：${memoAdd}件追加`);
      } catch (err) { alert('読み込みエラー：'+err.message); }
    };
    reader.readAsText(file); e.target.value='';
  };

  const downloadCSV = () => {
    const l = savedList();
    if (!l.length) return;
    const header = '名前,生年月日,性別,グループ,日主,年柱,月柱,日柱,木,火,土,金,水';
    const rows = l.map(p=>{
      const yr=p.pillars?.year, mo=p.pillars?.month, dy=p.pillars?.day;
      return [
        p.name, p.bd, p.gender==='male'?'男性':'女性', p.group||'', p.dayEl||'',
        yr?yr.stem+yr.branch:'', mo?mo.stem+mo.branch:'', dy?dy.stem+dy.branch:'',
        p.ec?.木||0,p.ec?.火||0,p.ec?.土||0,p.ec?.金||0,p.ec?.水||0
      ].join(',');
    });
    const csv = '\uFEFF'+header+'\n'+rows.join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = '四柱推命リスト.csv'; a.click();
  };

  const GCOLS = {木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};

  return (
    <div style={{border:"1px solid #c4a070",borderTop:"none",borderRadius:"0 8px 8px 8px",padding:16,background:"rgba(253,248,242,0.95)"}}>
      {comparing && (
        <GogyouCompare persons={selected.map(i=>list[i])} onClose={()=>setComparing(false)}/>
      )}
      <div style={{marginBottom:10,display:"flex",gap:8,flexWrap:"wrap"}}>
        {list.length>0 && (
          <>
            <button onClick={()=>setShowBoard(v=>!v)} style={{background:showBoard?"#c88a2a":"#f5f0e8",border:"1px solid #c88a2a",color:showBoard?"#fff":"#8a5a1a",padding:"7px 16px",borderRadius:20,fontSize:12,cursor:"pointer",fontWeight:600}}>⛩ 今年の運勢ボード</button>
            <button onClick={doCompare} style={{background:"linear-gradient(135deg,#1a1410,#3d2a1a)",color:"#f5f0e8",border:"none",padding:"7px 16px",borderRadius:20,fontSize:12,cursor:"pointer",fontWeight:600}}>📊 五行比較（{selected.length}人選択中）</button>
            <button onClick={downloadCSV} style={{background:"#f5f0e8",border:"1px solid #c4a070",color:"#8a6010",padding:"7px 16px",borderRadius:20,fontSize:12,cursor:"pointer"}}>⬇ CSV保存</button>
            <button onClick={downloadJSON} style={{background:"#f5f0e8",border:"1px solid #c4a070",color:"#8a6010",padding:"7px 16px",borderRadius:20,fontSize:12,cursor:"pointer"}}>⬇ バックアップ(JSON)</button>
          </>
        )}
        <label style={{background:"#eef4fa",border:"1px solid #8aaac8",color:"#2a5a8a",padding:"7px 16px",borderRadius:20,fontSize:12,cursor:"pointer",display:"inline-flex",alignItems:"center"}}>
          📤 インポート(.json)
          <input type="file" accept=".json,application/json" onChange={importJSON} style={{display:"none"}}/>
        </label>
        <SyncBar/>
      </div>
      {list.length===0 ? (
        <div style={{textAlign:"center",padding:32,color:"#7a6e68",fontSize:13}}>保存された人物はいません<br/><span style={{fontSize:11}}>鑑定後「💾 保存」ボタンで追加するか、上の「📤 インポート」でバックアップJSONを取り込めます</span></div>
      ) : (
        <>
          {groups.length>0 && (
            <div style={{marginBottom:10,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#8a7a60"}}>グループ：</span>
              <button onClick={()=>setGroupFilter('all')} style={{background:groupFilter==='all'?"#c88a2a":"#f5f0e8",color:groupFilter==='all'?"#fff":"#8a5a1a",border:"1px solid #c88a2a",padding:"4px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:600}}>全員 {list.length}</button>
              {groups.map(g=>(
                <button key={g} onClick={()=>setGroupFilter(g)} style={{background:groupFilter===g?"#c88a2a":"#f5f0e8",color:groupFilter===g?"#fff":"#8a5a1a",border:"1px solid #c88a2a",padding:"4px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:600}}>{g} {list.filter(p=>p.group===g).length}</button>
              ))}
              {list.some(p=>!p.group) && (
                <button onClick={()=>setGroupFilter('__none__')} style={{background:groupFilter==='__none__'?"#c88a2a":"#f5f0e8",color:groupFilter==='__none__'?"#fff":"#8a5a1a",border:"1px solid #c88a2a",padding:"4px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:600}}>未分類 {list.filter(p=>!p.group).length}</button>
              )}
            </div>
          )}
          {showBoard && <FamilyFortuneBoard list={items.map(x=>x.p)}/>}
          <datalist id="shichu-groups">{groups.map(g=><option key={g} value={g}/>)}</datalist>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {items.map(({p,i})=>(
              <React.Fragment key={i}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:selected.includes(i)?"#fdf0e0":"white",borderRadius:10,border:`1px solid ${selected.includes(i)?"#c4a070":"#e8e0d0"}`,cursor:"pointer"}} onClick={()=>toggle(i)}>
                <input type="checkbox" checked={selected.includes(i)} onChange={()=>toggle(i)} onClick={e=>e.stopPropagation()} style={{width:16,height:16,accentColor:"#c4973a",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1a1410"}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#7a6e68"}}>{p.bd.replace(/-/g,'/')} · {p.gender==='male'?'男性':'女性'} · 日主：<b style={{color:GCOLS[p.dayEl]||"#888"}}>{p.dayEl}</b></div>
                </div>
                <input list="shichu-groups" key={`g${i}-${p.group||''}`} defaultValue={p.group||''} placeholder="グループ"
                  onClick={e=>e.stopPropagation()}
                  onBlur={e=>changeGroup(i, e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')e.target.blur();}}
                  style={{width:76,fontSize:11,border:"1px solid #e0d4c0",borderRadius:8,padding:"3px 6px",background:p.group?"#fdf0dc":"#fff",color:"#8a6010",flexShrink:0}}/>
                <button onClick={e=>{e.stopPropagation();setMemoOpen(memoOpen===i?null:i);}} style={{background:memoOpen===i?"#c88a2a":(memoCounts[i]>0?"#fdf0dc":"#f5f0e8"),border:"1px solid #c4a070",borderRadius:20,padding:"3px 10px",fontSize:11,cursor:"pointer",color:memoOpen===i?"#fff":"#8a6010",whiteSpace:"nowrap",fontWeight:memoCounts[i]>0?600:400}}>📝{memoCounts[i]>0?` ${memoCounts[i]}`:" メモ"}</button>
                <button onClick={e=>{e.stopPropagation();setFamilyOpen(familyOpen===i?null:i);}} style={{background:familyOpen===i?"#5a9a5a":(familyCounts[i]>0?"#eef5e8":"#f5f0e8"),border:"1px solid #8ab070",borderRadius:20,padding:"3px 10px",fontSize:11,cursor:"pointer",color:familyOpen===i?"#fff":"#3a6a2a",whiteSpace:"nowrap",fontWeight:familyCounts[i]>0?600:400}}>👨‍👩‍👧‍👦{familyCounts[i]>0?` ${familyCounts[i]}`:""}</button>
                <button onClick={e=>{e.stopPropagation();onLoad(p);}} style={{background:"#f5f0e8",border:"1px solid #c4a070",borderRadius:20,padding:"3px 10px",fontSize:11,cursor:"pointer",color:"#8a6010",whiteSpace:"nowrap"}}>📋 開く</button>
                <button onClick={e=>{e.stopPropagation();if(window.confirm(p.name+'を削除しますか？'))doDelete(i);}} style={{background:"none",border:"1px solid #e0d8c8",borderRadius:20,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#aaa"}}>✕</button>
              </div>
              {memoOpen===i && <SavedMemoPanel person={p} onChanged={()=>setMemoTick(t=>t+1)}/>}
              {familyOpen===i && <SavedFamilyPanel person={p} onChanged={()=>setFamilyTick(t=>t+1)}/>}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GogyouCircle({ec, stemEc, branchEc, extraEc, gokaInfo, dayEl, scale=1}) {
  const ELS = ["木","火","土","金","水"];
  const COLORS = {木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};
  // SVGサイズを大きくして余白を確保
  const W=300*scale, H=300*scale, CX=150*scale, CY=155*scale, R=100*scale;
  // 日干の五行が常に北（上・-90度）に来るよう回転オフセットを計算
  const dayElIdx = dayEl ? ELS.indexOf(dayEl) : 0;
  const baseAngle = -90 - dayElIdx * 72;
  const angles = ELS.map((_,i) => baseAngle + i*72);
  const POS = ELS.map((_,i)=>({x:CX+R*Math.cos(angles[i]*Math.PI/180),y:CY+R*Math.sin(angles[i]*Math.PI/180)}));
  const DIR = ELS.map((_,i)=>({dx:Math.cos(angles[i]*Math.PI/180),dy:Math.sin(angles[i]*Math.PI/180)}));
  const cR=30*scale;
  const dotR=5*scale, dotGap=11*scale;

  return (
    <svg width={W} height={H} viewBox={"0 0 "+W+" "+H} style={{display:"block"}}>
      {/* 五角形の線 */}
      <polygon points={POS.map(p=>p.x+","+p.y).join(" ")} fill="none" stroke="#c8b89a55" strokeWidth={1.5}/>
      {ELS.map((el,i)=>{
        const p=POS[i], col=COLORS[el], dir=DIR[i];
        const sCount=(stemEc&&stemEc[el])||0;
        const bCount=(branchEc&&branchEc[el])||0;
        const eCount=(extraEc&&extraEc[el])||0;
        const perpX=-dir.dy, perpY=dir.dx;
        // 天干の点: 大きい丸のすぐ外側（円の縁から10px外）
        const sDist = cR+12;
        const sCX = p.x + dir.dx*sDist;
        const sCY = p.y + dir.dy*sDist;
        // 地支の点: 大きい丸のすぐ内側（円の縁から10px内）
        const bDist = cR+12;
        const bCX = p.x - dir.dx*bDist;
        const bCY = p.y - dir.dy*bDist;

        return (
          <g key={el}>
            {/* 天干の点（外側・大きい丸に近い） */}
            {sCount>0 && Array.from({length:sCount},(_,di)=>{
              const ox = sCX + (di-(sCount-1)/2)*dotGap*perpX;
              const oy = sCY + (di-(sCount-1)/2)*dotGap*perpY;
              return <circle key={"s"+di} cx={ox} cy={oy} r={dotR} fill={col} opacity={0.95}/>;
            })}
            {/* メイン円（五行） */}
            <circle cx={p.x} cy={p.y} r={cR} fill={col+"25"} stroke={col} strokeWidth={2.5}/>
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fill={col} fontSize={24} fontWeight={700}>{el}</text>
            {/* 地支の点（内側・大きい丸に近い） */}
            {bCount>0 && Array.from({length:bCount},(_,di)=>{
              const ox = bCX + (di-(bCount-1)/2)*dotGap*perpX;
              const oy = bCY + (di-(bCount-1)/2)*dotGap*perpY;
              return <circle key={"b"+di} cx={ox} cy={oy} r={dotR} fill={col} opacity={0.7}/>;
            })}
            {/* 大運・年運の点（さらに内側） */}
            {eCount>0 && Array.from({length:eCount},(_,di)=>{
              const eDist = cR+28;
              const eCX = p.x - dir.dx*eDist;
              const eCY = p.y - dir.dy*eDist;
              const ox = eCX + (di-(eCount-1)/2)*dotGap*perpX;
              const oy = eCY + (di-(eCount-1)/2)*dotGap*perpY;
              return <circle key={"e"+di} cx={ox} cy={oy} r={3} fill={col} opacity={0.4}/>;
            })}
            {/* 化合で移動してきた点（元の色で表示・大きい丸の外側に） */}
            {gokaInfo && gokaInfo.filter(g=>g.toEl===el).map((g,gi)=>{
              const gx = p.x + dir.dx*(cR+14) + perpX*(gi+1)*13;
              const gy = p.y + dir.dy*(cR+14) + perpY*(gi+1)*13;
              return <g key={"goka"+gi}>
                <circle cx={gx} cy={gy} r={dotR+1} fill={g.color} opacity={0.85} strokeDasharray="3,2" stroke={g.color} strokeWidth={1}/>
                <text x={gx} y={gy} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#fff" fontWeight={700}>{g.type==="stem"?"天":"支"}</text>
              </g>;
            })}
          </g>
        );
      })}
    </svg>
  );
}


function MeishikiTable({data}) {
  const {pillars,tsuhen,junishi,zokan,shinSatsu} = data;
  const dp = pillars.day;
  const kuubou = getKuubou(dp.stemIdx, dp.branchIdx);
  const cols = [
    {label:"時柱",p:pillars.hour,th:tsuhen.hour,ju:junishi.hour,zk:zokan.hour},
    {label:"日柱",p:pillars.day,th:null,ju:junishi.day,zk:zokan.day},
    {label:"月柱",p:pillars.month,th:tsuhen.month,ju:junishi.month,zk:zokan.month},
    {label:"年柱",p:pillars.year,th:tsuhen.year,ju:junishi.year,zk:zokan.year},
  ];
  const byBi = shinSatsu?.byBi || {};
  const bySi = shinSatsu?.bySi || {};
  // bySi の添字は calcAll の allSi＝[年,月,日,時] 順（cols の並びとは逆）
  const SI_IDX = {"年柱":0,"月柱":1,"日柱":2,"時柱":3};
  const ADJACENT_PAIRS = [[0,1],[1,2],[2,3]];
  const stemNote = {}, branchNote = {};
  cols.filter(c=>c.p).forEach((a,i,arr)=>{
    arr.forEach((b,j)=>{
      if(i>=j||!b.p)return;
      const isAdj=ADJACENT_PAIRS.some(([x,y])=>i===x&&j===y);
      if(KANGOKAN[a.p.stemIdx]?.p===b.p.stemIdx){
        stemNote[a.label]=[...(stemNote[a.label]||[]),`干合(${KANGOKAN[a.p.stemIdx].e})`];
        stemNote[b.label]=[...(stemNote[b.label]||[]),`干合(${KANGOKAN[a.p.stemIdx].e})`];
      }
      if(KAN_KOKOKU_PAIRS.some(([x,y])=>(a.p.stemIdx===x&&b.p.stemIdx===y)||(a.p.stemIdx===y&&b.p.stemIdx===x))){
        stemNote[a.label]=[...(stemNote[a.label]||[]),"剋"]; stemNote[b.label]=[...(stemNote[b.label]||[]),"剋"];
      }
      if(isAdj){
        const isRG=ROKUGOU.some(([x,y])=>(a.p.branchIdx===x&&b.p.branchIdx===y)||(a.p.branchIdx===y&&b.p.branchIdx===x));
        const isSC=SOCHUU.some(([x,y])=>(a.p.branchIdx===x&&b.p.branchIdx===y)||(a.p.branchIdx===y&&b.p.branchIdx===x));
        const isKango=KANGOKAN[a.p.stemIdx]?.p===b.p.stemIdx;
        const isTensenKan=KAN_KOKOKU_PAIRS.some(([x,y])=>(a.p.stemIdx===x&&b.p.stemIdx===y)||(a.p.stemIdx===y&&b.p.stemIdx===x));
        if(isKango&&isRG){stemNote[a.label]=[...(stemNote[a.label]||[]),"天地徳合"];stemNote[b.label]=[...(stemNote[b.label]||[]),"天地徳合"];}
        if(isTensenKan&&isSC){stemNote[a.label]=[...(stemNote[a.label]||[]),"天戦地冲"];stemNote[b.label]=[...(stemNote[b.label]||[]),"天戦地冲"];}
        ROKUGOU.forEach(([x,y,e])=>{if((a.p.branchIdx===x&&b.p.branchIdx===y)||(a.p.branchIdx===y&&b.p.branchIdx===x)){branchNote[a.label]=[...(branchNote[a.label]||[]),`六合(${e})`];branchNote[b.label]=[...(branchNote[b.label]||[]),`六合(${e})`];}});
        SOCHUU.forEach(([x,y])=>{if((a.p.branchIdx===x&&b.p.branchIdx===y)||(a.p.branchIdx===y&&b.p.branchIdx===x)){branchNote[a.label]=[...(branchNote[a.label]||[]),"相冲"];branchNote[b.label]=[...(branchNote[b.label]||[]),"相冲"];}});
      }
    });
  });
  const activeBranches = cols.filter(c=>c.p).map(c=>({label:c.label,bi:c.p.branchIdx}));
  SANGOU.forEach(([b1,b2,b3,el])=>{
    const matched=activeBranches.filter(({bi})=>bi===b1||bi===b2||bi===b3);
    if(matched.length===3)matched.forEach(({label})=>{branchNote[label]=[...(branchNote[label]||[]),`三合(${el})`];});
  });
  cols.forEach(c=>{
    if(branchNote[c.label]){
      const hasSangou=branchNote[c.label].some(n=>n.includes("三合"));
      if(hasSangou){branchNote[c.label]=branchNote[c.label].filter(n=>!n.includes("六合"));}
    }
  });
  cols.forEach(c=>{const si=bySi[SI_IDX[c.label]];if(si){si.forEach(m=>{stemNote[c.label]=[...(stemNote[c.label]||[]),m];});}});
  const nbadge=(t,col)=><span style={{display:"inline-block",fontSize:8,padding:"1px 4px",borderRadius:3,border:`1px solid ${col}44`,background:`${col}18`,color:col,margin:"1px",lineHeight:1.4}}>{t}</span>;
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%"}}>
        <thead><tr><td style={HS}></td>{cols.map(c=><th key={c.label} style={HS}>{c.label}</th>)}</tr></thead>
        <tbody>
          <tr><td style={HS}>天干</td>{cols.map((c,ci)=>{ if(!c.p) return <td key={c.label} style={{...CS,color:"#b0a090"}}>—</td>; const sc=EC[c.p.stemEl]; const smarks=bySi[SI_IDX[c.label]]||[]; const isDay=ci===1; return <td key={c.label} style={{...CS,padding:"4px 3px",position:"relative",background:isDay?"#fdf0e0":""}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>{smarks.length>0&&<span style={{fontSize:8,color:"#a07010",fontWeight:700}}>{smarks.join("")}</span>}<span style={{fontSize:30,fontWeight:700,color:sc?.tx,writingMode:isDay?"vertical-rl":"horizontal-tb",textOrientation:isDay?"upright":"mixed",letterSpacing:isDay?4:0}}>{c.p.stem}</span><span style={{fontSize:12,color:sc?.tx}}>{c.p.stemEl}</span></div></td>; })}</tr>
          <tr><td style={HS}>通変星</td>{cols.map((c,i)=>{
            const sn=stemNote[c.label]||[];
            const isDayMain=i===1;
            const tensen=sn.filter(s=>s.includes("天戦")), tenchigou=sn.filter(s=>s.includes("天地")), kango=sn.filter(s=>s.includes("干合")), koku=sn.filter(s=>s==="剋");
            return <td key={c.label} style={{...CS,fontSize:11,padding:"3px 4px",verticalAlign:"top"}}>
              {isDayMain?<span style={{color:"#8a7a60"}}>日主</span>:(c.th&&TSUHEN_DESC[c.th]?<ClickTooltip label={c.th} desc={TSUHEN_DESC[c.th].txt} kw={TSUHEN_DESC[c.th].kw} color="#8a5a1a"/>:(c.th||"—"))}
              {tenchigou.map((t,k)=><div key={k} style={{fontSize:8,color:"#a07010",marginTop:2}}>{t}</div>)}
              {tensen.map((t,k)=><div key={k} style={{fontSize:8,color:"#f07070",marginTop:2}}>{t}</div>)}
              {kango.map((t,k)=><div key={k} style={{fontSize:8,color:"#2070a0",marginTop:2}}>{t}</div>)}
              {koku.map((t,k)=><div key={k} style={{fontSize:8,color:"#c04040",marginTop:2}}>{t}</div>)}
            </td>;
          })}</tr>
          <tr><td style={HS}>地支</td>{cols.map(c=>{
            if(!c.p) return <td key={c.label} style={{...CS,color:"#b0a090"}}>—</td>;
            const bc=EC[c.p.branchEl];
            const marks=(byBi[c.p.branchIdx]||[]).filter(m=>m!=="刑");
            const kou=marks.filter(m=>["貴","文","学","驛","将","禄","桃","紅"].includes(m));
            const kyo=marks.filter(m=>["亡","劫","孤","元","弔","喪","羊"].includes(m));
            return <td key={c.label} style={{...CS,padding:"3px 2px"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
                <div style={{fontSize:9,color:"#c09020",letterSpacing:1,lineHeight:1.3,minHeight:13}}>{kou.length>0?kou.join(" "):""}</div>
                <div style={{fontSize:8,color:"#c8b89a",lineHeight:1}}>―</div>
                <span style={{position:"relative",display:"inline-block",fontSize:30,fontWeight:700,color:bc?.tx}}>{c.p.branch}{kuubou.includes(c.p.branchIdx)&&<span style={{position:"absolute",top:-4,right:-14,fontSize:10,color:"#c06060",fontWeight:700}}>空</span>}</span>
                <span style={{fontSize:12,color:bc?.tx}}>{c.p.branchEl}</span>
                <div style={{fontSize:8,color:"#c8b89a",lineHeight:1}}>―</div>
                <div style={{fontSize:9,color:"#b07010",letterSpacing:1,lineHeight:1.3,minHeight:13}}>{kyo.length>0?kyo.join(" "):""}</div>
              </div>
            </td>;
          })}</tr>
          <tr><td style={HS}>十二運</td>{cols.map(c=><td key={c.label} style={{...CS,fontSize:11}}>{c.ju&&JUNISHI_DESC[c.ju]?<ClickTooltip label={c.ju} desc={JUNISHI_DESC[c.ju].txt} kw={JUNISHI_DESC[c.ju].kw} color="#5a6a2a"/>:(c.ju||"—")}</td>)}</tr>
          {Object.keys(branchNote).length>0&&<tr><td style={HS}>地支合冲</td>{cols.map(c=>{
            const notes=branchNote[c.label]||[];
            return <td key={c.label} style={{...CS,padding:"2px 3px",verticalAlign:"top"}}>
              {notes.length===0?<span style={{color:"#ccc"}}>—</span>:notes.map((r,i)=>{
                const col=r.includes("相冲")?"#f07070":r.includes("三合")?"#d4a84b":"#6ab0e8";
                return <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"2px 0",borderBottom:i<notes.length-1?"1px solid #e0d4c0":"none"}}>
                  {nbadge(r,col)}
                </div>;
              })}
            </td>;
          })}</tr>}
          <tr><td style={HS}>蔵干</td>{cols.map((c,ci)=><td key={c.label} style={{...CS,padding:"4px"}}>{c.zk?c.zk.filter(Boolean).map((s,i)=>{ const el=STEM_EL[STEMS.indexOf(s)]; const th=ci===1?null:getTsuhen(dp.stemIdx,STEMS.indexOf(s)); return <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:2}}><span style={{fontSize:14,fontWeight:700,color:EC[el]?.tx}}>{s}</span>{th&&<span style={{fontSize:9,color:EC[el]?.tx,opacity:0.75,lineHeight:1,marginTop:1}}>{th}</span>}</div>; }):"—"}</td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

function DaiunTableH({daiun, dSi, pillars}) {
  const nowY = new Date().getFullYear();
  const meishikiBis = [pillars.year,pillars.month,pillars.day,pillars.hour].filter(Boolean).map(p=>p.branchIdx);
  const kuubou = getKuubou(pillars.day.stemIdx, pillars.day.branchIdx);
  const rows = daiun.list;
  const colW = 72, labelW = 56;
  const isCurIdx = rows.findIndex((d,i)=>d.startYear<=nowY&&(!rows[i+1]||rows[i+1].startYear>nowY));
  const cellS = (isCur) => ({border:"1px solid #c8b89a",padding:"4px 2px",textAlign:"center",fontSize:12,background:isCur?"#e8d4b8":"#fdf8f2",minWidth:colW});
  const hS = {border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"right",fontSize:11,color:"#7a6a55",background:"#f0e8da",whiteSpace:"nowrap"};
  return (
    <div>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",fontSize:12}}>
          <tbody>
            <tr>
              <td style={hS}>数え年</td>
              <td style={{...cellS(false),color:"#8a7a60",fontSize:11}}></td>
              {rows.map((d,i)=><td key={i} style={{...cellS(i===isCurIdx),fontSize:10,color:i===isCurIdx?"#5a3010":"#8a7a60"}}>{d.age}歳〜</td>)}
            </tr>
            <tr>
              <td style={hS}>西 暦</td>
              <td style={{...cellS(false),color:"#8a7a60",fontSize:11}}>生後</td>
              {rows.map((d,i)=><td key={i} style={{...cellS(i===isCurIdx),fontWeight:i===isCurIdx?700:400,color:i===isCurIdx?"#5a3010":"#8a7a60"}}>{d.startYear}{i===isCurIdx&&<span style={{display:"block",fontSize:8,color:"#7a4a1a"}}>▶</span>}</td>)}
            </tr>
            <tr>
              <td style={hS}>天 干</td>
              <td style={cellS(false)}><span style={{color:EC[STEM_EL[daiun.seigo.stemIdx]]?.tx,fontSize:18,fontWeight:700}}>{daiun.seigo.stem}</span></td>
              {rows.map((d,i)=>{const sc=EC[d.stemEl]; return <td key={i} style={cellS(i===isCurIdx)}><span style={{color:sc?.tx,fontSize:20,fontWeight:700}}>{d.stem}</span><div style={{fontSize:9,color:sc?.tx,opacity:0.7}}>{d.stemEl}</div></td>;})}
            </tr>
            <tr>
              <td style={hS}>通変星</td>
              <td style={cellS(false)}><span style={{fontSize:10,color:"#8a7a60"}}>{getTsuhen(dSi,daiun.seigo.stemIdx)||"—"}</span></td>
              {rows.map((d,i)=>{const th=getTsuhen(dSi,d.stemIdx); return <td key={i} style={{...cellS(i===isCurIdx),fontSize:11}}>{th||"—"}</td>;})}
            </tr>
            <tr>
              <td style={hS}>地 支</td>
              <td style={cellS(false)}><span style={{position:"relative",display:"inline-block",color:EC[BRANCH_EL[daiun.seigo.branchIdx]]?.tx,fontSize:18,fontWeight:700}}>{daiun.seigo.branch}{kuubou.includes(daiun.seigo.branchIdx)&&<span style={{position:"absolute",top:-3,right:-11,fontSize:9,color:"#c06060",fontWeight:700}}>空</span>}</span></td>
              {rows.map((d,i)=>{const bc=EC[d.branchEl]; const kankei=calcUnnenKankei(d.branchIdx,d.stemIdx,meishikiBis,dSi); return <td key={i} style={cellS(i===isCurIdx)}><span style={{position:"relative",display:"inline-block",color:bc?.tx,fontSize:20,fontWeight:700}}>{d.branch}{kuubou.includes(d.branchIdx)&&<span style={{position:"absolute",top:-3,right:-11,fontSize:9,color:"#c06060",fontWeight:700}}>空</span>}</span><div style={{fontSize:9,color:bc?.tx,opacity:0.7}}>{d.branchEl}</div><div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:1,marginTop:2}}>{kankei.tags.map((t,k)=>{const col=t.includes("冲")?"#f07070":t.includes("合")?"#6ab0e8":t.includes("刑")?"#e0a040":"#a0c0a0";return <span key={k} style={{fontSize:7,padding:"0 2px",borderRadius:2,background:`${col}22`,color:col}}>{t}</span>;})}</div></td>;})}
            </tr>
            <tr>
              <td style={hS}>十二運</td>
              <td style={cellS(false)}><span style={{fontSize:10,color:"#8a7a60"}}>{getJunishi(dSi,daiun.seigo.branchIdx)}</span></td>
              {rows.map((d,i)=>{const ju=getJunishi(dSi,d.branchIdx); return <td key={i} style={{...cellS(i===isCurIdx),fontSize:11}}>{ju}</td>;})}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{fontSize:10,color:"#8a7a60",marginTop:4}}>※ 立命：{daiun.list[0]?.startYear}年〜　{daiun.forward?"順行（陽男・陰女）":"逆行（陰男・陽女）"}</div>
    </div>
  );
}

function RyunenTableH({ryunen, pillars, dSi, birthYear}) {
  const nowY = new Date().getFullYear();
  const meishikiBis = [pillars.year,pillars.month,pillars.day,pillars.hour].filter(Boolean).map(p=>p.branchIdx);
  const kuubou = getKuubou(pillars.day.stemIdx, pillars.day.branchIdx);
  const isCurIdx = ryunen.findIndex(r=>r.year===nowY);
  const cellS = (isCur,isPast) => ({border:"1px solid #c8b89a",padding:"4px 2px",textAlign:"center",fontSize:12,background:isCur?"#e8d4b8":isPast?"#faf5ef":"#fdf8f2",opacity:isPast?0.6:1,minWidth:60});
  const hS = {border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"right",fontSize:11,color:"#7a6a55",background:"#f0e8da",whiteSpace:"nowrap"};
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",fontSize:12}}>
        <tbody>
          <tr><td style={hS}>数え年</td>{ryunen.map((r,i)=><td key={i} style={{...cellS(i===isCurIdx,r.year<nowY),fontSize:10,color:i===isCurIdx?"#5a3010":"#8a7a60"}}>{birthYear?r.year-birthYear+1:"-"}歳</td>)}</tr>
          <tr><td style={hS}>西 暦</td>{ryunen.map((r,i)=><td key={i} style={{...cellS(i===isCurIdx,r.year<nowY),fontWeight:i===isCurIdx?700:400,color:i===isCurIdx?"#5a3010":"#8a7a60"}}>{r.year}{i===isCurIdx&&<span style={{display:"block",fontSize:8,color:"#7a4a1a"}}>▶</span>}</td>)}</tr>
          <tr><td style={hS}>天 干</td>{ryunen.map((r,i)=>{const sc=EC[r.stemEl]; return <td key={i} style={cellS(i===isCurIdx,r.year<nowY)}><span style={{color:sc?.tx,fontSize:18,fontWeight:700}}>{r.stem}</span><div style={{fontSize:9,color:sc?.tx,opacity:0.7}}>{r.stemEl}</div></td>;})}</tr>
          <tr><td style={hS}>通変星</td>{ryunen.map((r,i)=><td key={i} style={{...cellS(i===isCurIdx,r.year<nowY),fontSize:11}}>{r.tsuhen||"—"}</td>)}</tr>
          <tr><td style={hS}>地 支</td>{ryunen.map((r,i)=>{const bc=EC[r.branchEl]; const kankei=calcUnnenKankei(r.branchIdx,r.stemIdx,meishikiBis,dSi); return <td key={i} style={cellS(i===isCurIdx,r.year<nowY)}><span style={{position:"relative",display:"inline-block",color:bc?.tx,fontSize:18,fontWeight:700}}>{r.branch}{kuubou.includes(r.branchIdx)&&<span style={{position:"absolute",top:-3,right:-11,fontSize:9,color:"#c06060",fontWeight:700}}>空</span>}</span><div style={{fontSize:9,color:bc?.tx,opacity:0.7}}>{r.branchEl}</div><div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:1,marginTop:2}}>{kankei.tags.map((t,k)=>{const col=t.includes("冲")?"#f07070":t.includes("合")?"#6ab0e8":t.includes("刑")?"#e0a040":"#a0c0a0"; return <span key={k} style={{fontSize:7,padding:"0 2px",borderRadius:2,background:`${col}22`,color:col}}>{t}</span>;})}</div></td>;})}</tr>
          <tr><td style={hS}>十二運</td>{ryunen.map((r,i)=>{const ju=getJunishi(dSi,r.branchIdx); return <td key={i} style={{...cellS(i===isCurIdx,r.year<nowY),fontSize:11}}>{ju}</td>;})}</tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── 通変星・十二運 説明セクション ─────────────────────────────
function TsuhenJunishiSection({tsuhen, junishi}) {
  // 命式に現れる通変星・十二運だけ抽出（重複排除）
  const thSet = [...new Set([tsuhen.year, tsuhen.month, tsuhen.hour].filter(Boolean))];
  const juSet = [...new Set([junishi.year, junishi.month, junishi.day, junishi.hour].filter(Boolean))];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {thSet.length>0 && (
        <div>
          <div style={{fontSize:12,color:"#7a5a2a",fontWeight:700,marginBottom:8,letterSpacing:1}}>通変星</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {thSet.map(th=>{
              const d = TSUHEN_DESC[th];
              if(!d) return null;
              return (
                <div key={th} style={{padding:"10px 14px",borderRadius:8,background:"#fdf8f2",border:"1px solid #d4b89644"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontSize:15,fontWeight:700,color:"#8a5a1a"}}>{th}</span>
                    <span style={{fontSize:10,color:"#a07840",background:"#f0e0c0",padding:"1px 7px",borderRadius:10,border:"1px solid #d4b89666"}}>{d.kw}</span>
                  </div>
                  <p style={{fontSize:11,color:"#6a5a44",lineHeight:1.7,margin:0}}>{d.txt}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {juSet.length>0 && (
        <div>
          <div style={{fontSize:12,color:"#7a5a2a",fontWeight:700,marginBottom:8,letterSpacing:1}}>十二運</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {juSet.map(ju=>{
              const d = JUNISHI_DESC[ju];
              if(!d) return null;
              return (
                <div key={ju} style={{padding:"10px 14px",borderRadius:8,background:"#fdf8f2",border:"1px solid #c8b89a44"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontSize:15,fontWeight:700,color:"#5a6a2a"}}>{ju}</span>
                    <span style={{fontSize:10,color:"#6a7a3a",background:"#e8f0d0",padding:"1px 7px",borderRadius:10,border:"1px solid #b8c89066"}}>{d.kw}</span>
                  </div>
                  <p style={{fontSize:11,color:"#6a5a44",lineHeight:1.7,margin:0}}>{d.txt}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 家族命式モーダル ─────────────────────────────────────────────
function FamilyMeishikiModal({member, memberResult, targetYear, onClose}) {
  const cy = targetYear || new Date().getFullYear();
  if(!memberResult) return null;
  const curDaiun = memberResult.daiun.list.find((d,i,arr)=>d.startYear<=cy&&(!arr[i+1]||arr[i+1].startYear>cy));
  const curRyunen = calcRyunen(cy, 1, memberResult.pillars.day.stemIdx)[0];
  const extraEc = {木:0,火:0,土:0,金:0,水:0};
  if(curDaiun){extraEc[curDaiun.stemEl]++;extraEc[curDaiun.branchEl]++;}
  if(curRyunen){extraEc[curRyunen.stemEl]++;extraEc[curRyunen.branchEl]++;}
  const combinedEc = {...memberResult.ec};
  Object.entries(extraEc).forEach(([k,v])=>{ combinedEc[k]=(combinedEc[k]||0)+v; });
  const combinedStemEc = {...memberResult.stemEc};
  const combinedBranchEc = {...memberResult.branchEc};
  if(curDaiun){ combinedStemEc[curDaiun.stemEl]=(combinedStemEc[curDaiun.stemEl]||0)+1; combinedBranchEc[curDaiun.branchEl]=(combinedBranchEc[curDaiun.branchEl]||0)+1; }
  if(curRyunen){ combinedStemEc[curRyunen.stemEl]=(combinedStemEc[curRyunen.stemEl]||0)+1; combinedBranchEc[curRyunen.branchEl]=(combinedBranchEc[curRyunen.branchEl]||0)+1; }
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:"20px 10px"}} onClick={onClose}>
      <div style={{background:"#fdf8f2",borderRadius:14,maxWidth:680,width:"100%",boxShadow:"0 8px 40px #0004",border:"1px solid #d4b896"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"linear-gradient(135deg,#f5ede0,#fdf5e8)",borderBottom:"1px solid #d4b896",padding:"14px 20px",borderRadius:"14px 14px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:16,fontWeight:700,color:"#5a3a1a",letterSpacing:2}}>✦ {member.name} の命式</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#8a7a60",padding:"0 4px"}}>✕</button>
        </div>
        <div style={{padding:"16px 20px 20px",overflowY:"auto",maxHeight:"80vh"}}>
          {/* 命式テーブル + 五行バランス */}
          <Section title={`▌ 命式 （${memberResult.bd} | ${memberResult.gender==="male"?"男性":"女性"}）`}>
            <div style={{display:"flex",flexDirection:"row",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{flexShrink:0}}><MeishikiTable data={memberResult}/></div>
              <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{fontSize:12,color:"#5a3a1a",marginBottom:4,letterSpacing:1}}>▌ 五行のバランス</div>
                <GogyouCircle ec={memberResult.ec} stemEc={memberResult.stemEc} branchEc={memberResult.branchEc} extraEc={extraEc} dayEl={memberResult.pillars.day.stemEl}
                gokaInfo={(()=>{const GCOLS={木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};const info=[];Object.entries(memberResult.gokaMoveStem||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"stem"}));Object.entries(memberResult.gokaMoveBranch||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"branch"}));return info;})()}/>
              </div>
            </div>
          </Section>
          {/* 大運 */}
          <Section title="▌ 大運">
            <DaiunTableH daiun={memberResult.daiun} dSi={memberResult.pillars.day.stemIdx} pillars={memberResult.pillars}/>
          </Section>
          {/* 年運（現在前後5年） */}
          <Section title={`▌ 流年（${cy-2}〜${cy+7}年）`}>
            <RyunenTableH ryunen={calcRyunen(cy-2,10,memberResult.pillars.day.stemIdx)} pillars={memberResult.pillars} dSi={memberResult.pillars.day.stemIdx} birthYear={Number(memberResult.bd.split("-")[0])}/>
          </Section>
          {/* 指定年の五行バランス */}
          {targetYear && (
            <Section title={`▌ ${targetYear}年の五行バランス（命式＋大運＋年運）`}>
              <GogyouCircle ec={combinedEc} stemEc={combinedStemEc} branchEc={combinedBranchEc} extraEc={{木:0,火:0,土:0,金:0,水:0}} dayEl={memberResult.pillars.day.stemEl}
                gokaInfo={(()=>{const GCOLS={木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};const info=[];Object.entries(memberResult.gokaMoveStem||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"stem"}));Object.entries(memberResult.gokaMoveBranch||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"branch"}));return info;})()}/>
              <div style={{fontSize:10,color:"#8a7a60",marginTop:4}}>命式 ＋ {curDaiun?.stem}{curDaiun?.branch}大運 ＋ {curRyunen?.stem}{curRyunen?.branch}年運</div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 人生振り返り年表（メモ×大運×年運を重ねる） ────────────────────
function LifeTimelineTable({memos, birthYear, mainResult}) {
  if (!mainResult) return <div style={{fontSize:11,color:"#b0a090",padding:10}}>命式データがありません。</div>;
  const dSi = mainResult.pillars.day.stemIdx;
  const kuubou = getKuubou(dSi, mainResult.pillars.day.branchIdx);
  const daiunList = mainResult.daiun?.list || [];
  const seigo = mainResult.daiun?.seigo;
  const daiunOf = (year) => { let cur=null; for (const d of daiunList){ if(d.startYear<=year) cur=d; else break; } return cur; };
  const years = [...new Set(memos.map(m=>m.year))].sort((a,b)=>a-b);
  const th = {border:"1px solid #c8b89a",padding:"4px 8px",fontSize:11,color:"#7a6a55",background:"#f0e8da",whiteSpace:"nowrap"};
  const td = {border:"1px solid #c8b89a",padding:"5px 8px",fontSize:12,background:"#fdf8f2",verticalAlign:"top",textAlign:"center"};
  const kanshi = (si,bi) => (
    <span style={{whiteSpace:"nowrap"}}>
      <span style={{color:EC[STEM_EL[si]]?.tx,fontSize:15,fontWeight:700}}>{STEMS[si]}</span>
      <span style={{position:"relative",display:"inline-block",color:EC[BRANCH_EL[bi]]?.tx,fontSize:15,fontWeight:700,marginRight:8}}>{BRANCHES[bi]}{kuubou.includes(bi)&&<span style={{position:"absolute",top:-3,right:-9,fontSize:8,color:"#c06060",fontWeight:700}}>空</span>}</span>
    </span>
  );
  let prevDaiunKey = null;
  return (
    <div>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%"}}>
          <thead><tr><th style={th}>西暦</th><th style={th}>数え</th><th style={th}>大運</th><th style={th}>年運</th><th style={{...th,textAlign:"left"}}>出来事</th></tr></thead>
          <tbody>
            {years.map(year=>{
              const si=((year-4)%10+10)%10, bi=((year-4)%12+12)%12;
              const du=daiunOf(year);
              const duKey=du?du.startYear:"seigo";
              const changed=prevDaiunKey!==null&&duKey!==prevDaiunKey;
              prevDaiunKey=duKey;
              const tdR = changed ? {...td,borderTop:"3px double #c88a2a"} : td;
              const list=memos.filter(m=>m.year===year);
              return (
                <tr key={year}>
                  <td style={{...tdR,fontWeight:700,color:"#5a3a1a"}}>{year}</td>
                  <td style={{...tdR,fontSize:11,color:"#8a6a3a"}}>{year-birthYear+1}歳</td>
                  <td style={tdR}>
                    {changed&&<div style={{fontSize:8,color:"#c88a2a",fontWeight:700,marginBottom:1}}>▲大運替</div>}
                    {du ? <>{kanshi(du.stemIdx,du.branchIdx)}<div style={{fontSize:9,color:"#8a7a60"}}>{getTsuhen(dSi,du.stemIdx)||"—"}</div></>
                        : seigo ? <>{kanshi(seigo.stemIdx,seigo.branchIdx)}<div style={{fontSize:9,color:"#8a7a60"}}>生後</div></> : "—"}
                  </td>
                  <td style={tdR}>
                    {kanshi(si,bi)}
                    <div style={{fontSize:9,color:"#8a7a60"}}>{getTsuhen(dSi,si)||"—"}・{getJunishi(dSi,bi)}</div>
                  </td>
                  <td style={{...tdR,textAlign:"left"}}>
                    {list.map((m,i)=>(
                      <div key={i} style={{fontSize:12,color:"#3a2e22",lineHeight:1.7}}>
                        {m.date&&<span style={{fontSize:10,color:"#9a8a70",marginRight:6}}>{m.date}</span>}{m.text}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{fontSize:10,color:"#8a7a60",marginTop:6}}>※ 地支右上の「空」＝空亡の年　／　二重線・▲大運替＝前のメモ年から大運が替わった行　／　年運の下段は通変星・十二運</div>
    </div>
  );
}

// ─── 年齢メモセクション（パスワード保護） ────────────────────────
function AgeMemoSection({birthYear, bd, mainResult}) {
  const storageKey  = `shichusuimei_memo_${bd}`;
  const childrenKey = `shichusuimei_children_${bd}`;

  // ── メモ状態 ────────────────────────────────────────
  const [memos, setMemos]       = useState([]);
  const [newText, setNewText]   = useState("");
  const [inputYear, setInputYear] = useState(String(new Date().getFullYear()));
  const [newDate, setNewDate]   = useState("");
  const [editIdx, setEditIdx]   = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [deleteYearKey, setDeleteYearKey] = useState(null);
  const [editIsWork, setEditIsWork] = useState(false);
  const [workFilter, setWorkFilter] = useState(false);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editAge, setEditAge]   = useState("");
  const [importPreview, setImportPreview] = useState(null); // インポートプレビュー
  const [showTimeline, setShowTimeline] = useState(false);  // 年表ビュー切替

  // ── 家族状態 ────────────────────────────────────────
  const [children, setChildren] = useState([]);
  const [newChildName, setNewChildName]   = useState("");
  const [newChildYear, setNewChildYear]   = useState(String(new Date().getFullYear()-10));
  const [newChildMonth, setNewChildMonth] = useState("1");
  const [newChildDay, setNewChildDay]     = useState("1");
  const [newChildTime, setNewChildTime]   = useState("");
  const [newChildGender, setNewChildGender] = useState("male");
  const [editChildIdx, setEditChildIdx]   = useState(null);
  const [editChild, setEditChild]         = useState(null);

  // ── localStorage からの初回ロード ───────────────────────────
  React.useEffect(() => {
    try { const ms = localStorage.getItem(storageKey); if(ms) setMemos(JSON.parse(ms)); } catch { /* 破損データは無視 */ }
    try { const cs = localStorage.getItem(childrenKey); if(cs) setChildren(JSON.parse(cs)); } catch { /* 破損データは無視 */ }
  }, [storageKey, childrenKey]);

  const saveMemos    = (m) => { setMemos(m); try { localStorage.setItem(storageKey, JSON.stringify(m)); } catch { /* 容量超過等 */ } };
  const saveChildren = (c) => { setChildren(c); try { localStorage.setItem(childrenKey, JSON.stringify(c)); } catch { /* 容量超過等 */ } };

  const addMemo = () => {
    const year = parseInt(inputYear);
    if(!year||year<1900||year>2200||!newText.trim()) return;
    const age = year - birthYear + 1;
    saveMemos(sortMemos([...memos,{age,year,date:newDate||"",text:newText.trim()}]));
    setNewText(""); setNewDate("");
  };
  const deleteMemo  = (i) => { saveMemos(memos.filter((_,idx)=>idx!==i)); setDeleteIdx(null); };
  const startEdit   = (i) => { setEditIdx(i); setEditText(memos[i].text); setEditDate(memos[i].date||""); setEditYear(String(memos[i].year||"")); setEditAge(String(memos[i].age||"")); setEditIsWork(!!memos[i].isWork); };
  const parseDateNum = (d) => {
    if(!d) return 999999;
    const s = String(d);
    // YYYY-MM-DD形式
    const ymd = s.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if(ymd) return parseInt(ymd[2])*100+parseInt(ymd[3]);
    // M/D or M.D形式
    const md = s.replace(/[^0-9\/\.]/g,"").match(/(\d{1,2})[\/\.](\d{1,2})/);
    if(md) return parseInt(md[1])*100+parseInt(md[2]);
    return 999999;
  };
  const sortMemos = (arr) => [...arr].sort((a,b)=>{ if(a.year!==b.year) return a.year-b.year; const aw=a.isWork?1:0, bw=b.isWork?1:0; if(aw!==bw) return aw-bw; return parseDateNum(a.date)-parseDateNum(b.date); });
  const saveEdit    = () => {
    if(!editText.trim()) return;
    saveMemos(sortMemos(memos.map((m,i)=>{ if(i!==editIdx) return m; const ey=parseInt(editYear)||m.year; return {...m,text:editText.trim(),date:editDate,year:ey,age:ey-birthYear+1,isWork:editIsWork}; })));
    setEditIdx(null); setEditText(""); setEditDate(""); setEditYear(""); setEditAge(""); setEditIsWork(false);
  };

  const handleResort = () => {
    saveMemos(sortMemos([...memos]));
  };
  const handleExport = () => {
    const blob = new Blob([JSON.stringify({memos,children},null,2)],{type:"application/json"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`jinsei_memo_${bd}.json`; a.click();
  };
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  const handleImportText = () => {
    setImportError("");
    if(!importText.trim()) { setImportError("JSONを貼り付けてください。"); return; }
    try {
      // JSONの一般的な構文エラーを自動修正してから解析
      let jsonStr = importText.trim();
      // 値なしキー（"キー名",）を ("キー名": true,）に自動修正
      // オブジェクト内の値なしキー ("キー名",) のみ ("キー名": true,) に修正
      const fixJson = (str) => {
        const ls = str.split("\n"); const res = []; const stk = [];
        for (let i = 0; i < ls.length; i++) {
          let line = ls[i]; const tr = line.trim();
          for (const ch of tr) { if(ch==="{") stk.push("{"); else if(ch==="[") stk.push("["); else if(ch==="}"||ch==="]") stk.pop(); }
          if(stk[stk.length-1]==="{"&&/^(\s*)"([^"]+)",(\s*)$/.test(line)) line=line.replace(/^(\s*)"([^"]+)",(\s*)$/,'$1"$2": true,$3');
          res.push(line);
        }
        return res.join("\n");
      };
      jsonStr = fixJson(jsonStr);
      const data = JSON.parse(jsonStr);
      let allMemos = [];

      // 形式1: {"memos":[...]} 標準形式
      if(Array.isArray(data.memos)) {
        allMemos = data.memos;

      // 形式2: 配列形式 [...]
      } else if(Array.isArray(data)) {
        allMemos = data;

      // 形式3: eventsまたはprojectsなど配列キーを持つ形式
      } else if(typeof data === "object" && (data.year || data.age)) {
        const year = parseInt(data.year) || 0;
        const age = data.age || (year - birthYear + 1);
        // eventsやprojectsなど配列フィールドをすべて探して取り込む
        const arrayKeys = Object.keys(data).filter(k => Array.isArray(data[k]));
        arrayKeys.forEach(key => {
          data[key].forEach(item => {
            if(typeof item === "string") {
              if(item.trim()) allMemos.push({ age, year, date: "", text: `[${key}] ${item}` });
            } else if(typeof item === "object") {
              const date = item.date || item.日付 || "";
              const desc = item.description || item.name || item.内容 || item.text ||
                Object.values(item).filter(v=>typeof v==="string").join(" / ");
              const text = date ? `${date} ${desc}`.trim() : desc;
              if(text) allMemos.push({ age, year, date, text });
            }
          });
        });

      // 形式4: {"2001":{"和暦":"H13","出来事":[...],...}, "2002":...} 年キー形式
      } else if(typeof data === "object") {
        const yearKeys = Object.keys(data).filter(k => /^\d{4}$/.test(k));
        if(yearKeys.length > 0) {
          yearKeys.forEach(yearStr => {
            const year = parseInt(yearStr);
            const age = year - birthYear + 1;
            const entry = data[yearStr];

            // 配列フィールド（出来事・旅行・イベント等）は各要素を個別メモに
            Object.entries(entry).forEach(([key, val]) => {
              if(Array.isArray(val)) {
                val.forEach(item => {
                  if(typeof item === "string" && item.trim()) {
                    // "M/DD テキスト" or "M/DD〜M/DD テキスト" から日付を抽出
                    const dateMatch = item.match(/^(\d{1,2}\/[\d〜~\-\/]+)\s+/);
                    const date = dateMatch ? dateMatch[1] : "";
                    const text = dateMatch ? item.replace(dateMatch[0], "").trim() : item.trim();
                    allMemos.push({ age, year, date, text });
                  } else if(typeof item === "object" && item !== null) {
                    const date = item.date || item.日付 || "";
                    const desc = item.description || item.name || item.内容 || item.text ||
                      Object.values(item).filter(v=>typeof v==="string").join(" / ");
                    if(desc.trim()) allMemos.push({ age, year, date, text: date ? `${date} ${desc}`.trim() : desc });
                  }
                });
              } else if(typeof val === "object" && val !== null) {
                // ネストオブジェクト（家族・住宅等）は1まとめのメモに
                const parts = Object.entries(val).map(([k2,v2])=>`${k2}: ${v2}`).join(" / ");
                if(parts) allMemos.push({ age, year, date: "", text: `[${key}] ${parts}` });
              } else if(typeof val === "string" && !["年齢","和暦","年"].includes(key)) {
                // 単一文字列フィールドも個別メモに
                allMemos.push({ age, year, date: "", text: `[${key}] ${val}` });
              }
            });
          });
        }
      }

      if(allMemos.length === 0) { setImportError("有効なメモが見つかりません。JSONの形式を確認してください。"); return; }
      const unique = allMemos
        .filter((m,i,arr)=>arr.findIndex(x=>x.age===m.age&&x.text===m.text)===i)
        .sort((a,b)=>(a.year||0)-(b.year||0)||(a.age||0)-(b.age||0));
      setImportPreview({memos: unique, children: data.children||null, fileCount: 1});
      setImportText("");
      setShowImportBox(false);
    } catch(err) {
      setImportError("JSONの解析に失敗しました: " + err.message);
    }
  };
  const confirmImport = () => {
    if(!importPreview) return;
    const merged = [...memos];
    importPreview.memos.forEach(m=>{ if(!merged.find(x=>x.age===m.age&&x.text===m.text)) merged.push(m); });
    saveMemos(sortMemos(merged));
    if(importPreview.children) saveChildren(importPreview.children);
    setImportPreview(null);
  };

  // ── 家族操作 ────────────────────────────────────────
  const addChild = () => {
    if(!newChildName.trim()) return;
    saveChildren([...children,{name:newChildName.trim(),birthYear:parseInt(newChildYear),birthMonth:parseInt(newChildMonth),birthDay:parseInt(newChildDay),birthTime:newChildTime||"",gender:newChildGender}]);
    setNewChildName(""); setNewChildYear(String(new Date().getFullYear()-10)); setNewChildMonth("1"); setNewChildDay("1"); setNewChildTime(""); setNewChildGender("male");
  };
  const deleteChild = (i) => saveChildren(children.filter((_,idx)=>idx!==i));
  const startEditChild = (i) => { setEditChildIdx(i); setEditChild({...children[i]}); };
  const saveEditChild = () => {
    if(!editChild) return;
    saveChildren(children.map((c,i)=>i===editChildIdx?editChild:c));
    setEditChildIdx(null); setEditChild(null);
  };

  // ── 学年計算 ────────────────────────────────────────
  const calcGakuNen = (cBy, cBm, targetYear) => {
    const age = targetYear - cBy;
    if(age<6) return null;
    const grade = age - 6 + (cBm>=4?1:0);
    if(grade<0) return null;
    if(grade<6) return `小${grade+1}`;
    if(grade<9) return `中${grade-5}`;
    if(grade<12) return `高${grade-8}`;
    if(grade<16) return `大${grade-11}`;
    return null;
  };

  const calcFamilyResult = (c) => {
    try { return calcAll(c.name||"", `${c.birthYear}-${String(c.birthMonth||1).padStart(2,"0")}-${String(c.birthDay||1).padStart(2,"0")}`, c.birthTime||"", c.gender||"male"); }
    catch { return null; }
  };

  const memoInputBar = (disabled) => (
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center",background:"rgba(253,248,242,0.9)",padding:"10px 12px",borderRadius:10,border:"1px solid #d4b89644"}}>
      <input type="number" min={1900} max={2200} value={inputYear} onChange={e=>setInputYear(e.target.value)}
        placeholder="西暦" disabled={disabled}
        style={{width:70,padding:"6px 8px",borderRadius:7,border:"1px solid #c4a070",fontSize:12,background:disabled?"#f0e8dc":"#fdf5e8",color:"#5a3a1a"}}/>
      <input type="text" value={newDate} onChange={e=>setNewDate(e.target.value)} disabled={disabled}
        placeholder="日付(例:3/15)" style={{width:90,padding:"6px 8px",borderRadius:7,border:"1px solid #c4a070",fontSize:12,background:disabled?"#f0e8dc":"#fdf5e8",color:"#5a3a1a"}}/>
      <input type="text" value={newText} onChange={e=>setNewText(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&addMemo()} placeholder="出来事を入力..." disabled={disabled}
        style={{flex:1,minWidth:120,padding:"6px 10px",borderRadius:7,border:"1px solid #c4a070",fontSize:12,background:disabled?"#f0e8dc":"#fdf5e8",color:"#3a2e22"}}/>
      <button onClick={addMemo} disabled={disabled||!newText.trim()||!inputYear}
        style={{padding:"6px 16px",borderRadius:7,background:(disabled||!newText.trim()||!inputYear)?"#ccc":"linear-gradient(135deg,#c88a2a,#e8a030)",border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:(disabled||!newText.trim()||!inputYear)?"not-allowed":"pointer"}}>
        追加
      </button>
    </div>
  );

  const childPanel = (
    <div style={{marginBottom:14,border:"1px solid #c4d4b0",borderRadius:10,overflow:"hidden"}}>
      <details>
        <summary style={{padding:"8px 14px",background:"linear-gradient(135deg,#eef5e8,#f5faf0)",cursor:"pointer",fontSize:12,fontWeight:700,color:"#3a6a2a",userSelect:"none",listStyle:"none",display:"flex",alignItems:"center",gap:6}}>
          <span>👨‍👩‍👧‍👦 家族情報</span>
          <span style={{fontSize:10,color:"#7a9a7a",fontWeight:400}}>{children.length}人登録中</span>
        </summary>
        <div style={{padding:"10px 14px",background:"#f8fdf5"}}>
          <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
            <input value={newChildName} onChange={e=>setNewChildName(e.target.value)} placeholder="名前" style={{width:70,padding:"4px 6px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}/>
            <select value={newChildYear} onChange={e=>setNewChildYear(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
              {Array.from({length:101},(_,i)=>new Date().getFullYear()-i).map(y=><option key={y} value={y}>{y}年</option>)}
            </select>
            <select value={newChildMonth} onChange={e=>setNewChildMonth(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
              {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{m}月</option>)}
            </select>
            <select value={newChildDay} onChange={e=>setNewChildDay(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
              {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}日</option>)}
            </select>
            <input type="time" value={newChildTime} onChange={e=>setNewChildTime(e.target.value)}
              placeholder="時間(任意)" style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11,width:90}}/>
            <select value={newChildGender} onChange={e=>setNewChildGender(e.target.value)} style={{padding:"4px",borderRadius:5,border:"1px solid #a0c080",fontSize:11}}>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
            <button onClick={addChild} style={{padding:"4px 10px",borderRadius:5,background:"#5a9a5a",border:"none",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:700}}>追加</button>
          </div>
          {children.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 6px",background:"#fff",borderRadius:5,border:"1px solid #c0d8b0",marginBottom:3}}>
              {editChildIdx===i && editChild ? (
                <>
                  <input value={editChild.name} onChange={e=>setEditChild({...editChild,name:e.target.value})} style={{width:60,fontSize:11,padding:"2px 4px",border:"1px solid #a0c080",borderRadius:4}}/>
                  <input type="time" value={editChild.birthTime||""} onChange={e=>setEditChild({...editChild,birthTime:e.target.value})} style={{width:86,fontSize:11,padding:"2px 4px",border:"1px solid #a0c080",borderRadius:4}}/>
                  <select value={editChild.gender||"male"} onChange={e=>setEditChild({...editChild,gender:e.target.value})} style={{fontSize:11,padding:"2px 4px",border:"1px solid #a0c080",borderRadius:4}}>
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                  <button onClick={saveEditChild} style={{padding:"1px 6px",borderRadius:4,background:"#5a9a5a",border:"none",color:"#fff",fontSize:9,cursor:"pointer"}}>保存</button>
                  <button onClick={()=>{setEditChildIdx(null);setEditChild(null);}} style={{padding:"1px 6px",borderRadius:4,background:"#aaa",border:"none",color:"#fff",fontSize:9,cursor:"pointer"}}>取消</button>
                </>
              ) : (
                <>
                  <span style={{fontSize:11,flex:1,color:"#3a5a3a"}}>{c.name}（{c.birthYear}/{c.birthMonth}/{c.birthDay}{c.birthTime?" "+c.birthTime:""}・{c.gender==="female"?"女":"男"}）</span>
                  <button onClick={()=>startEditChild(i)} style={{padding:"1px 6px",borderRadius:4,background:"transparent",border:"1px solid #a0c080",color:"#5a7a5a",fontSize:9,cursor:"pointer"}}>編集</button>
                  <button onClick={()=>deleteChild(i)} style={{padding:"1px 6px",borderRadius:4,background:"transparent",border:"1px solid #e0a0a0",color:"#c06060",fontSize:9,cursor:"pointer"}}>✕</button>
                </>
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  );

  return (
    <div>
      {childPanel}
      {/* エクスポート・インポートバー */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:10,color:"#9a8a70",padding:"4px 10px",background:"#f5ede0",borderRadius:6}}>
          💾 生年月日ごとにブラウザ保存
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {memos.length>0&&<button onClick={()=>setShowTimeline(v=>!v)} style={{padding:"4px 10px",borderRadius:6,background:showTimeline?"#c88a2a":"transparent",border:"1px solid #c88a2a",color:showTimeline?"#fff":"#8a5a1a",fontSize:10,cursor:"pointer",fontWeight:700}}>{showTimeline?"📝 メモ一覧に戻る":"📜 年表で見る"}</button>}
          <button onClick={handleResort} style={{padding:"4px 10px",borderRadius:6,background:"transparent",border:"1px solid #c0a080",color:"#705030",fontSize:10,cursor:"pointer"}}>🔃 日付順に並び替え</button>
          <button onClick={handleExport} style={{padding:"4px 10px",borderRadius:6,background:"transparent",border:"1px solid #a0c080",color:"#507030",fontSize:10,cursor:"pointer"}}>📥 エクスポート(.json)</button>
          <button onClick={()=>setShowImportBox(v=>!v)}
            style={{padding:"4px 10px",borderRadius:6,background:showImportBox?"#e0f0ff":"transparent",border:"1px solid #80a0c0",color:"#305070",fontSize:10,cursor:"pointer"}}>
            📤 インポート(.json)
          </button>
        </div>
      </div>

      {/* インポート入力ボックス */}
      {showImportBox && (
        <div style={{marginBottom:12,padding:"12px 14px",background:"#f0f8ff",border:"1px solid #80a0c0",borderRadius:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#2a5a8a",marginBottom:6}}>📤 JSONを貼り付けてインポート</div>
          <div style={{fontSize:10,color:"#5a7a9a",marginBottom:6}}>エクスポートしたJSONの内容をそのまま貼り付けてください。</div>
          <textarea
            value={importText}
            onChange={e=>setImportText(e.target.value)}
            placeholder={'{"memos":[...],"children":[...]}'}
            style={{width:"100%",height:100,fontSize:11,padding:"6px 8px",border:"1px solid #80a0c0",borderRadius:6,background:"#fff",boxSizing:"border-box",fontFamily:"monospace",resize:"vertical"}}
          />
          {importError && <div style={{color:"#c04040",fontSize:11,marginTop:4}}>{importError}</div>}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={handleImportText} style={{padding:"5px 16px",borderRadius:6,background:"#2a5a8a",border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>読み込む</button>
            <button onClick={()=>{setShowImportBox(false);setImportText("");setImportError("");}} style={{padding:"5px 12px",borderRadius:6,background:"transparent",border:"1px solid #aaa",color:"#666",fontSize:11,cursor:"pointer"}}>キャンセル</button>
          </div>
        </div>
      )}

      {/* インポートプレビュー・確認 */}
      {importPreview && (
        <div style={{marginBottom:12,padding:"12px 14px",background:"#f0f8ff",border:"1px solid #80a0c0",borderRadius:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#2a5a8a",marginBottom:6}}>
            📤 インポート確認 — {importPreview.fileCount||1}ファイル / {importPreview.memos.length}件のメモ
          </div>
          <div style={{maxHeight:120,overflowY:"auto",background:"#fff",borderRadius:6,border:"1px solid #c0d8f0",marginBottom:8}}>
            {importPreview.memos.slice(0,10).map((m,i)=>(
              <div key={i} style={{padding:"3px 8px",borderBottom:"1px solid #e8f0f8",fontSize:11}}>
                <span style={{color:"#2a5a8a",fontWeight:700,marginRight:6}}>{m.age}歳（{m.year}年）</span>
                {m.date&&<span style={{color:"#8a9aaa",marginRight:6}}>{m.date}</span>}
                <span>{m.text}</span>
              </div>
            ))}
            {importPreview.memos.length>10&&<div style={{padding:"3px 8px",fontSize:10,color:"#8a9aaa"}}>…他{importPreview.memos.length-10}件</div>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={confirmImport} style={{padding:"6px 18px",borderRadius:7,background:"#2a7a2a",border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>✅ インポートする</button>
            <button onClick={()=>setImportPreview(null)} style={{padding:"6px 18px",borderRadius:7,background:"transparent",border:"1px solid #c06060",color:"#c06060",fontSize:12,fontWeight:700,cursor:"pointer"}}>✕ キャンセル</button>
          </div>
        </div>
      )}



      {memoInputBar(false)}
      {memos.length===0 ? (
        <div style={{fontSize:11,color:"#b0a090",padding:"10px",textAlign:"center",background:"#fdf5e8",borderRadius:8,border:"1px dashed #d4b896"}}>
          実年齢とメモを入力して「追加」してください
        </div>
      ) : showTimeline ? (
        <LifeTimelineTable memos={memos} birthYear={birthYear} mainResult={mainResult}/>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[...new Set(memos.map(m=>m.year))].sort((a,b)=>a-b).map(year=>(
            <YearMemoGroup
              key={year}
              year={year}
              memos={memos.filter(m=>m.year===year)}
              allMemos={memos}
              birthYear={birthYear}
              mainResult={mainResult}
              children={children}
              calcGakuNen={calcGakuNen}
              calcFamilyResult={calcFamilyResult}
              editIdx={editIdx}
              editText={editText}
              editDate={editDate}
              editYear={editYear}
              editAge={editAge}
              startEdit={startEdit}
              saveEdit={saveEdit}
              deleteMemo={deleteMemo}
              deleteIdx={deleteIdx}
              setDeleteIdx={setDeleteIdx}
              setEditIdx={setEditIdx}
              deleteYear={(key)=>{
                if(key&&key.startsWith("do_")){
                  const y=parseInt(key.replace("do_",""));
                  saveMemos(memos.filter(m=>m.year!==y));
                  setDeleteYearKey(null);
                } else {
                  setDeleteYearKey(key);
                }
              }}
              deleteYearKey={deleteYearKey}
              editIsWork={editIsWork}
              setEditIsWork={setEditIsWork}
              workFilter={workFilter}
              setWorkFilter={setWorkFilter}
              setEditText={setEditText}
              setEditDate={setEditDate}
              setEditYear={setEditYear}
              setEditAge={setEditAge}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ─── PDF→JSON変換ガイド ────────────────────────────────────────

function YearMemoGroup({year, memos, allMemos, birthYear, mainResult, children, calcGakuNen, calcFamilyResult, editIdx, editText, editDate, editYear, editAge, startEdit, saveEdit, deleteMemo, deleteIdx, setDeleteIdx, setEditIdx, setEditText, setEditDate, setEditYear, setEditAge, deleteYear, deleteYearKey, editIsWork, setEditIsWork, workFilter, setWorkFilter}) {
  const [openMeishiki, setOpenMeishiki] = React.useState(null);
  const [collapsed, setCollapsed] = React.useState(true); // デフォルト折りたたみ
  const [showGogyou, setShowGogyou] = React.useState(true);

  const myAge = year - birthYear;
  const ryunen = mainResult ? calcRyunen(year, 1, mainResult.pillars.day.stemIdx)[0] : null;
  const myDaiun = mainResult?.daiun.list.find((d,i,arr)=>d.startYear<=year&&(!arr[i+1]||arr[i+1].startYear>year));

  // その年の五行バランス（命式＋大運＋年運）
  const yearEc = mainResult ? {...mainResult.ec} : null;
  const yearStemEc = mainResult ? {...(mainResult.stemEc||{})} : null;
  const yearBranchEc = mainResult ? {...(mainResult.branchEc||{})} : null;
  if(yearEc && myDaiun){
    yearEc[myDaiun.stemEl]=(yearEc[myDaiun.stemEl]||0)+1; yearEc[myDaiun.branchEl]=(yearEc[myDaiun.branchEl]||0)+1;
    if(yearStemEc) yearStemEc[myDaiun.stemEl]=(yearStemEc[myDaiun.stemEl]||0)+1;
    if(yearBranchEc) yearBranchEc[myDaiun.branchEl]=(yearBranchEc[myDaiun.branchEl]||0)+1;
  }
  if(yearEc && ryunen){
    yearEc[ryunen.stemEl]=(yearEc[ryunen.stemEl]||0)+1; yearEc[ryunen.branchEl]=(yearEc[ryunen.branchEl]||0)+1;
    if(yearStemEc) yearStemEc[ryunen.stemEl]=(yearStemEc[ryunen.stemEl]||0)+1;
    if(yearBranchEc) yearBranchEc[ryunen.branchEl]=(yearBranchEc[ryunen.branchEl]||0)+1;
  }

  const familyInfos = children.map((c,ci)=>{
    const cAge = year - c.birthYear;
    if(cAge < 0) return null;
    const gaku = calcGakuNen(c.birthYear, c.birthMonth||1, year);
    const memberResult = calcFamilyResult(c);
    return {c, ci, cAge, gaku, memberResult};
  }).filter(Boolean);

  const getOpenResult = () => {
    if(openMeishiki === "self") return mainResult;
    if(typeof openMeishiki === "number") return familyInfos.find(f=>f.ci===openMeishiki)?.memberResult;
    return null;
  };
  const openResult = getOpenResult();
  const openName = openMeishiki === "self" ? (mainResult?.name||"本人") : familyInfos.find(f=>f.ci===openMeishiki)?.c.name;

  const renderInlineMeishiki = (mr, targetYear) => {
    if(!mr) return null;
    const cDaiun = mr.daiun.list.find((d,i,arr)=>d.startYear<=targetYear&&(!arr[i+1]||arr[i+1].startYear>targetYear));
    const cRyunen = calcRyunen(targetYear, 1, mr.pillars.day.stemIdx)[0];
    const extraEc = {木:0,火:0,土:0,金:0,水:0};
    if(cDaiun){extraEc[cDaiun.stemEl]++;extraEc[cDaiun.branchEl]++;}
    if(cRyunen){extraEc[cRyunen.stemEl]++;extraEc[cRyunen.branchEl]++;}
    const combinedEc = {...mr.ec};
    Object.entries(extraEc).forEach(([k,v])=>{ combinedEc[k]=(combinedEc[k]||0)+v; });
    const combinedStemEc = {...mr.stemEc};
    const combinedBranchEc = {...mr.branchEc};
    if(cDaiun){combinedStemEc[cDaiun.stemEl]=(combinedStemEc[cDaiun.stemEl]||0)+1;combinedBranchEc[cDaiun.branchEl]=(combinedBranchEc[cDaiun.branchEl]||0)+1;}
    if(cRyunen){combinedStemEc[cRyunen.stemEl]=(combinedStemEc[cRyunen.stemEl]||0)+1;combinedBranchEc[cRyunen.branchEl]=(combinedBranchEc[cRyunen.branchEl]||0)+1;}
    return (
      <div style={{marginTop:8,padding:"10px 12px",background:"#fdf5e8",borderRadius:8,border:"1px solid #d4b896"}}>
        <div style={{fontSize:11,color:"#7a5a2a",fontWeight:700,marginBottom:8}}>{openName} の命式（{targetYear}年）</div>
        <div style={{display:"flex",flexDirection:"row",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{flexShrink:0,overflowX:"auto"}}><MeishikiTable data={mr}/></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
            <div style={{fontSize:11,color:"#5a3a1a",fontWeight:700}}>▌ {targetYear}年の五行（命式＋大運＋年運）</div>
            <GogyouCircle ec={combinedEc} stemEc={combinedStemEc} branchEc={combinedBranchEc} extraEc={{木:0,火:0,土:0,金:0,水:0}} dayEl={mr.pillars.day.stemEl}
                gokaInfo={(()=>{const GCOLS={木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};const info=[];Object.entries(mr.gokaMoveStem||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"stem"}));Object.entries(mr.gokaMoveBranch||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"branch"}));return info;})()}/>
            <div style={{fontSize:10,color:"#8a7a60"}}>
              {cDaiun&&`大運：${cDaiun.stem}${cDaiun.branch}　`}{cRyunen&&`年運：${cRyunen.stem}${cRyunen.branch}`}
            </div>
          </div>
        </div>
        <div style={{marginTop:10,overflowX:"auto"}}>
          <div style={{fontSize:11,color:"#5a3a1a",fontWeight:700,marginBottom:4}}>▌ 大運</div>
          <DaiunTableH daiun={mr.daiun} dSi={mr.pillars.day.stemIdx} pillars={mr.pillars}/>
        </div>
      </div>
    );
  };

  return (
    <div style={{border:"1px solid #d4b896",borderRadius:10,overflow:"hidden",marginBottom:4}}>
      {/* 年ヘッダー（クリックで折りたたみ） */}
      <div
        onClick={()=>setCollapsed(!collapsed)}
        style={{background:"linear-gradient(135deg,#f5ede0,#fdf5e8)",padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",borderBottom:collapsed?"none":"1px solid #d4b89644",cursor:"pointer",userSelect:"none"}}
      >
        <span style={{fontSize:12,color:"#c4a070",fontWeight:700,minWidth:14}}>{collapsed?"▶":"▼"}</span>
        <div style={{fontSize:16,fontWeight:900,color:"#5a3a1a"}}>{year}年</div>
        <div style={{fontSize:13,color:"#8a6a3a",fontWeight:700}}>{myAge}歳</div>
        {ryunen && <div style={{display:"flex",gap:3,alignItems:"center"}}>
          <span style={{fontSize:11,color:EC[ryunen.stemEl]?.tx,fontWeight:700}}>{ryunen.stem}</span>
          <span style={{fontSize:11,color:EC[ryunen.branchEl]?.tx,fontWeight:700}}>{ryunen.branch}</span>
          <span style={{fontSize:9,color:"#aaa"}}>年運</span>
        </div>}
        {myDaiun && <div style={{display:"flex",gap:3,alignItems:"center"}}>
          <span style={{fontSize:11,color:EC[myDaiun.stemEl]?.tx,fontWeight:700}}>{myDaiun.stem}</span>
          <span style={{fontSize:11,color:EC[myDaiun.branchEl]?.tx,fontWeight:700}}>{myDaiun.branch}</span>
          <span style={{fontSize:9,color:"#aaa"}}>大運</span>
        </div>}
        {yearEc && <div style={{display:"flex",gap:2}}>
          {["木","火","土","金","水"].map(el=>{
            const cnt=yearEc[el]||0, c=EC[el];
            return cnt>0?<span key={el} style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:c.bg,color:c.tx,border:`1px solid ${c.bd}55`,fontWeight:700}}>{el}{cnt}</span>:null;
          })}
        </div>}
        {collapsed && <span style={{marginLeft:"auto",fontSize:10,color:"#9a8a70",background:"#f0e8da",padding:"2px 8px",borderRadius:10,border:"1px solid #d4b89644"}}>{memos.length}件</span>}
        {!collapsed && <span style={{marginLeft:"auto",fontSize:10,color:"#9a8a70"}}>{memos.length}件</span>}
        {!collapsed && (deleteYearKey==="confirm_"+year ? (
          <span style={{display:"flex",gap:4,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
            <span style={{fontSize:10,color:"#c06060",fontWeight:700}}>{year}年を全削除?</span>
            <button onClick={e=>{e.stopPropagation();deleteYear&&deleteYear("do_"+year);}} style={{padding:"2px 8px",borderRadius:5,background:"#e05050",border:"none",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:700}}>全削除</button>
            <button onClick={e=>{e.stopPropagation();deleteYear&&deleteYear(null);}} style={{padding:"2px 8px",borderRadius:5,background:"#aaa",border:"none",color:"#fff",fontSize:10,cursor:"pointer"}}>取消</button>
          </span>
        ) : (
          <button onClick={e=>{e.stopPropagation();deleteYear&&deleteYear("confirm_"+year);}} style={{padding:"2px 8px",borderRadius:5,background:"transparent",border:"1px solid #e0a0a0",color:"#c06060",fontSize:10,cursor:"pointer"}}>🗑 {year}年を全削除</button>
        ))}
        {/* 命式ボタン類（展開時のみ） */}
        {!collapsed && mainResult && <button onClick={e=>{e.stopPropagation();setOpenMeishiki(openMeishiki==="self"?null:"self");}}
          style={{padding:"2px 8px",borderRadius:10,background:openMeishiki==="self"?"#b07020":"#e8a030",border:"none",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:700}}>
          {openMeishiki==="self"?"▲ 閉じる":`${mainResult.name||"本人"}の命式`}
        </button>}
        {!collapsed && familyInfos.map(({c,ci,cAge,gaku,memberResult})=>(
          <button key={ci} onClick={e=>{e.stopPropagation();memberResult&&setOpenMeishiki(openMeishiki===ci?null:ci);}}
            style={{padding:"2px 8px",borderRadius:10,background:!memberResult?"#bbb":openMeishiki===ci?"#2a7a2a":"#5a9a5a",border:"none",color:"#fff",fontSize:10,cursor:memberResult?"pointer":"default",fontWeight:700}}>
            {openMeishiki===ci?"▲ 閉じる":`${c.name}（${gaku||`${cAge}歳`}）`}
          </button>
        ))}
      </div>

      {!collapsed && <>
        {/* ── 五行バランス（年の一番上） ── */}
        {mainResult && yearEc && (
          <div style={{background:"#fdf8f0",borderBottom:"1px solid #e8d8c0",padding:"8px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:700,color:"#5a3a1a"}}>▌ {year}年の五行バランス</span>
              <span style={{fontSize:10,color:"#9a8a70"}}>命式＋大運＋年運</span>
              <button
                onClick={()=>setShowGogyou(!showGogyou)}
                style={{marginLeft:"auto",padding:"2px 8px",borderRadius:6,background:"transparent",border:"1px solid #c4a070",color:"#8a6a3a",fontSize:9,cursor:"pointer"}}
              >{showGogyou?"▲ 閉じる":"▼ 表示"}</button>
            </div>
            {showGogyou && (
              <div style={{display:"flex",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
                <GogyouCircle
                  ec={yearEc} stemEc={yearStemEc} branchEc={yearBranchEc}
                  extraEc={{木:0,火:0,土:0,金:0,水:0}}
                  dayEl={mainResult.pillars.day.stemEl}
                  scale={2/3}
                />

              </div>
            )}
          </div>
        )}

        {/* インライン命式展開 */}
        {openResult && (
          <div style={{padding:"8px 12px",borderBottom:"1px solid #d4b89644",background:"#fef9f2"}}>
            {renderInlineMeishiki(openResult, year)}
          </div>
        )}

        {/* フィルターボタン */}
        <div style={{padding:"4px 8px",display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={()=>setWorkFilter(!workFilter)}
            style={{padding:"3px 10px",borderRadius:12,border:"1px solid #5080c0",background:workFilter?"#5080c0":"transparent",color:workFilter?"#fff":"#5080c0",fontSize:10,cursor:"pointer",fontWeight:workFilter?700:400}}>
            💼 仕事のみ
          </button>
          {workFilter&&<span style={{fontSize:10,color:"#9a8a70"}}>{memos.filter(m=>m.isWork).length}件</span>}
        </div>
        {/* メモ一覧（2列グリッド） */}
        <div style={{padding:"8px",columnCount:2,columnGap:6}}>
          {(workFilter?memos.filter(m=>m.isWork):memos).map(m=>{
            const globalIdx = allMemos.findIndex(x=>x===m||(x.id&&x.id===m.id)||(x.year===m.year&&x.date===m.date&&x.text===m.text));
            return (
              <div key={globalIdx} style={{background:"#fdf8f2",borderRadius:6,border:"1px solid #d4b89644",padding:"6px 10px",breakInside:"avoid",marginBottom:6}}>
                {editIdx===globalIdx ? (
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {/* 西暦・年齢・日付・テキスト編集 */}
                    <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                      <input type="number" value={editYear} onChange={e=>setEditYear(e.target.value)}
                        placeholder="西暦" style={{width:64,padding:"3px 6px",borderRadius:5,border:"1px solid #c4a070",fontSize:11,background:"#fdf5e8"}}/>
                      <span style={{fontSize:10,color:"#7a6a55"}}>年</span>
                      <input type="text" value={editDate} onChange={e=>setEditDate(e.target.value)}
                        placeholder="日付(例:3/15)" style={{width:90,padding:"3px 6px",borderRadius:5,border:"1px solid #c4a070",fontSize:11,background:"#fdf5e8",color:"#5a3a1a"}}/>
                    </div>
                    <input type="text" value={editText} onChange={e=>setEditText(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&saveEdit()}
                      style={{width:"100%",padding:"4px 8px",borderRadius:5,border:"1px solid #c4a070",fontSize:11,boxSizing:"border-box"}}/>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:10,color:"#5080c0",fontWeight:700,padding:"3px 8px",borderRadius:5,border:"1px solid #5080c088",background:editIsWork?"#e8f0ff":"transparent"}}>
                        <input type="checkbox" checked={editIsWork} onChange={e=>setEditIsWork(e.target.checked)} style={{accentColor:"#5080c0",width:12,height:12}}/>
                        💼 仕事
                      </label>
                      <button onClick={saveEdit} style={{padding:"3px 10px",borderRadius:5,background:"#4a9a4a",border:"none",color:"#fff",fontSize:10,cursor:"pointer"}}>保存</button>
                      <button onClick={()=>{setEditIdx(null);setEditText("");setEditDate("");setEditYear("");setEditAge("");setEditIsWork(false);}} style={{padding:"3px 8px",borderRadius:5,background:"#aaa",border:"none",color:"#fff",fontSize:10,cursor:"pointer"}}>取消</button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1,flexWrap:"wrap"}}>
                        {m.date && <span style={{fontSize:10,color:"#9a8a70"}}>📅 {m.date}</span>}
                        {m.isWork && <span style={{fontSize:9,padding:"1px 5px",borderRadius:8,background:"#e8f0ff",color:"#5080c0",border:"1px solid #5080c055",fontWeight:700}}>💼 仕事</span>}
                      </div>
                      <span style={{fontSize:12,color:"#4a3828",lineHeight:1.5,wordBreak:"break-all"}}>{m.text}</span>
                    </div>
                    <div style={{display:"flex",gap:3,flexShrink:0}}>
                      <button onClick={()=>startEdit(globalIdx)} style={{padding:"2px 7px",borderRadius:5,background:"transparent",border:"1px solid #c4a070",color:"#8a6a3a",fontSize:9,cursor:"pointer"}}>編集</button>
                      {deleteIdx===globalIdx ? (
                        <span style={{display:"flex",gap:3,alignItems:"center"}}>
                          <span style={{fontSize:9,color:"#c06060"}}>削除?</span>
                          <button onClick={()=>deleteMemo(globalIdx)} style={{padding:"2px 7px",borderRadius:5,background:"#e05050",border:"none",color:"#fff",fontSize:9,cursor:"pointer"}}>Yes</button>
                          <button onClick={()=>setDeleteIdx(null)} style={{padding:"2px 7px",borderRadius:5,background:"#aaa",border:"none",color:"#fff",fontSize:9,cursor:"pointer"}}>No</button>
                        </span>
                      ) : (
                        <button onClick={()=>setDeleteIdx(globalIdx)} style={{padding:"2px 7px",borderRadius:5,background:"transparent",border:"1px solid #e0a0a0",color:"#c06060",fontSize:9,cursor:"pointer"}}>削除</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>}
    </div>
  );
}



// ─── 月支×日干イメージ ────────────────────────────────────────
const MONTH_IMAGE = {
  // [月支][日干元素] → {title, emoji, desc}
  // 月支: 子丑寅卯辰巳午未申酉戌亥 (0-11)
  // 日干元素: 木火土金水
  0:  {木:"冬の竹林",火:"冬の篝火",土:"雪原の大地",金:"氷の剣",水:"深夜の大河",
       emoji:{木:"🎋",火:"🔥",土:"❄️",金:"⚔️",水:"🌊"}},
  1:  {木:"雪解けの若芽",火:"薄氷の炎",土:"凍てつく田畑",金:"霜の宝玉",水:"雪解け水",
       emoji:{木:"🌱",火:"🕯️",土:"🌾",金:"💎",水:"💧"}},
  2:  {木:"春の大樹",火:"春風の炎",土:"春の大山",金:"春暁の刃",水:"春雨",
       emoji:{木:"🌳",火:"🌸",土:"⛰️",金:"🗡️",水:"🌦️"}},
  3:  {木:"春の草花",火:"花見の宴",土:"春霞の丘",金:"春の宝石",水:"春の小川",
       emoji:{木:"🌸",火:"🎆",土:"🌄",金:"🔮",水:"🏞️"}},
  4:  {木:"霞たなびく森",火:"朝霧の炎",土:"霧雨の山",金:"春暮れの剣",水:"霞の霧雨",
       emoji:{木:"🌿",火:"☁️",土:"🏔️",金:"💠",水:"🌫️"}},
  5:  {木:"夏の草木",火:"真夏の太陽",土:"夏の大地",金:"灼熱の刃",水:"夏の滝",
       emoji:{木:"🌿",火:"☀️",土:"🌄",金:"⚡",水:"💦"}},
  6:  {木:"夏の草花",火:"夏の焚火",土:"真夏の平野",金:"夏の宝玉",水:"夏の大河",
       emoji:{木:"🌺",火:"🎇",土:"🏜️",金:"🌟",水:"🌊"}},
  7:  {木:"盛夏の草原",火:"晩夏の陽炎",土:"夏の田畑",金:"残暑の輝き",水:"夏の夕立",
       emoji:{木:"🍃",火:"🌅",土:"🌻",金:"✨",水:"⛈️"}},
  8:  {木:"秋の木立",火:"秋の焚火",土:"秋の山",金:"秋風の剣",水:"秋雨",
       emoji:{木:"🍂",火:"🍁",土:"🏕️",金:"🌙",水:"🌧️"}},
  9:  {木:"秋の紅葉",火:"秋夕焼け",土:"秋の高原",金:"秋の宝剣",水:"秋の清流",
       emoji:{木:"🍁",火:"🌇",土:"🌾",金:"⚔️",水:"🏔️"}},
  10: {木:"晩秋の枯木",火:"霜降る炎",土:"晩秋の丘",金:"晩秋の月",水:"霜夜の水",
       emoji:{木:"🌲",火:"🕯️",土:"🍄",金:"🌕",水:"❄️"}},
  11: {木:"冬枯れの木",火:"冬の灯火",土:"冬の大地",金:"冬の宝玉",水:"真冬の川",
       emoji:{木:"🌿",火:"🔥",土:"⛄",金:"💍",水:"🌨️"}},
};

function getMonthImage(monthBranchIdx, dayStemEl) {
  const row = MONTH_IMAGE[monthBranchIdx];
  if(!row) return null;
  return {title: row[dayStemEl]||"", emoji: row.emoji?.[dayStemEl]||"✨"};
}

function MonthDayImageCard({pillars}) {
  const mBi = pillars.month?.branchIdx;
  const dEl = pillars.day?.stemEl;
  const img = (mBi!=null && dEl) ? getMonthImage(mBi, dEl) : null;
  if(!img || !img.title) return null;
  const col = EC[dEl] || {bg:"#f5f0e8",bd:"#c4a070",tx:"#5a3a1a"};
  const BRANCH_SEASON = ["冬(子)","冬(丑)","春(寅)","春(卯)","春(辰)","夏(巳)","夏(午)","夏(未)","秋(申)","秋(酉)","秋(戌)","冬(亥)"];
  const season = BRANCH_SEASON[mBi]||"";
  return (
    <div style={{
      display:"flex",alignItems:"center",gap:12,padding:"10px 16px",
      background:`linear-gradient(135deg,${col.bg},#fdf8f2)`,
      border:`1px solid ${col.bd}55`,borderRadius:10,marginBottom:14,
    }}>
      <div style={{fontSize:40,lineHeight:1}}>{img.emoji}</div>
      <div>
        <div style={{fontSize:10,color:"#9a8a70",marginBottom:2}}>月支（{season}）× 日干（{dEl}）のイメージ</div>
        <div style={{fontSize:17,fontWeight:700,color:col.tx,letterSpacing:1}}>{img.title}</div>
        <div style={{fontSize:10,color:"#8a7a60",marginTop:2}}>
          {pillars.month?.branch}月・{pillars.day?.stem}日干
        </div>
      </div>
    </div>
  );
}

function AgeMeishikiGogyou({result}) {
  const [inputAge, setInputAge] = useState("");
  const birthYear = Number(result.bd.split("-")[0]);

  const centerYear = inputAge ? birthYear + parseInt(inputAge) - 1 : null;
  const ryunenList = centerYear ? calcRyunen(centerYear, 1, result.pillars.day.stemIdx) : null;
  const ryunen = ryunenList?.[0];

  const centerEc = ryunen ? Object.assign({}, result.ec) : null;
  if(ryunen && centerEc) {
    centerEc[ryunen.stemEl] = (centerEc[ryunen.stemEl]||0)+1;
    centerEc[ryunen.branchEl] = (centerEc[ryunen.branchEl]||0)+1;
  }
  const sStemEc = ryunen ? {...(result.stemEc||{}), [ryunen.stemEl]: ((result.stemEc||{})[ryunen.stemEl]||0)+1} : null;
  const sBranchEc = ryunen ? {...(result.branchEc||{}), [ryunen.branchEl]: ((result.branchEc||{})[ryunen.branchEl]||0)+1} : null;

  const youjin = result.youjin;
  const ELCOL = {木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#b0b8d0",水:"#6ab0e8"};
  const yc = ELCOL[youjin?.youjinEl]||"#c0a0a0";
  const kc = ELCOL[youjin?.kijiinEl]||"#a0a0c0";

  return (
    <div style={{width:"100%",marginTop:10}}>
      {youjin && (
        <div style={{padding:"8px 12px",background:"#fdf5e8",border:"1px solid #d4b89688",borderRadius:8,boxSizing:"border-box"}}>
          <div style={{fontSize:10,color:"#8a7a60",marginBottom:6,letterSpacing:1}}>▌ 用神・喜神</div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,background:`${yc}18`,border:`1px solid ${yc}55`}}>
              <span style={{fontSize:9,color:yc}}>用神</span>
              <span style={{fontSize:20,fontWeight:700,color:yc}}>{youjin.youjinEl}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,background:`${kc}18`,border:`1px solid ${kc}55`}}>
              <span style={{fontSize:9,color:kc}}>喜神</span>
              <span style={{fontSize:20,fontWeight:700,color:kc}}>{youjin.kijiinEl}</span>
            </div>
            <div style={{fontSize:11,color:youjin.ratio>=50?"#c04010":"#1060b0",fontWeight:700,padding:"4px 8px",background:"#f5ece0",borderRadius:6,border:"1px solid #d4b89655",whiteSpace:"nowrap"}}>
              {youjin.bodyStr}
            </div>
          </div>
          <div style={{fontSize:10,color:"#7a6a55",lineHeight:1.7}}>{youjin.desc}</div>
        </div>
      )}
    </div>
  );
}

function SeikakuSection({stem, seikaku, tsuhen, junishi}) {
  const [showTsuhen, setShowTsuhen] = useState(false);
  const [showJunishi, setShowJunishi] = useState(false);
  const raw = (seikaku||SEIKAKU)[stem];
  if (!raw) return null;
  const data = {kw: raw.kw || raw.keyword || "", intro: raw.intro || "", p: raw.p || raw.paragraphs || []};
  const c = EC[STEM_EL[STEMS.indexOf(stem)]];
  const thList = [...new Set([tsuhen?.month, tsuhen?.year, tsuhen?.hour].filter(Boolean))];
  const juList = [...new Set([junishi?.year, junishi?.month, junishi?.day, junishi?.hour].filter(Boolean))];
  return (
    <div>
      {/* 日干ヘッダー */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"12px 14px",background:`linear-gradient(135deg,${c.bg},${c.bg}aa)`,border:`1px solid ${c.bd}44`,borderRadius:10}}>
        <div style={{width:48,height:48,borderRadius:8,background:c.bg,border:`2px solid ${c.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:c.tx}}>{stem}</div>
        <div><div style={{fontSize:10,color:c.tx,letterSpacing:2,opacity:.7}}>日干</div><div style={{fontSize:17,fontWeight:700,color:c.tx}}>{data.kw}</div></div>
      </div>
      <p style={{fontSize:14,lineHeight:1.9,color:"#4a3828",fontStyle:"italic",marginBottom:12,paddingLeft:10,borderLeft:`3px solid ${c.bd}`}}>{data.intro}</p>
      {data.p.map((para,i)=><p key={i} style={{fontSize:13,lineHeight:2,color:"#4a3828",marginBottom:12,textIndent:"1em"}}>{para}</p>)}

      {/* 通変星・十二運 チェックボックス */}
      <div style={{display:"flex",gap:16,marginTop:8,paddingTop:12,borderTop:"1px dashed #d4b896",flexWrap:"wrap"}}>
        {thList.length>0 && (
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"#7a5a2a",userSelect:"none"}}>
            <input type="checkbox" checked={showTsuhen} onChange={e=>setShowTsuhen(e.target.checked)} style={{accentColor:"#d4a84b",width:14,height:14}}/>
            <span style={{fontWeight:700}}>通変星からみる性格</span>
            <span style={{fontSize:10,color:"#aaa"}}>({thList.join("・")})</span>
          </label>
        )}
        {juList.length>0 && (
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"#5a6a2a",userSelect:"none"}}>
            <input type="checkbox" checked={showJunishi} onChange={e=>setShowJunishi(e.target.checked)} style={{accentColor:"#7a9a4a",width:14,height:14}}/>
            <span style={{fontWeight:700}}>十二運からみる気質</span>
            <span style={{fontSize:10,color:"#aaa"}}>({juList.join("・")})</span>
          </label>
        )}
      </div>

      {/* 通変星ブロック（チェック時のみ） */}
      {showTsuhen && thList.length>0 && (
        <div style={{marginTop:14,paddingTop:14,borderTop:"1px dashed #d4b89688"}}>
          <div style={{fontSize:12,color:"#7a5a2a",fontWeight:700,letterSpacing:1,marginBottom:10}}>▸ 通変星からみる性格</div>
          {thList.map(th=>{
            const d = TSUHEN_DESC[th];
            if(!d) return null;
            return (
              <div key={th} style={{marginBottom:12,paddingLeft:10,borderLeft:"3px solid #d4a84b88"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#8a5a1a"}}>{th}</span>
                  <span style={{fontSize:10,color:"#a07840",background:"#f0e0c0",padding:"1px 7px",borderRadius:10,border:"1px solid #d4b89666"}}>{d.kw}</span>
                </div>
                <p style={{fontSize:13,lineHeight:1.9,color:"#4a3828",margin:0}}>{d.txt}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* 十二運ブロック（チェック時のみ） */}
      {showJunishi && juList.length>0 && (
        <div style={{marginTop:14,paddingTop:14,borderTop:"1px dashed #d4b89688"}}>
          <div style={{fontSize:12,color:"#5a6a2a",fontWeight:700,letterSpacing:1,marginBottom:10}}>▸ 十二運からみる気質</div>
          {juList.map(ju=>{
            const d = JUNISHI_DESC[ju];
            if(!d) return null;
            return (
              <div key={ju} style={{marginBottom:12,paddingLeft:10,borderLeft:"3px solid #a0b86088"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#5a6a2a"}}>{ju}</span>
                  <span style={{fontSize:10,color:"#6a7a3a",background:"#e8f0d0",padding:"1px 7px",borderRadius:10,border:"1px solid #b8c89066"}}>{d.kw}</span>
                </div>
                <p style={{fontSize:13,lineHeight:1.9,color:"#4a3828",margin:0}}>{d.txt}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function YoujinSection({youjin}) {
  if (!youjin) return null;
  const {youjinEl, kijiinEl, bodyStr, ratio, desc} = youjin;
  const COLORS = {木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};
  const yc = COLORS[youjinEl]||"#c0a0ff";
  const kc = COLORS[kijiinEl]||"#a080dd";
  return (
    <div style={{background:"#fdf5e8",border:"1px solid #d4b896",borderRadius:10,padding:"14px 16px"}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
        <div style={{flex:1,minWidth:100,padding:"10px 14px",borderRadius:8,background:`${yc}18`,border:`1px solid ${yc}44`,textAlign:"center"}}>
          <div style={{fontSize:10,color:yc,opacity:.8,marginBottom:3,letterSpacing:1}}>用神（主）</div>
          <div style={{fontSize:26,fontWeight:700,color:yc}}>{youjinEl}</div>
        </div>
        <div style={{flex:1,minWidth:100,padding:"10px 14px",borderRadius:8,background:`${kc}18`,border:`1px solid ${kc}44`,textAlign:"center"}}>
          <div style={{fontSize:10,color:kc,opacity:.8,marginBottom:3,letterSpacing:1}}>喜神（補助）</div>
          <div style={{fontSize:26,fontWeight:700,color:kc}}>{kijiinEl}</div>
        </div>
        <div style={{flex:1,minWidth:100,padding:"10px 14px",borderRadius:8,background:"#f5ece0",border:"1px solid #d4b896",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#7a6a55",marginBottom:3,letterSpacing:1}}>身強・身弱</div>
          <div style={{fontSize:18,fontWeight:700,color:ratio>=50?"#c04010":"#1060b0"}}>{bodyStr}</div>
          <div style={{fontSize:10,color:"#8a7060",marginTop:2}}>比印 {ratio}%</div>
        </div>
      </div>
      <p style={{fontSize:12,lineHeight:1.9,color:"#5a4a35",margin:0}}>{desc}</p>
    </div>
  );
}


// ─── クリックで意味が出るツールチップ ────────────────────────
function ClickTooltip({label, desc, kw, color}) {
  const [open, setOpen] = React.useState(false);
  return (
    <span style={{position:"relative",display:"inline-block"}}>
      <span
        onClick={e=>{e.stopPropagation();setOpen(!open);}}
        style={{cursor:"pointer",borderBottom:`1px dashed ${color||"#c4a070"}`,color:color||"#8a5a1a",fontWeight:700,userSelect:"none"}}
      >{label}</span>
      {open && (
        <div
          onClick={e=>e.stopPropagation()}
          style={{position:"absolute",zIndex:999,top:"100%",left:0,minWidth:200,maxWidth:280,background:"#fdf8f2",border:`1px solid ${color||"#c4a070"}`,borderRadius:8,padding:"10px 14px",boxShadow:"0 4px 16px #0002",marginTop:4}}
        >
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:14,fontWeight:700,color:color||"#8a5a1a"}}>{label}</span>
            {kw&&<span style={{fontSize:10,background:`${color||"#c4a070"}22`,color:color||"#8a5a1a",padding:"1px 8px",borderRadius:10,border:`1px solid ${color||"#c4a070"}44`}}>{kw}</span>}
            <button onClick={()=>setOpen(false)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:14,color:"#aaa",padding:"0 2px",marginLeft:4}}>✕</button>
          </div>
          <p style={{fontSize:11,lineHeight:1.7,color:"#5a4a35",margin:0}}>{desc}</p>
        </div>
      )}
    </span>
  );
}

function TsuhenShinSatsuPanel({result}) {
  const [showTJ, setShowTJ] = useState(false);
  const [showSS, setShowSS] = useState(false);
  const shinSatsuEntries = result.shinSatsu ? Object.entries(result.shinSatsu.summary).filter(([k])=>k!=="刑") : [];
  const keiEntry = result.shinSatsu?.summary?.["刑"];
  return (
    <>
      <div style={{marginBottom:22}}>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 14px",background:"#fdf5e8",border:"1px solid #d4b89688",borderRadius:8,userSelect:"none"}}>
          <input type="checkbox" checked={showTJ} onChange={e=>setShowTJ(e.target.checked)} style={{accentColor:"#c4a070",width:15,height:15}}/>
          <span style={{fontSize:13,fontWeight:700,color:"#5a3a1a",letterSpacing:1}}>▌ 通変星・十二運 解説を表示</span>
        </label>
        {showTJ && (
          <div style={{marginTop:10}}>
            <TsuhenJunishiSection tsuhen={result.tsuhen} junishi={result.junishi}/>
          </div>
        )}
      </div>
      {(shinSatsuEntries.length>0||keiEntry) && (
        <div style={{marginBottom:22}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 14px",background:"#fdf5e8",border:"1px solid #d4b89688",borderRadius:8,userSelect:"none"}}>
            <input type="checkbox" checked={showSS} onChange={e=>setShowSS(e.target.checked)} style={{accentColor:"#c4a070",width:15,height:15}}/>
            <span style={{fontSize:13,fontWeight:700,color:"#5a3a1a",letterSpacing:1}}>▌ 神煞・空亡・刑 を表示</span>
          </label>
          {showSS && (
            <div style={{marginTop:10}}>
              {shinSatsuEntries.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{borderLeft:"3px solid #8a6a3a",paddingLeft:10,marginBottom:10,fontSize:13,fontWeight:700,color:"#5a3a1a",letterSpacing:2}}>神煞・空亡</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                    {shinSatsuEntries.map(([k,v])=>{
                      const sd=SS_DEF[k]||{col:"#c0a0ff",kw:"",txt:""};
                      return (
                        <div key={k} style={{padding:"10px 14px",borderRadius:8,background:"#fdf8f2",border:`1px solid ${sd.col}33`}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                            <ClickTooltip label={k} desc={sd.txt} kw={sd.kw} color={sd.col}/>
                            <span style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:"#888"}}>{v}</span>
                          </div>
                          <p style={{fontSize:11,color:"#999",lineHeight:1.7,margin:0}}>{sd.txt}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {keiEntry&&(
                <div>
                  <div style={{borderLeft:"3px solid #8a6a3a",paddingLeft:10,marginBottom:10,fontSize:13,fontWeight:700,color:"#5a3a1a",letterSpacing:2}}>刑</div>
                  <div style={{padding:"12px 16px",borderRadius:8,background:"#fdf8f2",border:`1px solid ${KEI_DEF.col}33`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <span style={{fontSize:14,fontWeight:700,color:KEI_DEF.col}}>刑</span>
                      <span style={{fontSize:10,color:KEI_DEF.col,opacity:0.8,background:`${KEI_DEF.col}18`,padding:"1px 7px",borderRadius:10,border:`1px solid ${KEI_DEF.col}44`}}>{KEI_DEF.kw}</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#e0c080",marginLeft:4}}>該当地支：{keiEntry}</span>
                    </div>
                    <p style={{fontSize:11,color:"#999",lineHeight:1.7,margin:0}}>{KEI_DEF.txt}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Section({title,children}) {
  return (
    <div style={{marginBottom:22}}>
      <div style={{borderLeft:"3px solid #8a6a3a",paddingLeft:10,marginBottom:10,fontSize:14,fontWeight:700,color:"#5a3a1a",letterSpacing:2}}>{title}</div>
      {children}
    </div>
  );
}

// ─── 未来5年運勢セクション（AI生成） ────────────────────────────
function FutureFortuneSection({result, globalApiKey, setGlobalApiKey}) {
  const [fortune, setFortune] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [visibleYears, setVisibleYears] = useState(null); // null=全表示
  const apiKey = globalApiKey;
  const setApiKey = setGlobalApiKey;
  const nowY = new Date().getFullYear();

  const futureYears = result.ryunen.filter(r => r.year >= nowY && r.year < nowY + 5);
  const curDaiun = result.daiun.list.find((d,i,arr)=>d.startYear<=nowY&&(!arr[i+1]||arr[i+1].startYear>nowY));

  // 初期化：全年ON
  React.useEffect(()=>{
    if(futureYears.length>0 && visibleYears===null){
      setVisibleYears(new Set(futureYears.map(r=>r.year)));
    }
  },[]);

  const toggleYear = (y) => {
    setVisibleYears(prev=>{
      const next = new Set(prev);
      next.has(y) ? next.delete(y) : next.add(y);
      return next;
    });
  };

  const buildPrompt = () => {
    const name = result.name;
    const dayStem = result.pillars.day.stem;
    const seikaku = SEIKAKU[dayStem];
    const youjin = result.youjin;
    const yearsList = (visibleYears ? futureYears.filter(r=>visibleYears.has(r.year)) : futureYears).map(r => 
      r.year+"年（"+r.stem+r.branch+"年・"+r.stemEl+r.branchEl+"・通変星:"+(r.tsuhen||"—")+"）"
    ).join("\n");
    const daiunStr = curDaiun ? curDaiun.stem+curDaiun.branch+"（"+curDaiun.startYear+"年〜）" : "不明";
    return "あなたは四柱推命の専門家です。以下の命式データに基づき、未来"+futureYears.length+"年間（"+futureYears[0]?.year+"〜"+futureYears[futureYears.length-1]?.year+"年）の運勢を鑑定してください。\n\n【命式情報】\n- 鑑定対象："+name+"様\n- 日干："+dayStem+"（"+(seikaku?.kw||"")+"）\n- 日干の五行："+STEM_EL[STEMS.indexOf(dayStem)]+"\n- 身強・身弱："+(youjin?.bodyStr||"")+"\n- 用神："+(youjin?.youjinEl||"")+"、喜神："+(youjin?.kijiinEl||"")+"\n- 現在の大運："+daiunStr+"\n\n【対象年の流年】\n"+yearsList+"\n\n各年の天干・地支が日干（"+dayStem+"）に与える影響を分析し、用神（"+(youjin?.youjinEl||"")+"）が巡る年は吉として、仕事運・金運・対人運・健康運の4観点と総合評価（◎大吉/○吉/△普通/▲注意/✕凶）を各年200文字程度で。JSONのみ出力: {overview:概括,years:[{year:年号,rating:◎大吉,summary:サマリー,work:仕事運,money:金運,relation:対人運,health:健康運,advice:アドバイス}]}";
  };

  const generateFortune = async () => {
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{role: "user", content: buildPrompt()}]
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText.slice(0,200)}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      const text = data.content?.map(c=>c.text||"").join("") || "";
      if (!text) throw new Error("AIからの応答が空でした");
      const clean = text.replace(/```json[\s\S]*?```/g, m=>m.slice(7,-3)).replace(/```/g,"").trim();
      // JSON部分を抽出
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("JSON形式の応答が取得できませんでした: " + clean.slice(0,100));
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.years || !Array.isArray(parsed.years)) throw new Error("yearsフィールドが見つかりません");
      setFortune(parsed);
    } catch(e) {
      setError("鑑定の生成に失敗しました。");
      setErrorDetail(e.message || String(e));
    }
    setLoading(false);
  };

  const RATING_COLOR = {
    "◎大吉":"#e8920a", "○吉":"#4a9a4a", "△普通":"#7a7a3a", "▲注意":"#9a6a1a", "✕凶":"#9a2a2a"
  };
  const RATING_BG = {
    "◎大吉":"#fff3e0", "○吉":"#e8f5e8", "△普通":"#f5f5e8", "▲注意":"#f5ece0", "✕凶":"#f5e0e0"
  };

  if (!fortune && !loading) {
    return (
      <div style={{background:"#fdf8f2",border:"1px dashed #c4a070",borderRadius:12,padding:"20px"}}>
        {/* 年選択チェックボックス（鑑定前から表示） */}
        {visibleYears && (
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"#7a5a2a",fontWeight:700,marginBottom:8}}>鑑定する年を選択：</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {futureYears.map(r=>{
                const on = visibleYears.has(r.year);
                const sc = EC[r.stemEl];
                return (
                  <label key={r.year} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"5px 12px",borderRadius:16,border:`1px solid ${on?sc?.bd+"88":"#ccc"}`,background:on?sc?.bg+"88":"#f5f5f5",fontSize:12,userSelect:"none"}}>
                    <input type="checkbox" checked={on} onChange={()=>toggleYear(r.year)} style={{accentColor:sc?.bd,width:13,height:13}}/>
                    <span style={{color:on?sc?.tx:"#aaa",fontWeight:on?700:400}}>{r.year}年</span>
                    <span style={{color:on?sc?.tx:"#bbb",fontSize:10}}>{r.stem}{r.branch}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,color:"#5a3a1a",marginBottom:4,fontWeight:700}}>🔮 未来{visibleYears?[...visibleYears].length:futureYears.length}年間の運勢鑑定</div>
          <div style={{fontSize:11,color:"#8a7a60",marginBottom:14,lineHeight:1.7}}>
            選択した年の仕事運・金運・対人運・健康運をAIが鑑定します
          </div>
          <div style={{marginBottom:12,textAlign:"left"}}>
            <div style={{fontSize:11,color:"#7a6a55",marginBottom:4}}>Anthropic APIキー</div>
            <input
              type="password"
              value={apiKey}
              onChange={e=>setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #c4a070",fontSize:12,background:"#fdf5e8",boxSizing:"border-box"}}
            />
          </div>
          <button
            onClick={generateFortune}
            disabled={!apiKey.trim() || (visibleYears && visibleYears.size===0)}
            style={{background:(apiKey.trim()&&(!visibleYears||visibleYears.size>0))?"linear-gradient(135deg,#c88a2a,#e8a030)":"#ccc",border:"none",borderRadius:24,padding:"12px 32px",color:"#fff",fontSize:14,fontWeight:700,cursor:(apiKey.trim()&&(!visibleYears||visibleYears.size>0))?"pointer":"not-allowed",letterSpacing:2}}
          >
            ✦ 運勢を鑑定する ✦
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{textAlign:"center",padding:"40px 20px"}}>
        <div style={{fontSize:24,marginBottom:12}}>⏳</div>
        <div style={{fontSize:13,color:"#7a5a2a",letterSpacing:2}}>運勢を鑑定中...</div>
        <div style={{fontSize:11,color:"#9a8a70",marginTop:8}}>AIが命式を分析しています</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{textAlign:"center",padding:"24px",background:"#fdf0f0",border:"1px solid #e0a0a0",borderRadius:10}}>
        <div style={{fontSize:13,color:"#904040",marginBottom:8}}>{error}</div>
        {errorDetail && <div style={{fontSize:10,color:"#b06060",marginBottom:12,background:"#fff0f0",padding:"6px 10px",borderRadius:6,textAlign:"left",wordBreak:"break-all",maxHeight:80,overflowY:"auto"}}>{errorDetail}</div>}
        <button onClick={generateFortune} style={{padding:"8px 20px",borderRadius:8,background:"#c04040",border:"none",color:"#fff",cursor:"pointer",fontSize:12}}>再試行</button>
      </div>
    );
  }

  return (
    <div>
      {/* 年選択チェックボックス */}
      {fortune && visibleYears && (
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14,padding:"10px 14px",background:"#fdf5e8",borderRadius:8,border:"1px solid #e0c890"}}>
          <span style={{fontSize:11,color:"#7a5a2a",fontWeight:700,alignSelf:"center"}}>表示する年：</span>
          {futureYears.map(r=>{
            const on = visibleYears.has(r.year);
            const sc = EC[r.stemEl];
            return (
              <label key={r.year} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"4px 10px",borderRadius:16,border:`1px solid ${on?sc?.bd+"88":"#ccc"}`,background:on?sc?.bg+"88":"#f5f5f5",fontSize:12,userSelect:"none"}}>
                <input type="checkbox" checked={on} onChange={()=>toggleYear(r.year)} style={{accentColor:sc?.bd,width:13,height:13}}/>
                <span style={{color:on?sc?.tx:"#aaa",fontWeight:on?700:400}}>{r.year}年</span>
                <span style={{color:on?sc?.tx:"#bbb",fontSize:10}}>{r.stem}{r.branch}</span>
              </label>
            );
          })}
        </div>
      )}
      {fortune?.overview && (
        <div style={{background:"linear-gradient(135deg,#fdf5e8,#f5ede0)",border:"1px solid #d4b896",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:11,color:"#8a6a3a",letterSpacing:2,marginBottom:6}}>◈ 5年間の総括</div>
          <p style={{fontSize:13,lineHeight:1.9,color:"#4a3828",margin:0}}>{fortune.overview}</p>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {fortune?.years?.filter(yr=>!visibleYears || visibleYears.has(yr.year)).map((yr,i) => {
          const rCol = RATING_COLOR[yr.rating] || "#7a6a55";
          const rBg = RATING_BG[yr.rating] || "#fdf8f2";
          const ryunenData = futureYears.find(r=>r.year===yr.year);
          // 五行カウント（その年の流年天干・地支）
          const yearEc = {木:0,火:0,土:0,金:0,水:0};
          if(ryunenData){yearEc[ryunenData.stemEl]++;yearEc[ryunenData.branchEl]++;}
          return (
            <div key={i} style={{background:rBg,border:`1px solid ${rCol}44`,borderRadius:10,overflow:"hidden"}}>
              <div style={{background:`${rCol}18`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${rCol}22`}}>
                <div style={{fontSize:22,fontWeight:900,color:rCol}}>{yr.year}年</div>
                {ryunenData && (
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:18,fontWeight:700,color:EC[ryunenData.stemEl]?.tx}}>{ryunenData.stem}</span>
                    <span style={{fontSize:18,fontWeight:700,color:EC[ryunenData.branchEl]?.tx}}>{ryunenData.branch}</span>
                    <span style={{fontSize:10,color:"#8a7a60"}}>年</span>
                  </div>
                )}
                {/* 五行バランスミニ表示 */}
                {ryunenData && (
                  <div style={{display:"flex",gap:4,alignItems:"center",marginLeft:8}}>
                    {["木","火","土","金","水"].map(el=>{
                      const cnt = (result.ec[el]||0) + (yearEc[el]||0);
                      const c = EC[el];
                      return cnt>0 ? (
                        <span key={el} style={{fontSize:10,padding:"1px 5px",borderRadius:4,background:c.bg,color:c.tx,border:`1px solid ${c.bd}44`,fontWeight:700}}>{el}{cnt}</span>
                      ):null;
                    })}
                  </div>
                )}
                <div style={{marginLeft:"auto",background:rCol,color:"#fff",padding:"4px 12px",borderRadius:16,fontSize:12,fontWeight:700}}>{yr.rating}</div>
              </div>
              <div style={{padding:"12px 16px"}}>
                <div style={{fontSize:13,fontWeight:700,color:rCol,marginBottom:10}}>{yr.summary}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
                  {[["💼 仕事・キャリア",yr.work],["💰 金運・財運",yr.money],["💫 対人・恋愛",yr.relation],["🌿 健康",yr.health]].map(([label,text],j)=>(
                    <div key={j} style={{background:"#ffffff88",borderRadius:6,padding:"8px 10px"}}>
                      <div style={{fontSize:10,color:"#7a5a2a",marginBottom:4,fontWeight:700}}>{label}</div>
                      <div style={{fontSize:11,lineHeight:1.7,color:"#4a3828"}}>{text}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#ffffff66",borderRadius:6,padding:"8px 12px",borderLeft:`3px solid ${rCol}`}}>
                  <div style={{fontSize:10,color:rCol,marginBottom:3,fontWeight:700}}>✦ アドバイス</div>
                  <div style={{fontSize:11,lineHeight:1.7,color:"#4a3828"}}>{yr.advice}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {fortune && (
        <div style={{textAlign:"center",marginTop:16}}>
          <button onClick={generateFortune} style={{padding:"8px 20px",borderRadius:8,background:"transparent",border:"1px solid #c4a070",color:"#8a6a3a",cursor:"pointer",fontSize:11}}>🔄 再鑑定する</button>
        </div>
      )}
    </div>
  );
}

// ─── 年齢指定運勢セクション ────────────────────────────────────
function AgeFortuneSection({result, globalApiKey, setGlobalApiKey}) {
  const [inputAge, setInputAge] = useState("");
  const [mode, setMode] = useState("auto");
  const [fortune, setFortune] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const apiKey = globalApiKey;
  const setApiKey = setGlobalApiKey;
  const [targetYears, setTargetYears] = useState(null); // 前後3年 計7年
  const [futureYears5, setFutureYears5] = useState(null); // 指定年齢以降5年
  const [showFuture5, setShowFuture5] = useState(false);
  const [visibleYears, setVisibleYears] = useState(null);
  const [fortune5, setFortune5] = useState(null);
  const [loading5, setLoading5] = useState(false);
  const [error5, setError5] = useState(null);

  const birthYear = Number(result.bd.split("-")[0]);
  const RATING_COLOR = {"◎大吉":"#e8920a","○吉":"#4a9a4a","△普通":"#7a7a3a","▲注意":"#9a6a1a","✕凶":"#9a2a2a"};
  const RATING_BG = {"◎大吉":"#fff3e0","○吉":"#e8f5e8","△普通":"#f5f5e8","▲注意":"#f5ece0","✕凶":"#f5e0e0"};

  const handleSearch = () => {
    const age = parseInt(inputAge);
    if (!age || age < 1 || age > 120) return;
    const centerYear = birthYear + age - 1;
    const years7 = calcRyunen(centerYear - 3, 7, result.pillars.day.stemIdx);
    const years5 = calcRyunen(centerYear, 5, result.pillars.day.stemIdx);
    setTargetYears(years7);
    setFutureYears5(years5);
    setVisibleYears(new Set(years7.map(r=>r.year)));
    setFortune(null); setFortune5(null);
    setError(null); setError5(null);
    setShowFuture5(false);
  };

  const toggleYear = (y) => setVisibleYears(prev=>{const n=new Set(prev); n.has(y)?n.delete(y):n.add(y); return n;});

  // 指定年齢の五行バランス（命式 + その年の流年）
  const centerYearData = targetYears?.[3];
  const centerEc = centerYearData ? Object.assign({}, result.ec) : null;
  if(centerYearData && centerEc){
    centerEc[centerYearData.stemEl] = (centerEc[centerYearData.stemEl]||0)+1;
    centerEc[centerYearData.branchEl] = (centerEc[centerYearData.branchEl]||0)+1;
  }

  const buildPrompt = (years, label) => {
    const age = parseInt(inputAge);
    const centerYear = birthYear + age - 1;
    const dayStem = result.pillars.day.stem;
    const youjin = result.youjin;
    const curDaiun = result.daiun.list.find((d,i,arr)=>d.startYear<=centerYear&&(!arr[i+1]||arr[i+1].startYear>centerYear));
    const yearsList = years.map(r=>r.year+"年（"+r.stem+r.branch+"年・"+r.stemEl+r.branchEl+"・通変星:"+(r.tsuhen||"—")+"）").join("\n");
    const daiunStr2 = curDaiun ? curDaiun.stem+curDaiun.branch+"（"+curDaiun.startYear+"年〜）" : "不明";
    return "あなたは四柱推命の専門家です。"+label+"の運勢を鑑定してください。\n【命式】日干："+dayStem+"、身強・身弱："+(youjin?.bodyStr||"")+"、用神："+(youjin?.youjinEl||"")+"、喜神："+(youjin?.kijiinEl||"")+"\n大運："+daiunStr2+"\n【流年】\n"+yearsList+"\n用神（"+(youjin?.youjinEl||"")+"）が巡る年は吉。各年150文字程度でアドバイス。\nJSONのみ出力: {overview:概括,years:[{year:年号,rating:◎大吉,summary:サマリー,work:仕事運,money:金運,relation:対人運,health:健康,advice:アドバイス}]}";
  };

  const generateAI = async (years, label, setF, setL, setE) => {
    setL(true); setE(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:buildPrompt(years,label)}]})
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("")||"";
      const m = text.replace(/```json[\s\S]*?```/g,x=>x.slice(7,-3)).replace(/```/g,"").trim().match(/\{[\s\S]*\}/);
      if(!m) throw new Error("JSONが取得できませんでした");
      setF(JSON.parse(m[0]));
    } catch(e){ setE(e.message); }
    setL(false);
  };

  const renderFortune = (fort, years) => (
    <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
      {fort.overview&&<div style={{background:"linear-gradient(135deg,#fdf5e8,#f5ede0)",border:"1px solid #d4b896",borderRadius:8,padding:"10px 14px",fontSize:12,lineHeight:1.8,color:"#4a3828"}}><span style={{fontSize:10,color:"#8a6a3a",fontWeight:700,marginRight:8}}>◈ 総括</span>{fort.overview}</div>}
      {fort.years?.map((yr,i)=>{
        const rCol=RATING_COLOR[yr.rating]||"#7a6a55", rBg=RATING_BG[yr.rating]||"#fdf8f2";
        const rd=years.find(r=>r.year===yr.year);
        const isCenter = rd && years[3]?.year===yr.year;
        return(
          <div key={i} style={{background:rBg,border:`${isCenter?2:1}px solid ${isCenter?rCol:rCol+"44"}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{background:`${rCol}18`,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${rCol}22`,flexWrap:"wrap"}}>
              <div style={{fontSize:18,fontWeight:900,color:rCol}}>{yr.year}年</div>
              {rd&&<span style={{fontSize:13,color:EC[rd.stemEl]?.tx,fontWeight:700}}>{rd.stem}</span>}
              {rd&&<span style={{fontSize:13,color:EC[rd.branchEl]?.tx,fontWeight:700}}>{rd.branch}</span>}
              {isCenter&&<span style={{fontSize:10,background:"#e8920a",color:"#fff",padding:"2px 7px",borderRadius:10}}>指定年齢</span>}
              {/* 五行ミニバッジ */}
              {rd&&<div style={{display:"flex",gap:3}}>
                {["木","火","土","金","水"].map(el=>{
                  const cnt=(result.ec[el]||0)+(rd.stemEl===el?1:0)+(rd.branchEl===el?1:0);
                  const c=EC[el];
                  return cnt>0?<span key={el} style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:c.bg,color:c.tx,border:`1px solid ${c.bd}44`,fontWeight:700}}>{el}{cnt}</span>:null;
                })}
              </div>}
              <div style={{marginLeft:"auto",background:rCol,color:"#fff",padding:"3px 10px",borderRadius:14,fontSize:11,fontWeight:700}}>{yr.rating}</div>
            </div>
            <div style={{padding:"10px 14px"}}>
              <div style={{fontSize:12,fontWeight:700,color:rCol,marginBottom:6}}>{yr.summary}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:6}}>
                {[["💼 仕事",yr.work],["💰 金運",yr.money],["💫 対人",yr.relation],["🌿 健康",yr.health]].map(([l,t],j)=>(
                  <div key={j} style={{background:"#ffffff88",borderRadius:5,padding:"5px 8px"}}>
                    <div style={{fontSize:9,color:"#7a5a2a",fontWeight:700,marginBottom:2}}>{l}</div>
                    <div style={{fontSize:10,lineHeight:1.6,color:"#4a3828"}}>{t}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#ffffff66",borderRadius:5,padding:"6px 10px",borderLeft:`3px solid ${rCol}`}}>
                <div style={{fontSize:9,color:rCol,fontWeight:700,marginBottom:1}}>✦ アドバイス</div>
                <div style={{fontSize:10,lineHeight:1.6,color:"#4a3828"}}>{yr.advice}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      {/* 入力エリア */}
      <div style={{background:"#fdf8f2",border:"1px solid #d4b896",borderRadius:10,padding:"16px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <label style={{fontSize:13,color:"#5a3a1a",fontWeight:700}}>数え年で入力：</label>
            <input type="number" min="1" max="120" value={inputAge} onChange={e=>setInputAge(e.target.value)} placeholder="例: 30"
              style={{width:80,padding:"6px 10px",borderRadius:8,border:"1px solid #c4a070",fontSize:14,textAlign:"center"}}/>
            <span style={{fontSize:13,color:"#5a3a1a"}}>歳</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setMode("auto");handleSearch();}} disabled={!inputAge}
              style={{padding:"7px 18px",borderRadius:8,border:"1px solid #c4a070",background:mode==="auto"?"#e8a030":"#fdf5e8",color:mode==="auto"?"#fff":"#8a6a3a",cursor:inputAge?"pointer":"not-allowed",fontSize:12,fontWeight:700}}>自動計算</button>
            <button onClick={()=>{setMode("ai");handleSearch();}} disabled={!inputAge}
              style={{padding:"7px 18px",borderRadius:8,border:"1px solid #c4a070",background:mode==="ai"?"#e8a030":"#fdf5e8",color:mode==="ai"?"#fff":"#8a6a3a",cursor:inputAge?"pointer":"not-allowed",fontSize:12,fontWeight:700}}>AI鑑定</button>
          </div>
        </div>
        <div style={{fontSize:10,color:"#9a8a70",marginTop:6}}>※ 入力した年齢を中心に前後3年ずつ計7年分を表示します</div>
      </div>

      {targetYears && (
        <div>
          {/* 指定年齢の五行バランス */}
          {centerYearData && centerEc && (
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"10px 16px",background:"#fdf5e8",borderRadius:10,border:"1px solid #e0c890",flexWrap:"wrap"}}>
              <div style={{fontSize:12,color:"#5a3a1a",fontWeight:700}}>{parseInt(inputAge)}歳（{centerYearData.year}年）の五行バランス：</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["木","火","土","金","水"].map(el=>{
                  const cnt = centerEc[el]||0;
                  const c = EC[el];
                  return cnt>0?(
                    <div key={el} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 10px",borderRadius:8,background:c.bg,border:`1px solid ${c.bd}`,minWidth:36}}>
                      <span style={{fontSize:16,fontWeight:700,color:c.tx}}>{el}</span>
                      <span style={{fontSize:10,color:c.tx,opacity:0.8}}>{cnt}</span>
                    </div>
                  ):null;
                })}
              </div>
              <div style={{fontSize:10,color:"#9a8a70",marginLeft:"auto"}}>命式＋流年（{centerYearData.stem}{centerYearData.branch}年）</div>
            </div>
          )}

          {/* 年ON/OFFチェックボックス */}
          {visibleYears && (
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12,padding:"8px 12px",background:"#fdf5e8",borderRadius:8,border:"1px solid #e0c890",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#7a5a2a",fontWeight:700}}>表示する年：</span>
              {targetYears.map((r,i)=>{
                const on=visibleYears.has(r.year), sc=EC[r.stemEl], isC=i===3;
                return(
                  <label key={r.year} style={{display:"flex",alignItems:"center",gap:3,cursor:"pointer",padding:"3px 8px",borderRadius:14,border:`1px solid ${on?sc?.bd+"88":"#ccc"}`,background:on?(isC?"#e8d4b8":sc?.bg+"88"):"#f5f5f5",fontSize:11,userSelect:"none"}}>
                    <input type="checkbox" checked={on} onChange={()=>toggleYear(r.year)} style={{accentColor:sc?.bd,width:12,height:12}}/>
                    <span style={{color:on?sc?.tx:"#aaa",fontWeight:isC?700:400}}>{r.year}年</span>
                    {isC&&<span style={{fontSize:9,color:"#e8920a"}}>●</span>}
                  </label>
                );
              })}
            </div>
          )}

          {/* 流年テーブル ＋ 五行バランス（横並び） */}
          <div style={{display:"flex",flexDirection:"row",gap:16,alignItems:"flex-start",marginBottom:16,flexWrap:"wrap"}}>
            <div style={{overflowX:"auto",flexShrink:0}}>
            <table style={{borderCollapse:"collapse",fontSize:12}}>
              <tbody>
                {[
                  ["数え年", targetYears.map((r,i)=>({val:`${r.year-birthYear+1}歳`,isC:i===3}))],
                  ["西暦",   targetYears.map((r,i)=>({val:`${r.year}`,isC:i===3}))],
                ].map(([label,cells])=>(
                  <tr key={label}>
                    <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55",whiteSpace:"nowrap"}}>{label}</td>
                    {cells.map((c,i)=><td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",fontSize:11,background:c.isC?"#e8d4b8":"#fdf8f2",fontWeight:c.isC?700:400,color:c.isC?"#5a3010":"#8a7a60",minWidth:52}}>{c.val}</td>)}
                  </tr>
                ))}
                <tr>
                  <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>天干</td>
                  {targetYears.map((r,i)=>{const sc=EC[r.stemEl],isC=i===3; return <td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",background:isC?"#e8d4b8":"#fdf8f2"}}><span style={{fontSize:18,fontWeight:700,color:sc?.tx}}>{r.stem}</span><div style={{fontSize:9,color:sc?.tx,opacity:0.7}}>{r.stemEl}</div></td>;})}
                </tr>
                <tr>
                  <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>通変星</td>
                  {targetYears.map((r,i)=>{const isC=i===3; return <td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",fontSize:11,background:isC?"#e8d4b8":"#fdf8f2",color:isC?"#5a3010":"#555"}}>{r.tsuhen||"—"}</td>;})}
                </tr>
                <tr>
                  <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>地支</td>
                  {targetYears.map((r,i)=>{const bc=EC[r.branchEl],isC=i===3; return <td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",background:isC?"#e8d4b8":"#fdf8f2"}}><span style={{fontSize:18,fontWeight:700,color:bc?.tx}}>{r.branch}</span><div style={{fontSize:9,color:bc?.tx,opacity:0.7}}>{r.branchEl}</div></td>;})}
                </tr>
                <tr>
                  <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>十二運</td>
                  {targetYears.map((r,i)=>{const isC=i===3,ju=getJunishi(result.pillars.day.stemIdx,r.branchIdx); return <td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",fontSize:11,background:isC?"#e8d4b8":"#fdf8f2",color:isC?"#5a3010":"#555"}}>{ju}</td>;})}
                </tr>
              </tbody>
            </table>
            </div>
            {/* 五行バランス（命式＋指定年の流年） */}
            {centerYearData && centerEc && (()=>{
              // stemEc/branchEcも指定年の流年を加算して作成
              const sStemEc = Object.assign({},result.stemEc||{});
              const sBranchEc = Object.assign({},result.branchEc||{});
              sStemEc[centerYearData.stemEl] = (sStemEc[centerYearData.stemEl]||0)+1;
              sBranchEc[centerYearData.branchEl] = (sBranchEc[centerYearData.branchEl]||0)+1;
              return (
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{fontSize:11,color:"#5a3a1a",marginBottom:2,letterSpacing:1,alignSelf:"flex-start"}}>
                    ▌ 五行バランス（{parseInt(inputAge)}歳・{centerYearData.year}年）
                  </div>
                  <GogyouCircle ec={centerEc} stemEc={sStemEc} branchEc={sBranchEc} extraEc={{木:0,火:0,土:0,金:0,水:0}} dayEl={result.pillars.day.stemEl}/>
                </div>
              );
            })()}
          </div>

          {/* AI鑑定（前後7年） */}
          {mode==="ai" && !fortune && !loading && (
            <div style={{background:"#fdf8f2",border:"1px dashed #c4a070",borderRadius:10,padding:"14px",textAlign:"center",marginBottom:12}}>
              {!apiKey.trim()&&<div style={{marginBottom:10,textAlign:"left"}}>
                <div style={{fontSize:11,color:"#7a6a55",marginBottom:4}}>Anthropic APIキー</div>
                <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-ant-..."
                  style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #c4a070",fontSize:12,background:"#fdf5e8",boxSizing:"border-box"}}/>
              </div>}
              <button onClick={()=>generateAI(targetYears,`${inputAge}歳前後7年間`,setFortune,setLoading,setError)} disabled={!apiKey.trim()}
                style={{background:apiKey.trim()?"linear-gradient(135deg,#c88a2a,#e8a030)":"#ccc",border:"none",borderRadius:24,padding:"10px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:apiKey.trim()?"pointer":"not-allowed",letterSpacing:1}}>
                ✦ 前後7年のAI鑑定 ✦
              </button>
            </div>
          )}
          {mode==="ai" && loading && <div style={{textAlign:"center",padding:"20px",fontSize:13,color:"#7a5a2a"}}>⏳ 鑑定中...</div>}
          {mode==="ai" && error && <div style={{padding:"10px",background:"#fdf0f0",borderRadius:8,fontSize:11,color:"#904040"}}>{error}<button onClick={()=>generateAI(targetYears,`${inputAge}歳前後7年間`,setFortune,setLoading,setError)} style={{marginLeft:8,padding:"3px 10px",borderRadius:5,background:"#c04040",border:"none",color:"#fff",cursor:"pointer",fontSize:10}}>再試行</button></div>}
          {mode==="ai" && fortune && (
            <div>
              {renderFortune({...fortune, years: fortune.years?.filter(yr=>!visibleYears||visibleYears.has(yr.year))}, targetYears)}
              <div style={{textAlign:"center",marginTop:10}}>
                <button onClick={()=>generateAI(targetYears,`${inputAge}歳前後7年間`,setFortune,setLoading,setError)} style={{padding:"6px 16px",borderRadius:8,background:"transparent",border:"1px solid #c4a070",color:"#8a6a3a",cursor:"pointer",fontSize:11}}>🔄 再鑑定</button>
              </div>
            </div>
          )}

          {/* 指定年齢以降5年セクション */}
          <div style={{marginTop:20,borderTop:"2px dashed #d4b896",paddingTop:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{fontSize:13,color:"#5a3a1a",fontWeight:700}}>▌ {inputAge}歳以降5年の運勢</div>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"#7a6a55"}}>
                <input type="checkbox" checked={showFuture5} onChange={e=>setShowFuture5(e.target.checked)} style={{width:14,height:14}}/>
                表示する
              </label>
            </div>
            {showFuture5 && futureYears5 && (
              <div>
                <div style={{overflowX:"auto",marginBottom:12}}>
                  <table style={{borderCollapse:"collapse",fontSize:12}}>
                    <tbody>
                      <tr>
                        <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>数え年</td>
                        {futureYears5.map((r,i)=><td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",fontSize:11,background:i===0?"#e8d4b8":"#fdf8f2",fontWeight:i===0?700:400,color:i===0?"#5a3010":"#8a7a60",minWidth:52}}>{r.year-birthYear+1}歳</td>)}
                      </tr>
                      <tr>
                        <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>西暦</td>
                        {futureYears5.map((r,i)=><td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",fontSize:11,background:i===0?"#e8d4b8":"#fdf8f2",fontWeight:i===0?700:400,color:i===0?"#5a3010":"#8a7a60"}}>{r.year}</td>)}
                      </tr>
                      <tr>
                        <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>天干</td>
                        {futureYears5.map((r,i)=>{const sc=EC[r.stemEl]; return <td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",background:i===0?"#e8d4b8":"#fdf8f2"}}><span style={{fontSize:16,fontWeight:700,color:sc?.tx}}>{r.stem}</span><div style={{fontSize:9,color:sc?.tx,opacity:0.7}}>{r.stemEl}</div></td>;})}
                      </tr>
                      <tr>
                        <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>通変星</td>
                        {futureYears5.map((r,i)=><td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",fontSize:11,background:i===0?"#e8d4b8":"#fdf8f2"}}>{r.tsuhen||"—"}</td>)}
                      </tr>
                      <tr>
                        <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>地支</td>
                        {futureYears5.map((r,i)=>{const bc=EC[r.branchEl]; return <td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",background:i===0?"#e8d4b8":"#fdf8f2"}}><span style={{fontSize:16,fontWeight:700,color:bc?.tx}}>{r.branch}</span><div style={{fontSize:9,color:bc?.tx,opacity:0.7}}>{r.branchEl}</div></td>;})}
                      </tr>
                      <tr>
                        <td style={{border:"1px solid #c8b89a",padding:"4px 8px",background:"#f0e8da",fontSize:11,color:"#7a6a55"}}>十二運</td>
                        {futureYears5.map((r,i)=>{const ju=getJunishi(result.pillars.day.stemIdx,r.branchIdx); return <td key={i} style={{border:"1px solid #c8b89a",padding:"4px 6px",textAlign:"center",fontSize:11,background:i===0?"#e8d4b8":"#fdf8f2"}}>{ju}</td>;})}
                      </tr>
                    </tbody>
                  </table>
                </div>
                {mode==="ai" && !fortune5 && !loading5 && (
                  <div style={{textAlign:"center"}}>
                    <button onClick={()=>generateAI(futureYears5,`${inputAge}歳以降5年間`,setFortune5,setLoading5,setError5)} disabled={!apiKey.trim()}
                      style={{background:apiKey.trim()?"linear-gradient(135deg,#c88a2a,#e8a030)":"#ccc",border:"none",borderRadius:24,padding:"9px 24px",color:"#fff",fontSize:12,fontWeight:700,cursor:apiKey.trim()?"pointer":"not-allowed",letterSpacing:1}}>
                      ✦ {inputAge}歳以降5年のAI鑑定 ✦
                    </button>
                  </div>
                )}
                {mode==="ai" && loading5 && <div style={{textAlign:"center",padding:"16px",fontSize:13,color:"#7a5a2a"}}>⏳ 鑑定中...</div>}
                {mode==="ai" && error5 && <div style={{padding:"8px",background:"#fdf0f0",borderRadius:6,fontSize:11,color:"#904040"}}>{error5}</div>}
                {mode==="ai" && fortune5 && renderFortune(fortune5, futureYears5)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 悩み相談セクション ──────────────────────────────────────────
// 長文を句点ごとに段落化して読みやすくする
function formatLongText(text, gap = 8) {
  if (!text) return null;
  const sentences = String(text).split(/(?<=[。！？])/).filter(s => s.trim());
  if (sentences.length <= 1) return text;
  return sentences.map((s, i) => (
    <div key={i} style={{marginBottom: i < sentences.length - 1 ? gap : 0}}>{s.trim()}</div>
  ));
}

const CATEGORIES = [
  {id:"health", label:"🫀 健康・体調", color:"#e05050"},
  {id:"work",   label:"💼 仕事・キャリア", color:"#5080c0"},
  {id:"love",   label:"💕 恋愛・結婚", color:"#c05080"},
  {id:"money",  label:"💰 お金・財運", color:"#c09020"},
  {id:"other",  label:"🌿 その他", color:"#508050"},
];

function SoudanSection({result, globalApiKey, setGlobalApiKey}) {
  const [category, setCategory] = React.useState("health");
  const [text, setText] = React.useState("");
  const [answer, setAnswer] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const apiKey = globalApiKey;
  const setApiKey = setGlobalApiKey;

  const cy = new Date().getFullYear();
  const curDaiun = result.daiun.list.find((d,i,arr)=>d.startYear<=cy&&(!arr[i+1]||arr[i+1].startYear>cy));
  const curRyunen = result.ryunen.find(r=>r.year===cy);

  // 今年の五行バランス（命式＋大運＋年運）
  const nowEc = {...result.ec};
  const nowStemEc = {...(result.stemEc||{})};
  const nowBranchEc = {...(result.branchEc||{})};
  if(curDaiun){
    nowEc[curDaiun.stemEl]=(nowEc[curDaiun.stemEl]||0)+1;
    nowEc[curDaiun.branchEl]=(nowEc[curDaiun.branchEl]||0)+1;
    nowStemEc[curDaiun.stemEl]=(nowStemEc[curDaiun.stemEl]||0)+1;
    nowBranchEc[curDaiun.branchEl]=(nowBranchEc[curDaiun.branchEl]||0)+1;
  }
  if(curRyunen){
    nowEc[curRyunen.stemEl]=(nowEc[curRyunen.stemEl]||0)+1;
    nowEc[curRyunen.branchEl]=(nowEc[curRyunen.branchEl]||0)+1;
    nowStemEc[curRyunen.stemEl]=(nowStemEc[curRyunen.stemEl]||0)+1;
    nowBranchEc[curRyunen.branchEl]=(nowBranchEc[curRyunen.branchEl]||0)+1;
  }

  // 欠けている五行
  const missing = ["木","火","土","金","水"].filter(el=>(result.ec[el]||0)===0);
  // 強すぎる五行（3以上）
  const strong = ["木","火","土","金","水"].filter(el=>(result.ec[el]||0)>=3);

  const buildPrompt = () => {
    const dayEl = result.pillars.day.stemEl;
    const youjin = result.youjin;
    const daiunStr = curDaiun ? `${curDaiun.stem}${curDaiun.branch}（${curDaiun.startYear}年〜、${curDaiun.stemEl}${curDaiun.branchEl}）` : "不明";
    const ryunenStr = curRyunen ? `${curRyunen.stem}${curRyunen.branch}年（${curRyunen.stemEl}${curRyunen.branchEl}）` : "不明";
    const ecStr = ["木","火","土","金","水"].map(el=>`${el}:${result.ec[el]||0}`).join("、");
    const nowEcStr = ["木","火","土","金","水"].map(el=>`${el}:${nowEc[el]||0}`).join("、");
    const catLabel = CATEGORIES.find(c=>c.id===category)?.label || "";

    return `あなたは四柱推命の専門家です。以下の命式データと相談内容に基づき、具体的なアドバイスをしてください。

【命式情報】
- 氏名：${result.name}様
- 生年月日：${result.bd}　性別：${result.gender==="male"?"男性":"女性"}
- 日干：${result.pillars.day.stem}（${dayEl}）
- 五行バランス（命式）：${ecStr}
- 五行バランス（今年・命式＋大運＋年運）：${nowEcStr}
- 欠けている五行：${missing.length>0?missing.join("・"):"なし"}
- 強すぎる五行：${strong.length>0?strong.join("・"):"なし"}
- 身強・身弱：${youjin?.bodyStr||""}（比印${youjin?.ratio||0}%）
- 用神：${youjin?.youjinEl||""}、喜神：${youjin?.kijiinEl||""}
- 現在の大運：${daiunStr}
- 今年の年運：${ryunenStr}

【相談カテゴリ】${catLabel}

【相談内容】
${text}

【回答形式】必ずJSON形式のみで返答してください（前後の説明不要）：
{
  "summary": "命式から見た状況の総括（100字程度）",
  "gogyou_insight": "五行バランスから見た原因・背景（150字程度）",
  "missing_advice": "欠けている・弱い五行を補うアドバイス",
  "strong_advice": "強すぎる五行を鎮めるアドバイス（該当する場合）",
  "foods": ["おすすめ食材1","おすすめ食材2","おすすめ食材3","おすすめ食材4","おすすめ食材5"],
  "places": ["おすすめの場所・方角1","おすすめの場所・方角2","おすすめの場所・方角3"],
  "colors": ["おすすめの色・アイテム1","おすすめの色・アイテム2","おすすめの色・アイテム3"],
  "action": "今すぐできる具体的な行動アドバイス（100字程度）",
  "caution": "注意すべきこと（50字程度）",
  "lucky_element": "今取り入れると良い五行",
  "lucky_direction": "吉方位"
}`;
  };

  const handleSoudan = async () => {
    if (!text.trim() || !apiKey.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      let res;
      try {
        res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
          body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:buildPrompt()}]})
        });
      } catch(fetchErr) {
        throw new Error("通信エラー: " + fetchErr.message + "（インターネット接続を確認してください）");
      }
      if (!res.ok) {
        const errText = await res.text().catch(()=>"");
        throw new Error(`APIエラー HTTP ${res.status}: ${errText.slice(0,200)}`);
      }
      const data = await res.json();
      if (data.error) throw new Error("APIエラー: " + (data.error.message||JSON.stringify(data.error)));
      const txt = data.content?.map(c=>c.text||"").join("")||"";
      if (!txt) throw new Error("AIからの応答が空でした");
      const clean = txt.replace(/```json[\s\S]*?```/g,x=>x.slice(7,-3)).replace(/```/g,"").trim();
      const m = clean.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("JSON解析失敗。AIの応答: " + clean.slice(0,100));
      setAnswer(JSON.parse(m[0]));
    } catch(e) {
      setError(e.message || String(e));
    }
    setLoading(false);
  };

  const EL_COLOR = {木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#b0b8d0",水:"#6ab0e8"};
  const cat = CATEGORIES.find(c=>c.id===category);

  return (
    <div style={{padding:"16px"}}>
      {/* 今年の五行バランス */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,color:"#5a3a1a",fontWeight:700,marginBottom:8,letterSpacing:1}}>▌ 今年（{cy}年）の五行バランス　命式＋大運＋年運</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"flex-start"}}>
          <GogyouCircle ec={nowEc} stemEc={nowStemEc} branchEc={nowBranchEc} extraEc={{木:0,火:0,土:0,金:0,水:0}} dayEl={result.pillars.day.stemEl}
            gokaInfo={(()=>{const GCOLS={木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};const info=[];Object.entries(result.gokaMoveStem||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"stem"}));Object.entries(result.gokaMoveBranch||{}).forEach(([i,{from,to}])=>info.push({color:GCOLS[from],toEl:to,type:"branch"}));return info;})()}
          />
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {["木","火","土","金","水"].map(el=>{
                const cnt=nowEc[el]||0, c=EC[el];
                return <div key={el} style={{padding:"6px 12px",borderRadius:8,background:cnt===0?"#f0f0f0":c.bg,border:`1px solid ${cnt===0?"#ccc":c.bd}`,textAlign:"center",minWidth:50,opacity:cnt===0?0.5:1}}>
                  <div style={{fontSize:18,fontWeight:700,color:cnt===0?"#aaa":c.tx}}>{el}</div>
                  <div style={{fontSize:11,color:cnt===0?"#aaa":c.tx}}>{cnt}</div>
                  {cnt===0&&<div style={{fontSize:9,color:"#e05050",fontWeight:700}}>欠</div>}
                </div>;
              })}
            </div>
            {missing.length>0&&<div style={{fontSize:11,color:"#c04040",background:"#fdf0f0",borderRadius:6,padding:"6px 10px",marginBottom:6}}>
              ⚠️ 欠けている五行：<strong>{missing.join("・")}</strong>
            </div>}
            {strong.length>0&&<div style={{fontSize:11,color:"#805010",background:"#fdf5e0",borderRadius:6,padding:"6px 10px"}}>
              ⚡ 強すぎる五行：<strong>{strong.join("・")}</strong>
            </div>}
          </div>
        </div>
      </div>

      {/* カテゴリ選択 */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,color:"#5a3a1a",fontWeight:700,marginBottom:8,letterSpacing:1}}>▌ 相談カテゴリ</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setCategory(c.id)}
              style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${category===c.id?c.color:"#ccc"}`,background:category===c.id?c.color+"22":"#fdf8f2",color:category===c.id?c.color:"#8a7a60",fontSize:12,fontWeight:category===c.id?700:400,cursor:"pointer"}}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 相談内容入力 */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,color:"#5a3a1a",fontWeight:700,marginBottom:6,letterSpacing:1}}>▌ 今の悩み・相談内容</div>
        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="例：最近心臓がバクバクして不安が続いています。何か改善策はありますか？"
          style={{width:"100%",height:100,padding:"10px 12px",borderRadius:8,border:"1px solid #c4a070",fontSize:13,background:"#fdf5e8",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",lineHeight:1.7}}
        />
      </div>

      {/* APIキー */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:"#7a6a55",marginBottom:4}}>Anthropic APIキー {apiKey.trim()&&<span style={{color:"#4a9a4a",fontSize:10}}>✓ 入力済み</span>}</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-ant-..."
            style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${apiKey.trim()?"#90c090":"#c4a070"}`,fontSize:12,background:"#fdf5e8",boxSizing:"border-box"}}/>
          {apiKey.trim()&&<button onClick={()=>setApiKey("")} style={{padding:"6px 10px",borderRadius:8,border:"1px solid #e0a0a0",background:"transparent",color:"#c06060",fontSize:11,cursor:"pointer"}}>クリア</button>}
        </div>
      </div>

      {/* 送信ボタン */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <button onClick={handleSoudan} disabled={!text.trim()||!apiKey.trim()||loading}
          style={{background:(!text.trim()||!apiKey.trim()||loading)?"#ccc":"linear-gradient(135deg,#c88a2a,#e8a030)",border:"none",borderRadius:24,padding:"12px 40px",color:"#fff",fontSize:14,fontWeight:700,cursor:(!text.trim()||!apiKey.trim()||loading)?"not-allowed":"pointer",letterSpacing:2}}>
          {loading?"🔮 鑑定中...":"✦ 四柱推命で相談する ✦"}
        </button>
      </div>

      {error&&<div style={{padding:"10px 14px",background:"#fdf0f0",borderRadius:8,fontSize:12,color:"#904040",marginBottom:12}}>{error}</div>}

      {/* 回答表示 */}
      {answer&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* 総括 */}
          <div style={{padding:"16px 18px",background:"linear-gradient(135deg,#fdf5e8,#f5ede0)",border:"1px solid #d4b896",borderRadius:10}}>
            <div style={{fontSize:12,color:"#8a6a3a",fontWeight:700,letterSpacing:1,marginBottom:10}}>◈ 命式から見た状況</div>
            <div style={{fontSize:14,lineHeight:2.0,color:"#3a2818",letterSpacing:"0.02em"}}>{formatLongText(answer.summary, 10)}</div>
          </div>

          {/* 五行インサイト */}
          <div style={{padding:"16px 18px",background:"#fdf8f2",border:"1px solid #d4b89688",borderRadius:10}}>
            <div style={{fontSize:12,color:"#8a6a3a",fontWeight:700,letterSpacing:1,marginBottom:10}}>◈ 五行バランスから見た原因</div>
            <div style={{fontSize:14,lineHeight:2.0,color:"#3a2818",letterSpacing:"0.02em"}}>{formatLongText(answer.gogyou_insight, 10)}</div>
          </div>

          {/* 欠け・強すぎアドバイス */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
            {answer.missing_advice&&<div style={{padding:"14px 16px",background:"#f0f8ff",border:"1px solid #90c0e088",borderRadius:10}}>
              <div style={{fontSize:12,color:"#3070a0",fontWeight:700,marginBottom:10}}>💧 不足を補うアドバイス</div>
              <div style={{fontSize:13,lineHeight:1.95,color:"#3a2818",letterSpacing:"0.02em"}}>{formatLongText(answer.missing_advice, 8)}</div>
            </div>}
            {answer.strong_advice&&<div style={{padding:"14px 16px",background:"#fff8f0",border:"1px solid #e0a06088",borderRadius:10}}>
              <div style={{fontSize:12,color:"#a06020",fontWeight:700,marginBottom:10}}>⚡ 強すぎる気を鎮めるアドバイス</div>
              <div style={{fontSize:13,lineHeight:1.95,color:"#3a2818",letterSpacing:"0.02em"}}>{formatLongText(answer.strong_advice, 8)}</div>
            </div>}
          </div>

          {/* 食材・場所・色 カード */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            <div style={{padding:"12px 14px",background:"#f5fdf0",border:"1px solid #90c08088",borderRadius:10}}>
              <div style={{fontSize:11,color:"#408040",fontWeight:700,marginBottom:8}}>🥗 おすすめ食材</div>
              {(answer.foods||[]).map((f,i)=><div key={i} style={{fontSize:12,color:"#3a5a3a",padding:"3px 0",borderBottom:"1px solid #c0e0b088",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,color:"#80b080",fontWeight:700}}>{i+1}</span>{f}
              </div>)}
            </div>
            <div style={{padding:"12px 14px",background:"#f0f5ff",border:"1px solid #8090d088",borderRadius:10}}>
              <div style={{fontSize:11,color:"#404080",fontWeight:700,marginBottom:8}}>🗺️ おすすめの場所・方角</div>
              {(answer.places||[]).map((p,i)=><div key={i} style={{fontSize:12,color:"#3a3a5a",padding:"3px 0",borderBottom:"1px solid #c0c0e088",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:16}}>{["🌊","🌿","⛩️"][i]||"✦"}</span>{p}
              </div>)}
            </div>
            <div style={{padding:"12px 14px",background:"#fdf5ff",border:"1px solid #c090d088",borderRadius:10}}>
              <div style={{fontSize:11,color:"#804090",fontWeight:700,marginBottom:8}}>🎨 おすすめの色・アイテム</div>
              {(answer.colors||[]).map((c,i)=><div key={i} style={{fontSize:12,color:"#5a3a5a",padding:"3px 0",borderBottom:"1px solid #d0b0e088",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:16}}>{["🔵","🟣","⚪"][i]||"✦"}</span>{c}
              </div>)}
            </div>
          </div>

          {/* 吉方位・ラッキー五行 */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {answer.lucky_element&&<div style={{flex:1,minWidth:120,padding:"10px 14px",borderRadius:10,background:(EC[answer.lucky_element]?.bg)||"#fdf8f2",border:`1px solid ${(EC[answer.lucky_element]?.bd)||"#c4a070"}`,textAlign:"center"}}>
              <div style={{fontSize:10,color:"#8a7a60",marginBottom:4}}>ラッキー五行</div>
              <div style={{fontSize:28,fontWeight:700,color:(EC[answer.lucky_element]?.tx)||"#5a3a1a"}}>{answer.lucky_element}</div>
            </div>}
            {answer.lucky_direction&&<div style={{flex:2,minWidth:180,padding:"10px 14px",borderRadius:10,background:"#fdf5e8",border:"1px solid #d4b896",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#8a7a60",marginBottom:4}}>吉方位</div>
              <div style={{fontSize:16,fontWeight:700,color:"#5a3a1a"}}>{answer.lucky_direction}</div>
            </div>}
          </div>

          {/* 行動アドバイス・注意 */}
          <div style={{padding:"16px 18px",background:"linear-gradient(135deg,#fdf5e8,#fdf8f2)",border:"1px solid #d4b896",borderRadius:10,borderLeft:"4px solid #e8a030"}}>
            <div style={{fontSize:12,color:"#8a6a3a",fontWeight:700,marginBottom:10}}>✦ 今すぐできる行動アドバイス</div>
            <div style={{fontSize:14,lineHeight:2.0,color:"#3a2818",letterSpacing:"0.02em",marginBottom:12}}>{formatLongText(answer.action, 10)}</div>
            {answer.caution&&<div style={{fontSize:12,color:"#904040",background:"#fdf0f0",borderRadius:6,padding:"8px 12px",lineHeight:1.7}}>⚠️ 注意：{answer.caution}</div>}
          </div>

          {/* 再相談ボタン */}
          <div style={{textAlign:"center"}}>
            <button onClick={()=>setAnswer(null)} style={{padding:"8px 20px",borderRadius:8,background:"transparent",border:"1px solid #c4a070",color:"#8a6a3a",cursor:"pointer",fontSize:11}}>🔄 別の相談をする</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── メインアプリ ────────────────────────────────────────────────
const SS_DEF = {
  "天乙貴人":{col:"#f0c060",kw:"最強の吉星",txt:"困難な場面で貴人の助けが現れる。対人運・出世運を高め、人生の難局を乗り越える力を与える。"},
  "文昌":{col:"#80c0f0",kw:"学問・才能",txt:"知性と文才に恵まれ、学業・試験・芸術で才能を発揮する。"},
  "学堂":{col:"#a0c8f0",kw:"学習・向上",txt:"学習能力が高く、知識の吸収が早い。資格取得・学術研究に向いている。"},
  "驛馬":{col:"#a0e0b0",kw:"変動・移動",txt:"移動・転勤・海外・変化を示す星。活動的で行動力があるが、落ち着きのなさにも注意。"},
  "禄神":{col:"#d4a84b",kw:"財禄・実力",txt:"財運・実力・地位を示し、努力が実を結びやすい。"},
  "将星":{col:"#c0c050",kw:"権力・指導力",txt:"権力・リーダーシップを示す。組織の中心的存在となる力がある。"},
  "桃花":{col:"#f080a0",kw:"魅力・人気",txt:"異性や人を引き付ける魅力を示す吉星。"},
  "紅艶":{col:"#e060c0",kw:"色気・艶やかさ",txt:"強い色気と艶やかさを示す。異性関係が活発になりやすい。"},
  "羊刃":{col:"#e06060",kw:"鋭気・過剛",txt:"強烈なエネルギーと決断力を持つが、過剛になりやすく事故・争いのリスクがある。"},
  "弔客":{col:"#9090b0",kw:"孤独・悲哀",txt:"悲しみや喪失、孤独感を示す凶煞。心の安定を大切に。"},
  "喪門":{col:"#8080a0",kw:"悲喪・衰退",txt:"喪失・悲しみ・衰退を示す凶煞。周囲のサポートを大切に。"},
  "孤辰":{col:"#b0a0d0",kw:"孤独・独立",txt:"孤立しやすい傾向。独立心が強く、単独で成果を上げる力を持つ。"},
  "亡神":{col:"#c08090",kw:"消耗・散財",txt:"努力が空回りしやすく、財やエネルギーが消耗する傾向。"},
  "劫煞":{col:"#d09060",kw:"事故・口禍",txt:"突然の事故やトラブル、言葉による災難を示す凶煞。"},
  "空亡":{col:"#888888",kw:"空虚・停滞",txt:"物事が思うように進まない時期の象徴。内面の充実に向けることで吉に転じやすい。"},
  "元辰":{col:"#b0c090",kw:"感情・執着",txt:"感情的な執着や変動を示し、対人関係での摩擦に注意が必要。"},
};
const KEI_DEF = {col:"#e0a040",kw:"摩擦・障害",txt:"対人関係での摩擦や法的トラブル・健康問題を示す。意識的な配慮でリスクを軽減できる。"};

// ─── MBTI（別レイヤー：四柱推命とは独立した西洋心理学の参考データ） ────────────
const MBTI_TYPES = [
  {code:"INTJ", name:"建築家",        group:"分析家", desc:"想像力豊か・戦略的思考・独立心が強い"},
  {code:"INTP", name:"論理学者",      group:"分析家", desc:"革新的な発明家・知識欲・論理的"},
  {code:"ENTJ", name:"指揮官",        group:"分析家", desc:"大胆・想像力豊か・強い意志のリーダー"},
  {code:"ENTP", name:"討論者",        group:"分析家", desc:"賢く好奇心旺盛・知的挑戦を好む"},
  {code:"INFJ", name:"提唱者",        group:"外交官", desc:"静かで神秘的・理想主義・洞察力"},
  {code:"INFP", name:"仲介者",        group:"外交官", desc:"詩的で親切・利他的・価値観で動く"},
  {code:"ENFJ", name:"主人公",        group:"外交官", desc:"カリスマ性・人を感化・聞き上手"},
  {code:"ENFP", name:"運動家",        group:"外交官", desc:"情熱的・創造的・社交的"},
  {code:"ISTJ", name:"管理者",        group:"番人",   desc:"実用的・事実重視・信頼性が高い"},
  {code:"ISFJ", name:"擁護者",        group:"番人",   desc:"献身的で温かい・守る人・思慮深い"},
  {code:"ESTJ", name:"幹部",          group:"番人",   desc:"優れた管理者・伝統重視・実行力"},
  {code:"ESFJ", name:"領事官",        group:"番人",   desc:"思いやり・社交的・人気者"},
  {code:"ISTP", name:"巨匠",          group:"探検家", desc:"大胆で実用的・実験家・職人気質"},
  {code:"ISFP", name:"冒険家",        group:"探検家", desc:"柔軟で魅力的・芸術家・繊細"},
  {code:"ESTP", name:"起業家",        group:"探検家", desc:"賢くエネルギッシュ・認識力・実践派"},
  {code:"ESFP", name:"エンターテイナー",group:"探検家", desc:"自発的・社交的・楽しさを愛する"},
];
const MBTI_GROUPS = {
  "分析家":{col:"#7a6acf", emoji:"🟣"},
  "外交官":{col:"#3a9a6a", emoji:"🟢"},
  "番人":  {col:"#3a7acf", emoji:"🔵"},
  "探検家":{col:"#c08a30", emoji:"🟡"},
};
// 各タイプの詳細性格説明（12項目：strengths, weaknesses, career, relation, money, stress, love, parent, growth, communication, shadow, famous）
const MBTI_DETAILS = {
  INTJ: {
    strengths:"戦略的思考・独立心・決断力・長期視点・知的探究心・効率追求・自己研鑽",
    weaknesses:"他人の感情を軽視しがち・頑固・批判的・完璧主義・社交が苦手",
    career:"研究者／戦略コンサル／エンジニア／経営者／投資家／システム設計者",
    relation:"少数の深い関係を好む。感情表現は不器用だが信頼は厚い。雑談より本質を語りたい",
    money:"長期投資・資産形成に向く。費用対効果を緻密に試算し、無駄遣いは少ない",
    stress:"一人になって戦略を立て直すと回復する。睡眠と読書が一番の薬。共感より解決策を欲しがる",
    love:"理性的に相手を選ぶが、一度決めると深く尽くす。スキンシップより知的な議論で愛を確かめる",
    parent:"子に高い基準を求め、自立を促す。感情面のフォローは意識しないと抜けがち",
    growth:"若い頃は理屈っぽく孤立しがちだが、中年以降に共感力が育って円熟する。40代で大きく開花",
    communication:"要点を端的に。前置きや雑談は省きたがる。質問には根拠を求める",
    shadow:"追い詰められると感情を爆発させて人を傷つける。完璧主義が暴走して燃え尽きる",
    famous:"イーロン・マスク／マーク・ザッカーバーグ／ニーチェ／村上春樹"
  },
  INTP: {
    strengths:"論理的・独創的・知的好奇心旺盛・客観的・柔軟・複雑な問題を解く力",
    weaknesses:"感情表現が苦手・優柔不断・現実離れ・先延ばし・社交儀礼が面倒",
    career:"哲学者／研究者／プログラマー／数学者／理論物理／作家",
    relation:"理屈で考えがち。深い議論で繋がる。表面的な付き合いを避ける",
    money:"理論研究に投資、実利は二の次。お金そのものへの関心は薄め",
    stress:"思考の世界に潜るほど回復。締切と感情の強要から逃げたくなる",
    love:"知的に対等な相手を求める。感情表現がぎこちないが、内心はロマンチスト",
    parent:"子の好奇心を尊重し、自由に育てる。一方で家事や規律づくりは苦手",
    growth:"20代は理論オタクで終わりがちだが、30代後半から実装力がつき社会と繋がる",
    communication:"逆説や仮説で考えを進める。雑談で結論を急かされるとフリーズする",
    shadow:"極限ストレス下では感情爆発と自己嫌悪。健康と人間関係を破壊しがち",
    famous:"アインシュタイン／ダーウィン／ビル・ゲイツ／芥川龍之介"
  },
  ENTJ: {
    strengths:"リーダーシップ・効率重視・決断力・自信・統率力・先見性・実行力",
    weaknesses:"頑固・せっかち・感情軽視・支配的・部下を追い込みやすい",
    career:"経営者／政治家／弁護士／戦略コンサル／プロジェクト統括",
    relation:"パートナーシップ重視。明確な役割を求める。弱さを見せ合うのが苦手",
    money:"資産運用に強い・大胆な投資・スケール志向",
    stress:"運動・新規プロジェクト立ち上げで発散。立ち止まることが最大のストレス",
    love:"パートナーにも野心と知性を求める。情熱的だが束縛もする",
    parent:"高い期待をかけ厳しく育てる。成功体験を共有することが愛情表現",
    growth:"30代までは仕事一辺倒。40代以降に人間味と柔らかさが加わると最強",
    communication:"結論ファースト。長い説明や言い訳を嫌う。叱責が直球すぎることも",
    shadow:"追い詰められると周囲を切り捨て、孤独な独裁者になる",
    famous:"スティーブ・ジョブズ／ナポレオン／マーガレット・サッチャー／孫正義"
  },
  ENTP: {
    strengths:"機知に富む・好奇心旺盛・適応力・独創的・話術・即興力",
    weaknesses:"飽きっぽい・論争好き・計画性低い・継続力弱・人を煽る癖",
    career:"起業家／コンサル／発明家／弁護士／クリエイティブ・ディレクター",
    relation:"刺激のある関係を好む。退屈を嫌う。議論を遊びと捉える",
    money:"新規事業・ベンチャー投資。ハイリスク・ハイリターンを好む",
    stress:"新しい刺激と話し相手で回復。ルーティンが最大の毒",
    love:"刺激的な相手を選ぶ。マンネリ化すると一気に冷める",
    parent:"子を遊び相手として楽しむ。一方で躾や継続的なルールづくりは苦手",
    growth:"若い頃は風呂敷を広げるだけ。30代後半に絞り込みと完遂力が加わると花開く",
    communication:"アイデアの連打と挑発で議論を駆動。聞き役にはなりにくい",
    shadow:"追い詰められると陰謀論的になり、攻撃的な皮肉屋に変貌",
    famous:"レオナルド・ダ・ヴィンチ／トーマス・エジソン／坂本龍馬／ホリエモン"
  },
  INFJ: {
    strengths:"洞察力・共感力・理想主義・計画的・粘り強い・人の本質を見抜く",
    weaknesses:"完璧主義・燃え尽きやすい・他人に厳しい・抱え込み・繊細すぎる",
    career:"カウンセラー／作家／教師／心理学者／非営利／コーチ",
    relation:"深い精神的繋がりを重視。少数精鋭。表面的な人間関係に消耗する",
    money:"理念に合う使い方を重視。寄付・社会貢献に使うと満たされる",
    stress:"一人時間と自然・読書で回復。要求過多な人間関係から離れる必要がある",
    love:"運命的・魂の繋がりを求める。理想が高すぎて選ばないことも",
    parent:"子の心の機微を深く理解する。一方で過保護や期待過剰になりやすい",
    growth:"20代は社会との折り合いで悩む。30代後半から信念を貫きながら現実適応",
    communication:"婉曲・象徴的に話す。直球の批判で深く傷つく",
    shadow:"追い詰められると突然関係を断ち切る（door slam）。心身共に崩れる",
    famous:"プラトン／マザー・テレサ／ニコール・キッドマン／宮崎駿"
  },
  INFP: {
    strengths:"理想主義・共感力・創造性・柔軟性・誠実・価値観に忠実",
    weaknesses:"現実逃避・内向的すぎる・自己批判・優柔不断・対立に弱い",
    career:"作家／芸術家／カウンセラー／非営利／編集者／翻訳者",
    relation:"深く誠実な関係。価値観の一致を最重視。広く浅い付き合いは消耗する",
    money:"理想のための支出を惜しまない・倹約も得意。お金より意味を重視",
    stress:"創作・自然・音楽で回復。攻撃的な環境からは即離脱が必要",
    love:"運命の人を求める。一度愛したら深く長く想い続ける",
    parent:"子の個性を最大限尊重する。一方で躾や厳しさが苦手で甘くなる",
    growth:"若い頃は内向と理想で停滞しがち。30代以降に表現の場を持つと開花",
    communication:"比喩や物語で語る。直接の対立は避け、後で消耗する",
    shadow:"自己嫌悪と無力感に飲まれて鬱状態に。世界を呪う偏執に陥ることも",
    famous:"宮沢賢治／ヴァージニア・ウルフ／ジョニー・デップ／太宰治"
  },
  ENFJ: {
    strengths:"カリスマ性・利他的・信頼性・感受性・指導力・人を引き出す力",
    weaknesses:"自己犠牲・批判に弱い・決断が遅い・他人に依存・お節介",
    career:"教師／政治家／人事／コーチ／医療職／NPO代表",
    relation:"相手を支え育てる。社交的だが、本音は限られた人にしか出さない",
    money:"人のための投資・教育費が膨らみがち。自分への支出は遅れる",
    stress:"信頼できる人に話を聞いてもらうと回復。一人になりすぎると萎える",
    love:"パートナーを成長させる愛し方。相手の幸福が自分の幸福",
    parent:"子に深く関わり、可能性を最大化しようとする。期待過剰には注意",
    growth:"若い頃から信頼を集めるが、40代で自己ケアを覚えると本格的に伸びる",
    communication:"傾聴と励ましが上手。一方、対立場面では感情が先に出る",
    shadow:"自己犠牲が暴走して燃え尽き。人間不信に陥り急に冷たくなる",
    famous:"バラク・オバマ／キング牧師／オプラ・ウィンフリー／田中将大"
  },
  ENFP: {
    strengths:"情熱的・創造的・社交的・楽観的・人を巻き込む・直感の閃き",
    weaknesses:"集中力散漫・ストレスに弱い・感情的・計画性低・浮き沈み激しい",
    career:"起業家／コーチ／ジャーナリスト／クリエイター／企画職",
    relation:"情熱的・ロマンチック。多くの人と繋がる。深い話題と笑いの両方を欲する",
    money:"使うのが好き・貯金は苦手。経験への投資は惜しまない",
    stress:"新しい人・場所・アイデアで回復。閉塞感が最大の敵",
    love:"恋愛は燃え上がりやすく、燃え尽きやすい。長続きには意識的な努力が必要",
    parent:"子と全力で遊ぶ。可能性を信じる一方、ルール作りや継続には弱い",
    growth:"30代までは熱中と挫折を繰り返す。40代で一つの軸が定まると一気に花開く",
    communication:"感情と情景で語る。共感ベース。ただし議論で論点がブレやすい",
    shadow:"極限では自分を見失い、依存的になる。逆に攻撃的に人を切り捨てる",
    famous:"ロビン・ウィリアムス／マーク・トウェイン／ウォルト・ディズニー／木村拓哉"
  },
  ISTJ: {
    strengths:"責任感・実直・組織的・忍耐強い・誠実・有言実行・記憶力",
    weaknesses:"頑固・変化を嫌う・感情表現苦手・融通きかない・前例主義",
    career:"会計士／公務員／管理職／法務／軍人／品質管理",
    relation:"安定志向・献身的。義理堅い。長く付き合うほど信頼が深まる",
    money:"堅実な貯蓄・伝統的投資。リスクは慎重に避ける",
    stress:"ルーティンと予定通りの達成で回復。突発と曖昧さで疲弊する",
    love:"地味だが深い愛情。記念日や約束をきっちり守る形で愛を示す",
    parent:"規律と責任を重視して育てる。子の感情表現を引き出すのは苦手",
    growth:"若い頃から実直に成果を出す。中年以降に柔軟性が加わると組織の柱に",
    communication:"事実と数字で話す。冗談や曖昧表現は苦手",
    shadow:"極限では一切の柔軟性を失い、頑迷な独裁者に。家族を息苦しくする",
    famous:"ジョージ・ワシントン／クイーン・エリザベス2世／渋沢栄一／イチロー"
  },
  ISFJ: {
    strengths:"献身的・温かい・忠実・実用的・記憶力・面倒見の良さ",
    weaknesses:"自己犠牲・変化を嫌う・批判に弱い・抱え込み・受け身",
    career:"看護師／教師／秘書／社会福祉／保育士／事務職",
    relation:"献身的・家庭重視。相手を守る。広い人脈より深い数人",
    money:"堅実な家計管理・家族のための貯蓄。自分への支出は最後",
    stress:"親しい人とのお茶・家事の整理整頓で回復。批判が一番の毒",
    love:"控えめだが深く長い愛情。日常の細やかな世話で愛を伝える",
    parent:"子を守り育てる典型的な世話役の親。子の自立を促すのは少し苦手",
    growth:"若い頃は脇役に徹するが、40代以降に経験が活きて頼れる存在に",
    communication:"穏やかで聞き上手。意見の主張は控えがちで誤解されることも",
    shadow:"我慢を溜め込んで爆発、または静かに関係を断つ。心身の不調に出やすい",
    famous:"マザー・テレサ／ローザ・パークス／ケイト・ミドルトン／黒柳徹子"
  },
  ESTJ: {
    strengths:"実行力・組織能力・誠実・伝統的・リーダーシップ・段取り力",
    weaknesses:"頑固・感情軽視・批判的・支配的・新しい価値観に弱い",
    career:"経営者／軍人／警察官／公務員／プロジェクト・マネージャー",
    relation:"伝統的関係・安定志向。家族や仲間を統率する家長型",
    money:"計画的な資産形成。借金と無駄遣いを嫌う",
    stress:"仕事と運動で発散。曖昧な仕事と感情論で疲弊する",
    love:"献身と責任で愛を示す。ロマンチックな表現は苦手",
    parent:"明確なルールと役割で育てる。子の感情に寄り添うのは意識が必要",
    growth:"若い頃から実績を積む。50代以降に若手の感情を理解できると名将に",
    communication:"指示・命令調が出やすい。傾聴と褒める癖を意識すると◎",
    shadow:"極限では権威に固執し、家族や部下を切り捨てる",
    famous:"ヘンリー・フォード／コリン・パウエル／松下幸之助／長嶋茂雄"
  },
  ESFJ: {
    strengths:"思いやり・社交的・献身的・責任感・調和的・ホスピタリティ",
    weaknesses:"批判に弱い・変化嫌う・他人に依存・過剰な気配り・噂好き",
    career:"教師／医療／ホスピタリティ／販売／人事／カスタマーサクセス",
    relation:"献身的・社交的。家族・友人を大切に。コミュニティの中心になる",
    money:"社交費・家族費が多め。プレゼントや人付き合いに使う",
    stress:"親しい人との会話と感謝の言葉で回復。孤立が最大の敵",
    love:"献身的で世話焼き。記念日・家族行事を大切にする",
    parent:"温かく包み込む親。一方で子離れが遅れがちで干渉しやすい",
    growth:"若い頃から人気者。40代以降に自己主張ができるとさらに伸びる",
    communication:"褒め上手・聞き上手。一方で陰の噂話が出やすいので注意",
    shadow:"批判に晒されると被害者意識に陥り、関係を切る／陰口に走る",
    famous:"ジェニファー・ガーナー／テイラー・スウィフト／天皇陛下／向井理"
  },
  ISTP: {
    strengths:"実用的・論理的・冷静・適応力・手先器用・危機対応力",
    weaknesses:"感情を表現しない・コミット嫌い・退屈嫌い・長期計画が苦手",
    career:"技術者／職人／パイロット／メカニック／消防／救急／プログラマー",
    relation:"自由を尊重。べたべたしない。共通の趣味で繋がる",
    money:"道具・趣味への投資。お金そのものより使い道が大事",
    stress:"一人で手を動かす作業で回復。感情の押し付けで疲弊する",
    love:"行動で示す愛。ロマンチックな言葉は苦手。空間と自由を尊重する関係",
    parent:"子に実用スキルを教える。一方で感情面のケアは抜けがち",
    growth:"若い頃は職人気質で孤立しがち。40代以降に教える役回りで開花",
    communication:"簡潔・実用的。前置きや感情表現は省く",
    shadow:"極限ではキレて暴言・関係断絶。長期不安は爆発に変わる",
    famous:"クリント・イーストウッド／ブルース・リー／ハリソン・フォード／本田宗一郎"
  },
  ISFP: {
    strengths:"芸術的・繊細・柔軟・楽観的・自然体・五感が鋭い",
    weaknesses:"計画性低・対立回避・自己批判・先延ばし・自己主張が弱い",
    career:"芸術家／デザイナー／看護師／音楽家／料理人／フォトグラファー",
    relation:"感性で繋がる。穏やかな関係。深く知り合うには時間が必要",
    money:"美しいもの・体験に使う。貯蓄より「今の充実」を選ぶ",
    stress:"自然・芸術・動物と過ごす時間で回復。プレッシャーで一気に逃避",
    love:"穏やかで控えめ。行動と贈り物で愛を示す。激しい愛憎は苦手",
    parent:"子の感性を尊重する優しい親。規律を作るのは苦手",
    growth:"若い頃は迷いが多い。30代後半に表現の場と仲間ができると花開く",
    communication:"控えめ・繊細。本音は信頼した人にしか出さない",
    shadow:"極限では完全に閉じこもる。自己破壊的行動に出ることもある",
    famous:"マイケル・ジャクソン／オードリー・ヘプバーン／ボブ・ディラン／松任谷由実"
  },
  ESTP: {
    strengths:"エネルギッシュ・現実的・社交的・行動力・状況判断・度胸",
    weaknesses:"忍耐力低・リスク取りすぎ・感情軽視・短期的・衝動的",
    career:"起業家／営業／エンターテイナー／救急／プロスポーツ／トレーダー",
    relation:"刺激重視・楽しい時間を共有。深い感情の話は照れる",
    money:"派手な投資・即決即断。儲けるのも使うのも早い",
    stress:"スポーツ・スリル・新しい場所で発散。退屈が最大の敵",
    love:"情熱的でストレートな愛。マンネリ化を恐れる",
    parent:"子と全力で遊び、現実的なスキルを教える。長期計画は苦手",
    growth:"若い頃は破天荒だが、40代以降に経験を体系化できると指導者に",
    communication:"率直・即興的・身振り手振り。深掘りは苦手",
    shadow:"極限では自滅的にリスクを取り、大損や自暴自棄に走る",
    famous:"マドンナ／ドナルド・トランプ／アーネスト・ヘミングウェイ／明石家さんま"
  },
  ESFP: {
    strengths:"社交的・楽天的・寛容・実用的・場を盛り上げる・五感の鋭さ",
    weaknesses:"計画性低・長期視点弱・批判に弱い・衝動的・刺激依存",
    career:"エンターテイナー／教師／営業／観光業／飲食／販売",
    relation:"楽しい関係・社交的。みんなの中心で輝く",
    money:"今を楽しむ支出・貯金苦手。プレゼントや旅行に惜しまず使う",
    stress:"友人との時間・パーティ・新しい体験で回復。孤独と批判が毒",
    love:"明るく情熱的。スキンシップと共有体験で愛を示す",
    parent:"子と一緒に楽しむ親。一方で躾と将来設計は苦手",
    growth:"若い頃は刹那的だが、40代以降に責任を引き受けると深みが出る",
    communication:"明るく開けっ広げ。重い話題は雰囲気で和らげる",
    shadow:"批判で簡単に潰れて自暴自棄に。逃避と享楽に走る",
    famous:"マリリン・モンロー／エルヴィス・プレスリー／渡辺直美／明石家さんま"
  },
};

// -A型と-T型の解説（性格識別子）
const AT_DETAILS = {
  A: {
    name: "自己主張型（Assertive）",
    color: "#3a7a3a",
    bg: "#eef5ee",
    summary: "自信があり、ストレス耐性が高い。失敗を引きずらず前向きに動ける。",
    strengths: "自尊心が安定／決断が速い／批判に強い／楽観的／立ち直りが早い",
    weaknesses: "自信過剰になりやすい／他人の慎重さを軽視／反省が浅い／繊細な感情の機微を見落とす",
    stress: "ストレス自体を感じにくいタイプ。気付かないうちに周囲に圧をかけている可能性に注意",
    advice: "自分の楽観が他人にとってはプレッシャーになることを意識。慎重派の意見を意図的に取り入れる",
  },
  T: {
    name: "慎重型（Turbulent）",
    color: "#7a5acf",
    bg: "#f0eef5",
    summary: "完璧主義・心配性・自己批判が強め。繊細だがストレスを溜め込みやすい。",
    strengths: "向上心が強い／細部に気付く／共感力が高い／謙虚／品質を追求する",
    weaknesses: "自己批判の暴走／不安に飲まれる／燃え尽きやすい／他人の評価に振り回される",
    stress: "ストレスを敏感に拾うのでケアが不可欠。瞑想・運動・睡眠の優先度を上げる",
    advice: "「今これで十分」と意識的に言葉にする習慣。完璧より完了。比較対象を他人から過去の自分へ",
  },
};

// 命式からMBTIを自動推定（高精度版：蔵干通変・神殺・身強弱を加味、根拠付き）
function estimateMbti(result) {
  if (!result?.ec) return null;
  const ec = result.ec;
  const wood = ec.木 || 0, fire = ec.火 || 0, earth = ec.土 || 0, metal = ec.金 || 0, water = ec.水 || 0;
  const total = wood + fire + earth + metal + water;
  if (total === 0) return null;

  // 天干通変（年月時）と蔵干通変を全部集める
  const dSi = result.pillars?.day?.stemIdx;
  const stemTsuhens = [result.tsuhen?.year, result.tsuhen?.month, result.tsuhen?.hour].filter(Boolean);
  // 蔵干通変（年月日時の蔵干配列から天干→通変を逆引き）
  const zokanTsuhens = [];
  ['year','month','day','hour'].forEach(k=>{
    const z = result.zokan?.[k];
    if (!z) return;
    z.forEach((zStem, idx)=>{
      if (!zStem) return;
      const zSi = STEMS.indexOf(zStem);
      if (zSi < 0 || dSi == null) return;
      const t = getTsuhen(dSi, zSi);
      // メイン蔵干(idx=0)は重み高め、副蔵干(idx=1,2)は控えめ
      zokanTsuhens.push({ tsuhen: t, weight: idx===0 ? 0.6 : 0.3 });
    });
  });
  const countStem = (t) => stemTsuhens.filter(x=>x===t).length;
  const countZokan = (t) => zokanTsuhens.filter(x=>x.tsuhen===t).reduce((s,x)=>s+x.weight,0);
  const c = (t) => countStem(t) + countZokan(t); // 重み付け合算

  // 神殺サマリー（key配列）
  const shinSatsuKeys = Object.keys(result.shinSatsu?.summary || {});
  const hasShin = (name) => shinSatsuKeys.includes(name);

  // 身強弱とratio
  const bodyStr = result.youjin?.bodyStr || "";
  const ratio = result.youjin?.ratio || 50;

  // ── 各軸を「寄与要素のログ」とともに計算 ──
  const reasons = { ie: [], ns: [], tf: [], jp: [], at: [] };
  const add = (axis, value, label) => {
    reasons[axis].push({ value, label });
  };

  // I/E軸：+I（内向）／-E（外向）
  // 五行：水(+I)、木(やや+I)、火(-E)、金(やや-E)
  add('ie', water * 0.8, `水(${water})→内省`);
  add('ie', wood * 0.4, `木(${wood})→自律`);
  add('ie', -fire * 0.9, `火(${fire})→社交`);
  add('ie', -metal * 0.4, `金(${metal})→社会性`);
  // 通変：印星(+I)、官星(-E)、財星(-E)、食神(-E)
  add('ie', c("正印") * 0.8, `正印→内省`);
  add('ie', c("偏印") * 0.7, `偏印→探究`);
  add('ie', -c("正官") * 0.5, `正官→社会性`);
  add('ie', -c("偏官") * 0.7, `偏官→突破`);
  add('ie', -c("偏財") * 0.6, `偏財→社交`);
  add('ie', -c("食神") * 0.5, `食神→表現`);
  // 神殺
  if (hasShin("孤辰") || hasShin("寡宿")) add('ie', 1.5, `孤辰/寡宿→孤独`);
  if (hasShin("驛馬")) add('ie', -1.0, `驛馬→外向`);
  if (hasShin("桃花") || hasShin("紅艶")) add('ie', -0.8, `桃花/紅艶→華やか`);

  // N/S軸：+N（直感）／-S（感覚）
  // 五行：水(+N)、木(+N)、土(-S)、金(やや-S)
  add('ns', water * 0.7, `水(${water})→抽象思考`);
  add('ns', wood * 0.5, `木(${wood})→展開`);
  add('ns', -earth * 0.9, `土(${earth})→現実`);
  add('ns', -metal * 0.5, `金(${metal})→精密`);
  // 通変：印星・傷官・偏印(+N)、財星・正官(-S)
  add('ns', c("正印") * 0.6, `正印→知性`);
  add('ns', c("偏印") * 1.0, `偏印→直感`);
  add('ns', c("傷官") * 0.7, `傷官→閃き`);
  add('ns', -c("正財") * 0.9, `正財→堅実`);
  add('ns', -c("偏財") * 0.6, `偏財→実利`);
  add('ns', -c("正官") * 0.4, `正官→規範`);
  // 神殺
  if (hasShin("文昌") || hasShin("学堂")) add('ns', 0.8, `文昌/学堂→学問`);
  if (hasShin("天乙貴人")) add('ns', 0.5, `天乙貴人→精神性`);

  // T/F軸：+T（思考）／-F（感情）
  // 五行：金(+T)、土(+T)、水(-F)、火(-F)、木(やや-F)
  add('tf', metal * 0.9, `金(${metal})→論理`);
  add('tf', earth * 0.4, `土(${earth})→規律`);
  add('tf', -water * 0.7, `水(${water})→情感`);
  add('tf', -fire * 0.6, `火(${fire})→熱情`);
  add('tf', -wood * 0.3, `木(${wood})→共感`);
  // 通変：官星・比劫(+T)、印星・食神・傷官(-F)
  add('tf', c("偏官") * 0.9, `偏官→克服`);
  add('tf', c("正官") * 0.6, `正官→規律`);
  add('tf', c("比肩") * 0.4, `比肩→自立`);
  add('tf', c("劫財") * 0.3, `劫財→競争`);
  add('tf', -c("食神") * 0.7, `食神→楽しむ`);
  add('tf', -c("正印") * 0.5, `正印→包容`);
  add('tf', -c("偏印") * 0.3, `偏印→直感`);
  // 神殺
  if (hasShin("羊刃")) add('tf', 0.6, `羊刃→剛`);
  if (hasShin("桃花") || hasShin("紅艶")) add('tf', -0.6, `桃花/紅艶→情`);

  // J/P軸：+J（判断・規律）／-P（知覚・自由）
  // 五行：土(+J)、金(+J)、木(-P)、火(-P)、水(やや-P)
  add('jp', earth * 0.9, `土(${earth})→秩序`);
  add('jp', metal * 0.6, `金(${metal})→規範`);
  add('jp', -wood * 0.7, `木(${wood})→伸展`);
  add('jp', -fire * 0.6, `火(${fire})→拡散`);
  add('jp', -water * 0.4, `水(${water})→流動`);
  // 通変：正官・正印・正財(+J)、傷官・食神・偏財(-P)
  add('jp', c("正官") * 1.0, `正官→秩序`);
  add('jp', c("正印") * 0.7, `正印→学問`);
  add('jp', c("正財") * 0.6, `正財→計画`);
  add('jp', -c("傷官") * 0.9, `傷官→自由`);
  add('jp', -c("食神") * 0.6, `食神→気楽`);
  add('jp', -c("偏財") * 0.5, `偏財→流動`);
  add('jp', -c("偏官") * 0.3, `偏官→破壊`);
  // 神殺
  if (hasShin("驛馬")) add('jp', -0.7, `驛馬→変化`);
  if (hasShin("禄神") || hasShin("学堂")) add('jp', 0.6, `禄神/学堂→秩序`);

  // A/T軸：+A（自己主張・自信）／-T（慎重・繊細）
  // 身強弱が最大要因
  if (bodyStr.includes("強")) add('at', 2.5, `身強(${ratio}%)→自信`);
  else if (bodyStr.includes("弱")) add('at', -2.5, `身弱(${ratio}%)→繊細`);
  // 通変：比劫・偏官・偏財(+A)、傷官・偏印・印過多(-T)
  add('at', c("比肩") * 0.7, `比肩→自立`);
  add('at', c("劫財") * 0.5, `劫財→競争`);
  add('at', c("偏官") * 0.5, `偏官→突破`);
  add('at', c("偏財") * 0.3, `偏財→豪放`);
  add('at', -c("傷官") * 0.8, `傷官→不安`);
  add('at', -c("偏印") * 0.5, `偏印→過敏`);
  // 印星過多
  const inseiTotal = c("正印") + c("偏印");
  if (inseiTotal >= 3) add('at', -0.8, `印星過多→慎重`);
  // 神殺
  if (hasShin("羊刃") || hasShin("劫煞")) add('at', 0.8, `羊刃/劫煞→剛`);
  if (hasShin("亡神") || hasShin("孤辰") || hasShin("寡宿")) add('at', -0.8, `亡神/孤辰/寡宿→繊細`);
  if (hasShin("空亡")) add('at', -0.6, `空亡→揺らぎ`);

  // 軸ごとの合計
  const sum = (k) => reasons[k].reduce((s,r)=>s+r.value,0);
  const ie = sum('ie'), ns = sum('ns'), tf = sum('tf'), jp = sum('jp'), at = sum('at');

  // トップ3根拠（絶対値の大きい順、寄与方向ごと）
  const topReasons = (k, dir) => reasons[k]
    .filter(r => dir==='+' ? r.value > 0.3 : r.value < -0.3)
    .sort((a,b)=>Math.abs(b.value)-Math.abs(a.value))
    .slice(0,3)
    .map(r => r.label);

  const i = ie >= 0 ? "I" : "E";
  const n = ns >= 0 ? "N" : "S";
  const t = tf >= 0 ? "T" : "F";
  const j = jp >= 0 ? "J" : "P";
  const a = at >= 0 ? "A" : "T";

  return {
    code: `${i}${n}${t}${j}-${a}`,
    base: `${i}${n}${t}${j}`,
    identifier: a,
    scores: { ie:ie.toFixed(1), ns:ns.toFixed(1), tf:tf.toFixed(1), jp:jp.toFixed(1), at:at.toFixed(1) },
    topReasons: {
      ie: i==='I' ? topReasons('ie','+') : topReasons('ie','-'),
      ns: n==='N' ? topReasons('ns','+') : topReasons('ns','-'),
      tf: t==='T' ? topReasons('tf','+') : topReasons('tf','-'),
      jp: j==='J' ? topReasons('jp','+') : topReasons('jp','-'),
      at: a==='A' ? topReasons('at','+') : topReasons('at','-'),
    },
  };
}

// 行ごとの区切り文字（文章系は「。」、リスト系は「・／、」、人名系は「／」）
const MBTI_ROW_SPLIT = {
  '強み': /[・／、]/,
  '弱み': /[・／、]/,
  '向く仕事': /[／・、]/,
  '人間関係': /[。．]/,
  'お金': /[。．]/,
  'ストレス対処': /[。．]/,
  '恋愛・夫婦': /[。．]/,
  '親としての特徴': /[。．]/,
  '成長段階': /[。．]/,
  'コミュニケーション': /[。．]/,
  '追い詰められた時': /[。．]/,
  '似たタイプの人物': /[／]/,
};
function splitMbtiChips(rowLabel, txt) {
  if (!txt) return [];
  const sep = MBTI_ROW_SPLIT[rowLabel] || /[・／、。]/;
  return txt.split(sep).map(s=>s.trim()).filter(s=>s.length>0);
}

function MbtiTab({ result, mbtiInitial, onSaved }) {
  const initialBase = (mbtiInitial||'').split('-')[0] || '';
  const initialIdent = (mbtiInitial||'').split('-')[1] || 'A';
  const [mbtiBase, setMbtiBase] = useState(initialBase);
  const [identifier, setIdentifier] = useState(initialIdent); // 'A' or 'T'
  const [msg, setMsg] = useState('');
  const [estimateInfo, setEstimateInfo] = useState(null);
  const [scores, setScores] = useState({}); // {"行ラベル::チップテキスト": "check"|"cross"}（unknownは未保持）
  React.useEffect(()=>{
    setMbtiBase((mbtiInitial||'').split('-')[0]||'');
    setIdentifier((mbtiInitial||'').split('-')[1]||'A');
  }, [mbtiInitial, result?.name, result?.bd]);

  const selected = MBTI_TYPES.find(t=>t.code===mbtiBase);
  const fullCode = mbtiBase ? `${mbtiBase}-${identifier}` : '';
  const groupCol = selected ? MBTI_GROUPS[selected.group].col : '#8a6a3a';

  // localStorage連携（人物 × MBTIタイプ ごとに採点を保存）
  const scoreKey = (result?.name && result?.bd && mbtiBase)
    ? `shichusuimei_mbti_score_${result.name}_${result.bd}_${mbtiBase}`
    : null;
  React.useEffect(()=>{
    if (!scoreKey) { setScores({}); return; }
    try {
      const saved = localStorage.getItem(scoreKey);
      setScores(saved ? JSON.parse(saved) : {});
    } catch { setScores({}); }
  }, [scoreKey]);
  React.useEffect(()=>{
    if (!scoreKey) return;
    try { localStorage.setItem(scoreKey, JSON.stringify(scores)); } catch { /* QuotaExceeded等は無視 */ }
  }, [scores, scoreKey]);

  const cycleScore = (rowLabel, chip) => {
    const key = `${rowLabel}::${chip}`;
    setScores(prev => {
      const cur = prev[key] || 'unknown';
      const next = cur === 'unknown' ? 'check' : cur === 'check' ? 'cross' : 'unknown';
      if (next === 'unknown') {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: next };
    });
  };
  const getScore = (rowLabel, chip) => scores[`${rowLabel}::${chip}`] || 'unknown';
  const resetScores = () => setScores({});

  const handleEstimate = () => {
    if (!result) { setMsg('（先に鑑定してください）'); return; }
    const est = estimateMbti(result);
    if (!est) { setMsg('推定できませんでした'); return; }
    setMbtiBase(est.base);
    setIdentifier(est.identifier);
    setEstimateInfo(est);
    setMsg('✨ 命式から推定しました');
    setTimeout(()=>setMsg(''), 2500);
  };

  const handleSave = () => {
    if (!result) { setMsg('（先に鑑定してください）'); return; }
    if (!mbtiBase) { setMsg('MBTIを選択してください'); return; }
    // 保存リストに人物がいなければまず鑑定結果として保存
    const list = savedList();
    const exists = list.find(p=>p.name===result.name && p.bd===result.bd);
    if (!exists) {
      result.mbti = fullCode;
      savePerson(result);
    } else {
      updateMbti(result.name, result.bd, fullCode);
    }
    setMsg('✓ 保存しました');
    setTimeout(()=>setMsg(''), 2000);
    if (onSaved) onSaved(fullCode);
    window.dispatchEvent(new Event('shichuSaved'));
  };

  return (
    <div style={{background:"rgba(253,248,242,0.9)",border:"1px solid #d4b896",borderRadius:8,padding:"18px 20px",margin:"4px 0 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:10,borderBottom:"1px dashed #d4b89677"}}>
        <span style={{fontSize:14,fontWeight:700,color:"#5a3a1a",letterSpacing:2}}>💎 MBTI（西洋・別レイヤー）</span>
        <span style={{fontSize:10,color:"#8a6a3a"}}>※四柱推命とは独立した参考データ</span>
      </div>

      <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center",marginBottom:14}}>
        <label style={{fontSize:13,color:"#3a2e22",fontWeight:700,letterSpacing:1}}>タイプ：</label>
        <select value={mbtiBase} onChange={e=>setMbtiBase(e.target.value)} style={{border:"1px solid #c4a070",borderRadius:4,padding:"6px 10px",fontSize:13,background:"#fff",color:"#3a2e22",cursor:"pointer",minWidth:200}}>
          <option value="">— 未選択 —</option>
          {Object.keys(MBTI_GROUPS).map(g=>(
            <optgroup key={g} label={`${MBTI_GROUPS[g].emoji} ${g}`}>
              {MBTI_TYPES.filter(t=>t.group===g).map(t=>(
                <option key={t.code} value={t.code}>{t.code} — {t.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {mbtiBase && (
          <>
            <label style={{fontSize:13,color:"#3a2e22",fontWeight:700,letterSpacing:1,marginLeft:8}}>気質：</label>
            <label style={{cursor:"pointer",fontSize:13,color:"#3a2e22"}}>
              <input type="radio" checked={identifier==='A'} onChange={()=>setIdentifier('A')} style={{accentColor:"#e8920a",marginRight:4}}/>
              -A 自己主張型
            </label>
            <label style={{cursor:"pointer",fontSize:13,color:"#3a2e22"}}>
              <input type="radio" checked={identifier==='T'} onChange={()=>setIdentifier('T')} style={{accentColor:"#e8920a",marginRight:4}}/>
              -T 慎重型
            </label>
          </>
        )}
      </div>

      {selected && (
        <div style={{background:"#fdf5e8",border:`1px solid ${groupCol}55`,borderRadius:6,padding:"12px 16px",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:700,color:groupCol,marginBottom:6,letterSpacing:2}}>
            {fullCode} — {selected.name}
          </div>
          <div style={{fontSize:11,color:"#7a6a55",marginBottom:6}}>グループ：{MBTI_GROUPS[selected.group].emoji} {selected.group}</div>
          <div style={{fontSize:13,color:"#3a2e22",lineHeight:1.7}}>{selected.desc}</div>
        </div>
      )}

      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <button onClick={handleEstimate} disabled={!result} style={{padding:"7px 18px",borderRadius:6,background:!result?"#c4a07055":"linear-gradient(135deg,#c88a2a,#e8a030)",color:"#fff",border:"none",fontSize:13,fontWeight:700,letterSpacing:2,cursor:!result?"not-allowed":"pointer"}}>
          ✨ 命式から自動推定
        </button>
        <button onClick={handleSave} disabled={!result||!mbtiBase} style={{padding:"7px 18px",borderRadius:6,background:(!result||!mbtiBase)?"#c4a07055":"#5a3a1a",color:"#f5ede0",border:"none",fontSize:13,fontWeight:700,letterSpacing:2,cursor:(!result||!mbtiBase)?"not-allowed":"pointer"}}>
          💾 保存
        </button>
        <a href="https://www.16personalities.com/ja/性格診断テスト" target="_blank" rel="noopener noreferrer" style={{padding:"6px 14px",borderRadius:6,background:"transparent",border:"1px solid #c4a070",color:"#5a3a1a",fontSize:12,fontWeight:700,letterSpacing:1,textDecoration:"none"}}>
          📝 16Personalitiesで診断する →
        </a>
        {msg && <span style={{fontSize:11,color:"#3a7a3a",fontWeight:700,marginLeft:6}}>{msg}</span>}
      </div>

      {estimateInfo && (
        <div style={{marginTop:14,background:"#fef7e8",border:"1px solid #e8a030",borderRadius:6,padding:"12px 16px",fontSize:11,color:"#5a3a1a"}}>
          <div style={{fontWeight:700,marginBottom:10,letterSpacing:1,fontSize:12}}>
            ✨ 命式からの推定：<span style={{color:groupCol,fontSize:14,marginLeft:6}}>{estimateInfo.code}</span>
          </div>
          {(() => {
            const axes = [
              {key:'ie', leftLabel:'E 外向', rightLabel:'I 内向', score: parseFloat(estimateInfo.scores.ie)},
              {key:'ns', leftLabel:'S 感覚', rightLabel:'N 直感', score: parseFloat(estimateInfo.scores.ns)},
              {key:'tf', leftLabel:'F 感情', rightLabel:'T 思考', score: parseFloat(estimateInfo.scores.tf)},
              {key:'jp', leftLabel:'P 知覚', rightLabel:'J 判断', score: parseFloat(estimateInfo.scores.jp)},
              {key:'at', leftLabel:'T 慎重', rightLabel:'A 自己主張', score: parseFloat(estimateInfo.scores.at)},
            ];
            // 全軸の絶対値最大でスケール正規化（軸間の相対比較がしやすい）
            const maxAbs = Math.max(1, ...axes.map(a=>Math.abs(a.score)));
            return (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {axes.map(ax => {
                  const isPlus = ax.score >= 0;
                  const reasons = estimateInfo.topReasons?.[ax.key] || [];
                  const widthPct = Math.min(50, Math.round((Math.abs(ax.score) / maxAbs) * 50));
                  return (
                    <div key={ax.key} style={{fontSize:10}}>
                      <div style={{display:"grid",gridTemplateColumns:"68px 1fr 68px",alignItems:"center",gap:6}}>
                        <div style={{textAlign:"right",fontWeight:isPlus?400:700,color:isPlus?"#a08868":"#c06030",fontSize:11}}>{ax.leftLabel}</div>
                        <div style={{position:"relative",height:14,background:"#f5e8c8",borderRadius:3,overflow:"hidden"}}>
                          {/* センターライン */}
                          <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"#a08868",zIndex:2}}/>
                          {/* バー本体（中央から左右に伸ばす） */}
                          {isPlus ? (
                            <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:`${widthPct}%`,background:"linear-gradient(90deg,#3a7acf,#5a9adf)"}}/>
                          ) : (
                            <div style={{position:"absolute",right:"50%",top:0,bottom:0,width:`${widthPct}%`,background:"linear-gradient(90deg,#d09040,#c06020)"}}/>
                          )}
                          {/* スコア数値 */}
                          <div style={{position:"absolute",left:"50%",top:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#5a3a1a",fontWeight:700,transform:"translateX(-50%)",zIndex:3,background:"rgba(255,255,255,0.6)",padding:"0 4px",borderRadius:2}}>
                            {ax.score >= 0 ? '+' : ''}{ax.score.toFixed(1)}
                          </div>
                        </div>
                        <div style={{textAlign:"left",fontWeight:isPlus?700:400,color:isPlus?"#3a7acf":"#a08868",fontSize:11}}>{ax.rightLabel}</div>
                      </div>
                      <div style={{marginTop:2,paddingLeft:74,fontSize:9,color:"#7a5a30",lineHeight:1.4}}>
                        {reasons.length > 0 ? `→ ${reasons.join(" / ")}` : "→ （顕著な要素なし）"}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <div style={{marginTop:10,fontSize:10,color:"#8a6a3a",lineHeight:1.6,paddingTop:8,borderTop:"1px dashed #e8a03077"}}>
            ※ 中央0で左右に振れた量＝傾きの強さ。五行・通変星（蔵干含む）・身強弱・神殺を総合して推定。あくまで参考値で、本人の自己診断（16Personalities）と必ずしも一致しません。
          </div>
        </div>
      )}

      {!result && <div style={{marginTop:12,fontSize:11,color:"#8a6a3a"}}>※ 先に「鑑定する」ボタンで人物を鑑定してください。鑑定後にMBTIを紐付け保存できます。</div>}

      {selected && MBTI_DETAILS[selected.code] && (() => {
        const d = MBTI_DETAILS[selected.code];
        const rows = [
          {icon:"💪", label:"強み", value:d.strengths},
          {icon:"⚠️", label:"弱み", value:d.weaknesses},
          {icon:"💼", label:"向く仕事", value:d.career},
          {icon:"💗", label:"人間関係", value:d.relation},
          {icon:"💰", label:"お金", value:d.money},
          {icon:"🧘", label:"ストレス対処", value:d.stress},
          {icon:"💞", label:"恋愛・夫婦", value:d.love},
          {icon:"👶", label:"親としての特徴", value:d.parent},
          {icon:"🌱", label:"成長段階", value:d.growth},
          {icon:"💬", label:"コミュニケーション", value:d.communication},
          {icon:"🌑", label:"追い詰められた時", value:d.shadow},
          {icon:"⭐", label:"似たタイプの人物", value:d.famous},
        ];
        // 集計
        let totalChips=0, totalCheck=0, totalCross=0, totalUnknown=0;
        const perRow = {};
        rows.forEach(r => {
          const chips = splitMbtiChips(r.label, r.value);
          let rc=0, rx=0, ru=0;
          chips.forEach(chip => {
            totalChips++;
            const st = getScore(r.label, chip);
            if (st === 'check') { rc++; totalCheck++; }
            else if (st === 'cross') { rx++; totalCross++; }
            else { ru++; totalUnknown++; }
          });
          perRow[r.label] = { check:rc, cross:rx, unknown:ru, total:chips.length };
        });
        const judged = totalCheck + totalCross;
        const matchRate = judged > 0 ? Math.round(totalCheck / judged * 100) : 0;

        const chipStyleBase = {
          display:'inline-flex', alignItems:'center', gap:4,
          margin:'3px 5px 3px 0', padding:'3px 9px',
          border:'1px solid', borderRadius:14,
          fontSize:11.5, cursor:'pointer', userSelect:'none',
          transition:'all 0.15s',
        };
        const chipStateStyle = (st) => st === 'check'
          ? {background:'#dcecdc', borderColor:'#5a8a5a', color:'#2a4a2a'}
          : st === 'cross'
          ? {background:'#f0e0e0', borderColor:'#a06a6a', color:'#7a3a3a', textDecoration:'line-through'}
          : {background:'#fdf5e8', borderColor:'#c4a070', color:'#5a3a1a'};
        const chipIcon = (st) => st === 'check' ? '✓' : st === 'cross' ? '✗' : '？';

        return (
          <div style={{marginTop:18,paddingTop:14,borderTop:"1px dashed #d4b89677"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700,color:groupCol,letterSpacing:2}}>
                ▌ {fullCode} {selected.name} の詳しい性格
              </div>
              <div style={{fontSize:10,color:"#7a6a55"}}>
                ※ 各単語をクリック：<span style={{color:"#3a7a3a"}}>✓該当</span> → <span style={{color:"#7a3a3a"}}>✗違う</span> → <span style={{color:"#8a6a55"}}>？戻す</span>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"max-content 1fr",gap:"10px 14px",fontSize:12,color:"#3a2e22",lineHeight:1.7,alignItems:"baseline"}}>
              {rows.map(r => {
                const chips = splitMbtiChips(r.label, r.value);
                const p = perRow[r.label];
                return (
                  <React.Fragment key={r.label}>
                    <div style={{fontWeight:700,color:"#5a3a1a",whiteSpace:"nowrap",paddingTop:4}}>
                      {r.icon} {r.label}
                      {p.total > 0 && (
                        <div style={{fontSize:9,color:"#8a6a55",fontWeight:400,marginTop:1}}>
                          ✓{p.check} ✗{p.cross} ？{p.unknown}
                        </div>
                      )}
                    </div>
                    <div>
                      {chips.length > 0 ? chips.map((chip, idx) => {
                        const st = getScore(r.label, chip);
                        return (
                          <span
                            key={idx}
                            onClick={() => cycleScore(r.label, chip)}
                            style={{...chipStyleBase, ...chipStateStyle(st)}}
                          >
                            <span style={{fontWeight:700, fontSize:10, opacity:0.8}}>{chipIcon(st)}</span>
                            {chip}
                          </span>
                        );
                      }) : <span style={{color:"#aaa"}}>—</span>}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {AT_DETAILS[identifier] && (() => {
              const at = AT_DETAILS[identifier];
              const atRows = [
                {icon:"💪", label:"強み", value:at.strengths},
                {icon:"⚠️", label:"弱み", value:at.weaknesses},
                {icon:"🧘", label:"ストレス", value:at.stress},
                {icon:"💡", label:"アドバイス", value:at.advice},
              ];
              return (
                <div style={{marginTop:14,padding:"12px 14px",background:at.bg,borderLeft:`3px solid ${at.color}`,borderRadius:4,fontSize:11,color:"#3a2e22",lineHeight:1.7}}>
                  <div style={{fontWeight:700,fontSize:12,color:at.color,marginBottom:6,letterSpacing:1}}>
                    -{identifier}　{at.name}
                  </div>
                  <div style={{marginBottom:8}}>{at.summary}</div>
                  <div style={{display:"grid",gridTemplateColumns:"max-content 1fr",gap:"4px 10px",fontSize:10.5}}>
                    {atRows.map(r => (
                      <React.Fragment key={r.label}>
                        <div style={{fontWeight:700,whiteSpace:"nowrap"}}>{r.icon} {r.label}</div>
                        <div>{r.value}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 採点集計フローティング（ページ最下部に常時表示） */}
            <div style={{
              position:"sticky", bottom:0, marginTop:18,
              background:"linear-gradient(180deg,rgba(253,248,242,0.95),rgba(253,248,242,1))",
              border:"2px solid #c4a070", borderRadius:8,
              padding:"10px 14px",
              boxShadow:"0 -3px 10px rgba(90,58,26,0.15)",
              fontSize:11, color:"#3a2e22", zIndex:5,
              backdropFilter:"blur(4px)",
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:6}}>
                <div style={{fontWeight:700,fontSize:13,color:"#5a3a1a",letterSpacing:1}}>
                  📊 自己採点：{fullCode}
                </div>
                <button onClick={resetScores}
                  style={{padding:"4px 10px",borderRadius:5,border:"1px solid #c4a070",background:"transparent",color:"#7a5a3a",fontSize:10,cursor:"pointer"}}>
                  すべて？に戻す
                </button>
              </div>
              <div style={{display:"flex",gap:18,fontSize:12,fontWeight:700,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{color:"#3a7a3a"}}>✓ 該当 {totalCheck}</span>
                <span style={{color:"#a04040"}}>✗ 違う {totalCross}</span>
                <span style={{color:"#7a6a55"}}>？ わからない {totalUnknown}</span>
                <span style={{color:"#7a6a55",fontWeight:400}}>／ 全{totalChips}項目</span>
                <span style={{marginLeft:"auto",fontSize:14,color:judged > 0 ? "#5a3a1a" : "#aaa"}}>
                  マッチ率 <b style={{fontSize:18,color:matchRate>=70?"#3a7a3a":matchRate>=40?"#c08030":"#a04040"}}>{matchRate}%</b>
                  <span style={{fontSize:10,color:"#8a6a55",marginLeft:4}}>（判定済 {judged}件中）</span>
                </span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:"4px 10px",fontSize:10,color:"#7a6a55"}}>
                {rows.map(r => {
                  const p = perRow[r.label];
                  if (!p || p.total === 0) return null;
                  return (
                    <div key={r.label} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px dotted #e0d0b8",paddingBottom:2}}>
                      <span>{r.icon} {r.label}</span>
                      <span><b style={{color:"#3a7a3a"}}>{p.check}</b>/<b style={{color:"#a04040"}}>{p.cross}</b>/<span style={{color:"#8a6a55"}}>{p.unknown}</span></span>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:6,fontSize:9,color:"#8a6a55",lineHeight:1.5}}>
                ※ マッチ率＝✓÷(✓+✗)。判定済のうち該当した割合。70%以上なら診断が合っているサイン。
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{marginTop:18,paddingTop:14,borderTop:"1px dashed #d4b89677",fontSize:11,color:"#7a6a55",lineHeight:1.7}}>
        <div style={{fontWeight:700,marginBottom:4,color:"#5a3a1a"}}>📚 MBTIとは</div>
        ユング心理学を元にイザベル・マイヤーズらが開発した性格類型論。4軸（E/I, S/N, T/F, J/P）と気質（-A/-T）の組み合わせで16タイプ＋32パターン。<br/>
        四柱推命が「天運（生まれた時の宇宙）」を見るのに対し、MBTIは「認知スタイル（情報処理の癖）」を見る。両方並べると人物像が立体的に。
      </div>
    </div>
  );
}

function App() {
  // 認証は localStorage に永続化：端末（ブラウザ）ごとに初回1回だけ入力すればよい
  // （旧 sessionStorage の認証済み印も引き続き有効として扱う）
  const [authed, setAuthed] = useState(()=>localStorage.getItem("shichusuimei_auth")==="1"||sessionStorage.getItem("shichusuimei_auth")==="1");
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const checkPw = () => {
    if(pw==="Harukun-0120"){ setAuthed(true); try{ localStorage.setItem("shichusuimei_auth","1"); }catch{ sessionStorage.setItem("shichusuimei_auth","1"); } }
    else setPwError(true);
  };
  // GitHub自動同期の起動（トークン設定済みなら起動時にクラウドから取得）
  React.useEffect(()=>{ initSync(); },[]);
  // スマートフォン・iPad対応
  React.useEffect(()=>{
    let meta = document.querySelector('meta[name="viewport"]');
    if(!meta){ meta=document.createElement('meta'); meta.name='viewport'; document.head.appendChild(meta); }
    meta.content='width=device-width, initial-scale=1, maximum-scale=1';
    const styleId = 'shichusuimei-safari-fix';
    if(!document.getElementById(styleId)){
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = 'button{-webkit-appearance:none!important;appearance:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;} input[type=text],input[type=number],input[type=password],input[type=time]{-webkit-appearance:none!important;appearance:none!important;}';
      document.head.appendChild(style);
    }
  },[]);
  // フォーム状態
  const [formName, setFormName] = useState("");
  const [formGender, setFormGender] = useState("male");
  const [formYear, setFormYear] = useState("2000");
  const [formMonth, setFormMonth] = useState("1");
  const [formDay, setFormDay] = useState("1");
  const [formTime, setFormTime] = useState("");

  // URLパラメータから自動入力（朝のルーティンアプリからの連携）
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pName   = params.get("name");
    const pYear   = params.get("year");
    const pMonth  = params.get("month");
    const pDay    = params.get("day");
    const pGender = params.get("gender");
    const pTime   = params.get("time");
    if (pName)   setFormName(pName);
    if (pYear)   setFormYear(pYear);
    if (pMonth)  setFormMonth(pMonth);
    if (pDay)    setFormDay(pDay);
    if (pGender) setFormGender(pGender);
    if (pTime)   setFormTime(pTime);
  }, []);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [globalApiKey, setGlobalApiKey] = useState("");
  const [activeTab, setActiveTab] = useState("result"); // "result" | "memo"
  const [saveMsg, setSaveMsg] = useState('');
  const handleSave = () => {
    if (!result) return;
    const ok = savePerson(result);
    setSaveMsg(ok ? '✓ 保存しました' : '（保存済み）');
    setTimeout(()=>setSaveMsg(''), 2000);
    // 保存リストタブに更新を通知
    window.dispatchEvent(new Event('shichuSaved'));
  };

  // 認証チェック（全フック呼び出し後に配置・Hooks規則準拠）
  if(!authed) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#f5ede0,#fdf8f2)"}}>
      <div style={{background:"#fff",padding:"40px 32px",borderRadius:16,border:"1px solid #d4b896",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",textAlign:"center",maxWidth:320}}>
        <div style={{fontSize:24,fontWeight:900,color:"#5a3a1a",marginBottom:8}}>四柱推命</div>
        <div style={{fontSize:12,color:"#9a8a70",marginBottom:24}}>パスワードを入力してください</div>
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwError(false);}}
          onKeyDown={e=>e.key==="Enter"&&checkPw()}
          placeholder="パスワード"
          style={{width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid ${pwError?"#e05050":"#c4a070"}`,fontSize:14,boxSizing:"border-box",background:"#fdf5e8",color:"#3a2e22"}}/>
        {pwError && <div style={{color:"#c04040",fontSize:11,marginTop:6}}>パスワードが違います</div>}
        <button onClick={checkPw}
          style={{marginTop:16,width:"100%",padding:"10px",borderRadius:8,background:"linear-gradient(135deg,#c88a2a,#e8a030)",border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          ログイン
        </button>
      </div>
    </div>
  );

  const cy = new Date().getFullYear();

  const yearOptions = [];
  for (let y = 1920; y <= cy; y++) yearOptions.push(y);
  const monthOptions = Array.from({length:12},(_,i)=>i+1);
  const dayOptions = Array.from({length:31},(_,i)=>i+1);

  const handleKantei = () => {
    const y=Number(formYear), m=Number(formMonth), d=Number(formDay);
    const dt = new Date(y, m-1, d);
    if (!y || dt.getFullYear()!==y || dt.getMonth()!==m-1 || dt.getDate()!==d) {
      alert(`${formYear}年${formMonth}月${formDay}日は存在しない日付です。日付をご確認ください。`);
      return;
    }
    const bd = `${formYear}-${String(formMonth).padStart(2,"0")}-${String(formDay).padStart(2,"0")}`;
    const r = calcAll(formName||"名無し", bd, formTime, formGender);
    setResult(r);
    setSubmitted(true);
    setActiveTab("result");
  };

  const inputStyle = {
    border:"1px solid #c4a070",
    borderRadius:4,
    padding:"6px 10px",
    fontSize:14,
    background:"#fff",
    color:"#3a2e22",
    fontFamily:"inherit",
    outline:"none"
  };
  const selectStyle = {...inputStyle, cursor:"pointer"};
  const labelStyle = {
    fontSize:14,
    fontWeight:700,
    color:"#3a2e22",
    letterSpacing:3,
    display:"inline-block",
    width:80,
    textAlign:"right",
    marginRight:12
  };

  const tabStyle = (active) => ({
    padding:"6px 10px",
    borderRadius:"8px 8px 0 0",
    border:`1px solid ${active?"#c4a070":"#d4b89688"}`,
    borderBottom: active ? "1px solid #f5ede0" : "1px solid #c4a070",
    background: active ? "#f5ede0" : "#ede5d8",
    color: active ? "#5a3a1a" : "#9a8a70",
    fontSize:11,
    fontWeight: active ? 700 : 400,
    cursor:"pointer",
    letterSpacing:0,
    marginBottom: active ? -1 : 0,
    position:"relative",
    zIndex: active ? 2 : 1,
  });

  return (
    <div style={{minHeight:"100vh",background:"#f0ebe2 url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8b89a' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",color:"#3a2e22",fontFamily:"'Noto Serif JP','Yu Mincho',serif",overflowX:"hidden",paddingBottom:60}}>

      {/* ヘッダー */}
      <div style={{background:"rgba(247,239,230,0.95)",padding:"14px 20px",borderBottom:"1px solid #d4b896",backdropFilter:"blur(10px)"}}>
        <div style={{maxWidth:794,margin:"0 auto",textAlign:"center"}}>
          <h1 style={{margin:0,fontSize:20,fontWeight:700,letterSpacing:4,color:"#5a3a1a"}}>✦ 四柱推命 鑑定書 ✦</h1>
        </div>
      </div>

      <div style={{maxWidth:794,margin:"0 auto",padding:"16px 8px 0"}}>

        {/* 入力フォーム */}
        <div style={{background:"rgba(253,248,242,0.9)",border:"1px solid #d4b896",borderRadius:12,padding:"24px",marginBottom:24,boxShadow:"0 2px 12px #c8b89a22"}}>
          <table style={{margin:"0 auto",borderCollapse:"separate",borderSpacing:"0 10px",width:"100%",maxWidth:500}}>
            <tbody>
              <tr>
                <td><span style={labelStyle}>氏　名</span></td>
                <td><input type="text" value={formName} onChange={e=>setFormName(e.target.value)} style={{...inputStyle,width:"min(220px,60vw)"}} placeholder="お名前"/></td>
              </tr>
              <tr>
                <td><span style={labelStyle}>性　別</span></td>
                <td style={{display:"flex",alignItems:"center",gap:16}}>
                  <label style={{cursor:"pointer",fontSize:14,color:"#3a2e22"}}>
                    <input type="radio" checked={formGender==="male"} onChange={()=>setFormGender("male")} style={{accentColor:"#e8920a",marginRight:4}}/>
                    男性
                  </label>
                  <label style={{cursor:"pointer",fontSize:14,color:"#3a2e22"}}>
                    <input type="radio" checked={formGender==="female"} onChange={()=>setFormGender("female")} style={{accentColor:"#e8920a",marginRight:4}}/>
                    女性
                  </label>
                </td>
              </tr>
              <tr>
                <td><span style={labelStyle}>生年月日</span></td>
                <td style={{display:"flex",alignItems:"center",gap:4}}>
                  <select value={formYear} onChange={e=>setFormYear(e.target.value)} style={{...selectStyle,width:80}}>
                    {yearOptions.map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                  <span style={{fontSize:12,color:"#7a6a55",margin:"0 2px"}}>年</span>
                  <select value={formMonth} onChange={e=>setFormMonth(e.target.value)} style={{...selectStyle,width:56}}>
                    {monthOptions.map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                  <span style={{fontSize:12,color:"#7a6a55",margin:"0 2px"}}>月</span>
                  <select value={formDay} onChange={e=>setFormDay(e.target.value)} style={{...selectStyle,width:56}}>
                    {dayOptions.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                  <span style={{fontSize:12,color:"#7a6a55",margin:"0 2px"}}>日</span>
                </td>
              </tr>
              <tr>
                <td><span style={labelStyle}>時　間</span></td>
                <td style={{display:"flex",alignItems:"center",gap:8}}>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e=>setFormTime(e.target.value)}
                    style={{...inputStyle,width:120}}
                  />
                  {formTime && (
                    <button
                      onClick={()=>setFormTime("")}
                      style={{padding:"4px 10px",borderRadius:6,border:"1px solid #c4a070",background:"#fdf5e8",color:"#8a6a3a",fontSize:11,cursor:"pointer"}}
                      title="時間をクリア"
                    >✕ クリア</button>
                  )}
                  {!formTime && <span style={{fontSize:11,color:"#9a8a70"}}>（時間不明）</span>}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{textAlign:"center",marginTop:20}}>
            <button
              onClick={handleKantei}
              style={{background:"linear-gradient(135deg,#d4950a,#e8b030)",border:"none",borderRadius:24,padding:"12px 48px",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",letterSpacing:4,boxShadow:"0 4px 16px #c88a2a55",fontFamily:"inherit"}}
            >
              鑑　定
            </button>
          </div>
        </div>

        {/* 鑑定結果 */}
        {submitted && result && (
          <div>
            {/* 結果ヘッダー */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:0,paddingBottom:8,borderBottom:"none",flexWrap:"wrap",gap:8}}>
              <div style={{borderLeft:"4px solid #c4a070",paddingLeft:12}}>
                <div style={{fontSize:16,fontWeight:700,color:"#3a2e22",letterSpacing:1}}>鑑定結果　【{result.name} 様】</div>
              </div>
              <button
                onClick={()=>window.print()}
                style={{background:"#5a5a6a",border:"none",borderRadius:6,padding:"8px 16px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}
              >
                🖨 鑑定書を印刷
              </button>
            </div>

            {/* タブ */}
            <div style={{display:"flex",gap:2,marginTop:10,borderBottom:"1px solid #c4a070",marginBottom:0,flexWrap:"wrap"}}>
              <button onClick={()=>setActiveTab("result")} style={tabStyle(activeTab==="result")}>📋 鑑定結果</button>
              <button onClick={()=>setActiveTab("memo")}   style={tabStyle(activeTab==="memo")}>📝 人生メモ</button>
              <button onClick={()=>setActiveTab("soudan")} style={tabStyle(activeTab==="soudan")}>🔮 悩み相談</button>
              <button onClick={()=>setActiveTab("mbti")}   style={tabStyle(activeTab==="mbti")}>💎 MBTI</button>
              <button onClick={()=>setActiveTab("savedlist")} style={tabStyle(activeTab==="savedlist")}>💾 保存リスト</button>
            </div>

            {/* ── 鑑定結果タブ ── */}
            {activeTab==="result" && (
              <div style={{border:"1px solid #c4a070",borderTop:"none",borderRadius:"0 8px 8px 8px",padding:"16px 0",background:"transparent"}}>
                <div style={{display:"flex",justifyContent:"flex-end",paddingRight:16,marginBottom:4}}>
                  <button onClick={handleSave} style={{background:"#f5f0e8",border:"1px solid #c4a070",borderRadius:20,padding:"5px 16px",fontSize:12,cursor:"pointer",color:"#8a6010",fontWeight:600}}>💾 このデータを保存</button>
                  {saveMsg && <span style={{fontSize:11,color:"#2a5c45",marginLeft:8,alignSelf:"center"}}>{saveMsg}</span>}
                </div>

            {/* 命式 + 五行バランス */}
            {(()=>{
              const curDaiun = result.daiun.list.find((d,i,arr)=>d.startYear<=cy&&(!arr[i+1]||arr[i+1].startYear>cy));
              const curRyunen = result.ryunen.find(r=>r.year===cy);
              const extraEc = {木:0,火:0,土:0,金:0,水:0};
              if(curDaiun){extraEc[curDaiun.stemEl]++;extraEc[curDaiun.branchEl]++;}
              if(curRyunen){extraEc[curRyunen.stemEl]++;extraEc[curRyunen.branchEl]++;}
              const bd = result.bd.replace(/-/g,"/").replace(/(\d+)\/(\d+)\/(\d+)/,"$1年$2月$3日");
              return (
                <Section title={`▌ 命式 （${bd}${result.bt?" "+result.bt:""}　｜　${result.gender==="male"?"男性":"女性"}）`}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start"}}>
                    <div style={{overflowX:"auto",maxWidth:"100%"}}>
                      <MeishikiTable data={result}/>
                    </div>
                    <div style={{minWidth:200,flex:1}}>
                      <div style={{fontSize:12,color:"#5a3a1a",marginBottom:4,letterSpacing:1}}>▌ 五行のバランス</div>
                      <GogyouCircle ec={result.ec} stemEc={result.stemEc} branchEc={result.branchEc} extraEc={extraEc}
                        dayEl={result.pillars.day.stemEl}
                        gokaInfo={(()=>{
                          const GCOLS={木:"#7ecf6e",火:"#f07070",土:"#d4a84b",金:"#c0c8e0",水:"#6ab0e8"};
                          const info=[];
                          const pillars=[result.pillars.year,result.pillars.month,result.pillars.day,result.pillars.hour].filter(Boolean);
                          Object.entries(result.gokaMoveStem||{}).forEach(([i,{from,to}])=>{
                            info.push({color:GCOLS[from],toEl:to,type:"stem"});
                          });
                          Object.entries(result.gokaMoveBranch||{}).forEach(([i,{from,to}])=>{
                            info.push({color:GCOLS[from],toEl:to,type:"branch"});
                          });
                          return info;
                        })()}
                      />
                      <AgeMeishikiGogyou result={result}/>
                    </div>
                  </div>
                </Section>
              );
            })()}

            <Section title={`▌ 大運　（立命：${result.daiun.list[0]?.startYear}年〜）`}>
              <DaiunTableH daiun={result.daiun} dSi={result.pillars.day.stemIdx} pillars={result.pillars}/>
            </Section>

            <Section title={`▌ 流年（${cy-2}〜${cy+7}年）`}>
              <RyunenTableH ryunen={result.ryunen} pillars={result.pillars} dSi={result.pillars.day.stemIdx} birthYear={Number(result.bd.split("-")[0])}/>
              <div style={{fontSize:10,color:"#8a7a60",marginTop:6}}>※ 正しい立命を知りたい場合は出生時間を正確に入力してください。</div>
            </Section>

            <Section title={`▌ 性格・気質（日干：${result.pillars.day.stem}）`}>
              <MonthDayImageCard pillars={result.pillars}/>
              <SeikakuSection stem={result.pillars.day.stem} seikaku={null} tsuhen={result.tsuhen} junishi={result.junishi}/>
            </Section>

            {/* ✦ 未来5年運勢セクション */}
            <Section title={`▌ 未来5年の運勢（${cy}〜${cy+4}年）`}>
              <FutureFortuneSection result={result} globalApiKey={globalApiKey} setGlobalApiKey={setGlobalApiKey}/>
            </Section>

            {/* ✦ 年齢指定運勢セクション */}
            <Section title="▌ 年齢を指定して運勢を見る">
              <AgeFortuneSection result={result} globalApiKey={globalApiKey} setGlobalApiKey={setGlobalApiKey}/>
            </Section>

            {/* 通変星・十二運 説明（チェックで展開） */}
            <TsuhenShinSatsuPanel result={result}/>

            <div style={{fontSize:10,color:"#8a7a60",padding:"10px 14px",background:"#f0e8da",borderRadius:7,marginTop:6,marginLeft:16,marginRight:16}}>
              ※ 節入り日は概算値です。月の境目（毎月5〜9日頃）生まれの方は実際の節入り時刻をご確認ください。
            </div>
              </div>
            )}

            {/* ── 人生メモタブ ── */}
            {activeTab==="memo" && (
              <div style={{border:"1px solid #c4a070",borderTop:"none",borderRadius:"0 8px 8px 8px",padding:"24px 16px",background:"rgba(253,248,242,0.95)"}}>
                <AgeMemoSection birthYear={Number(result.bd.split("-")[0])} bd={result.bd} mainResult={result}/>
              </div>
            )}

            {/* ── 悩み相談タブ ── */}
            {activeTab==="soudan" && (
              <div style={{border:"1px solid #c4a070",borderTop:"none",borderRadius:"0 8px 8px 8px",background:"rgba(253,248,242,0.95)"}}>
                <SoudanSection result={result} globalApiKey={globalApiKey} setGlobalApiKey={setGlobalApiKey}/>
              </div>
            )}

            {/* ── MBTIタブ（西洋・別レイヤー） ── */}
            {activeTab==="mbti" && (
              <div style={{border:"1px solid #c4a070",borderTop:"none",borderRadius:"0 8px 8px 8px",padding:"4px 0",background:"transparent"}}>
                <MbtiTab result={result} mbtiInitial={getMbti(result.name, result.bd)}/>
              </div>
            )}

            {/* ── 保存リストタブ ── */}
            {activeTab==="savedlist" && (
              <div style={{border:"1px solid #c4a070",borderTop:"none",borderRadius:"0 8px 8px 8px",padding:"16px",background:"rgba(253,248,242,0.95)"}}>
                <SavedListTab onLoad={(p)=>{
                  const [py,pm,pd] = p.bd.split("-");
                  setFormName(p.name);
                  setFormGender(p.gender||"male");
                  setFormYear(String(Number(py)));
                  setFormMonth(String(Number(pm)));
                  setFormDay(String(Number(pd)));
                  setFormTime(p.bt||"");
                  setResult(calcAll(p.name, p.bd, p.bt||"", p.gender||"male"));
                  setSubmitted(true);
                  setActiveTab("result");
                }}/>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
