// "캐릭터 춤춰" 명예의 전당 자동 검사기
// 이슈 본문의 설정값만 읽어, 시뮬레이터와 같은 엔진으로 기록을 다시 계산합니다.
// 통과 → '명예의 전당' 라벨, 실패 → '기록 오류' 라벨 + 이슈 닫기. '제외' 라벨이 붙은 이슈는 건드리지 않습니다.
'use strict';
const E=require('./engine.js');
const RN={360:'360p',480:'480p',720:'720p',1080:'1080p',2160:'4K'};
const hms=t=>{t=Math.round(t);const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return h?h+'시간 '+m+'분':m?m+'분 '+s+'초':s+'초'};
module.exports=async({github,context,core})=>{
  const iss=context.payload.issue,{owner,repo}=context.repo,num=iss.number;
  const labels=(iss.labels||[]).map(l=>typeof l==='string'?l:l.name);
  if(labels.includes(E.HOF.EXCL)){core.info('제외 라벨 — 건너뜀');return}
  for(const [name,color,description] of [[E.HOF.LABEL,'E0A12E','검사기를 통과한 기록'],[E.HOF.BAD,'D33F2A','다시 계산이 맞지 않은 기록'],[E.HOF.EXCL,'6E7781','관리자가 순위에서 뺀 기록']]){
    try{await github.rest.issues.getLabel({owner,repo,name})}catch(e){try{await github.rest.issues.createLabel({owner,repo,name,color,description})}catch(_){}}}
  const rm=async n=>{if(labels.includes(n))try{await github.rest.issues.removeLabel({owner,repo,issue_number:num,name:n})}catch(_){}};
  let ev;
  try{ev=E.hofEval(E.hofParse(iss.body||''));if(!ev.free.n)throw new Error('깬 판이 하나도 없습니다.')}
  catch(e){
    await rm(E.HOF.LABEL);
    await github.rest.issues.addLabels({owner,repo,issue_number:num,labels:[E.HOF.BAD]});
    await github.rest.issues.createComment({owner,repo,issue_number:num,body:'🤖 기록을 확인하지 못했어요: **'+String(e.message).slice(0,300)+'**\n\n시뮬레이터 ⑤ 명예의 전당 탭의 \"올리기\" 버튼으로 만든 글을 고치지 않고 올려 주세요. 본문을 고치면 자동으로 다시 검사합니다.'});
    if(iss.state==='open')await github.rest.issues.update({owner,repo,issue_number:num,state:'closed',state_reason:'not_planned'});
    core.info('실패: '+e.message);return}
  await rm(E.HOF.BAD);
  await github.rest.issues.addLabels({owner,repo,issue_number:num,labels:[E.HOF.LABEL]});
  const rows=Object.keys(ev.levels).map(Number).sort((a,b)=>a-b).map(r=>{const L=ev.levels[r],g=E.GPUS[L.p.g];return '| '+RN[r]+' | '+g.n+' | '+(L.ok?'★'.repeat(L.stars)+'☆'.repeat(3-L.stars):'실패')+' | '+hms(L.t)+' | '+L.wh.toFixed(1)+'Wh | '+(L.official?'공식':'자유')+' |'}).join('\n');
  const tot=o=>o.n?RN[o.maxRes]+' · ★'+o.stars+' · '+hms(o.t)+' · '+o.wh.toFixed(1)+'Wh':'없음';
  await github.rest.issues.createComment({owner,repo,issue_number:num,body:'🏆 검사기가 같은 설정으로 다시 계산했어요. **명예의 전당**에 올랐습니다!\n\n| 판 | GPU | 별 | 시간 | 전기 | 부문 |\n|---|---|---|---|---|---|\n'+rows+'\n\n공식: '+tot(ev.off)+'  \n자유: '+tot(ev.free)+'\n\n순위는 시뮬레이터 ⑤ 탭에서 볼 수 있어요. 같은 아이디로 여러 번 올리면 가장 좋은 기록 하나만 순위에 들어갑니다.'});
  core.info('통과');
};
