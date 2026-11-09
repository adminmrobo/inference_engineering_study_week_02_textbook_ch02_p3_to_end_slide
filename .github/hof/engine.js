// 자동 생성 파일: gpu_dance_simulator.html 의 계산 엔진과 같은 코드입니다. 손으로 고치지 마세요.
'use strict';

var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var CL={text:'#1F2533',muted:'#5B6474',rule:'#D9DEE6',panel:'#F4F6F9',panel2:'#E9EDF2',blue:'#2F6FEB',orange:'#C2620F',green:'#178A50',red:'#D33F2A',purple:'#7B4FD6',amber:'#E0A12E'};
var FONT='"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif';
function fmt(v,d){d=d||0;return Number(v).toLocaleString('ko-KR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function hms(s){if(!isFinite(s))return '∞';s=Math.round(s);if(s>=86400)return Math.floor(s/86400)+'일 '+Math.floor(s%86400/3600)+'시간';if(s<60)return s+'초';if(s<3600)return Math.floor(s/60)+'분 '+(s%60)+'초';return Math.floor(s/3600)+'시간 '+Math.floor(s%3600/60)+'분'}
function ctx(cv){if(!cv.dataset.w){cv.dataset.w=cv.getAttribute('width');cv.dataset.h=cv.getAttribute('height')}var w=+cv.dataset.w,h=+cv.dataset.h,r=Math.min(2,window.devicePixelRatio||1),pw=Math.round(w*r),ph=Math.round(h*r);if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph}var x=cv.getContext('2d');x.setTransform(r,0,0,r,0,0);x.clearRect(0,0,w,h);x.W=w;x.H=h;return x}
function T(x,s,X,Y,c,sz,al,wt){x.font=(wt||400)+' '+(sz||14)+'px '+FONT;x.fillStyle=c||CL.text;x.textAlign=al||'left';x.textBaseline='middle';x.fillText(s,X,Y)}
function RR(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}

/* ===== GPU 10종 (본 발표 32장과 같은 값: 텐서 FP16 밀집, GeForce는 FP32 누산) ===== */
var GPUS={
 h100:{n:'H100 SXM (책)',f:989,b:3.35,m:80,w:700,pc:[5,16],sm:132,u:'SM',fp8:true,fa:true,e:0.6,en:'책 기준 60%',sw:'CUDA'},
 q:{n:'Quadro RTX 5000',f:89.2,b:.448,m:16,w:265,pc:[3,16],sm:48,u:'SM',fp8:false,fa:false,e:0.23,en:'Turing: 실측 SD에서 RTX 3060 Ti 급',sw:'CUDA · Turing'},
 n:{n:'RTX 5060 Ti 16GB',f:47.4,b:.448,m:16,w:180,pc:[5,8],sm:36,u:'SM',fp8:true,fa:true,e:0.6,en:'SDXL 실측 RTX 4070 바로 아래',sw:'CUDA'},
 n70:{n:'RTX 5070',f:61.7,b:.672,m:12,w:250,pc:[5,16],sm:48,u:'SM',fp8:true,fa:true,e:0.6,en:'NVIDIA 기본 60%',sw:'CUDA'},
 n80:{n:'RTX 5080',f:112.6,b:.96,m:16,w:360,pc:[5,16],sm:84,u:'SM',fp8:true,fa:true,e:0.6,en:'NVIDIA 기본 60%',sw:'CUDA'},
 n90:{n:'RTX 5090',f:209.5,b:1.792,m:32,w:575,pc:[5,16],sm:170,u:'SM',fp8:true,fa:true,e:0.6,en:'NVIDIA 기본 60%',sw:'CUDA'},
 a70:{n:'RX 9070 XT',f:194.7,b:.64,m:16,w:304,pc:[5,16],sm:64,u:'CU',fp8:true,fa:true,e:0.18,en:'ROCm: SDXL 실측 RTX 4070보다 느림',sw:'ROCm'},
 a97:{n:'Radeon AI PRO R9700',f:191,b:.64,m:32,w:300,pc:[5,16],sm:64,u:'CU',fp8:true,fa:true,e:0.18,en:'9070 XT와 같은 칩',sw:'ROCm'},
 b58:{n:'Arc B580',f:116.5,b:.456,m:12,w:190,pc:[4,8],sm:20,u:'Xe 코어',fp8:false,fa:true,e:0.22,en:'SDXL 실측 RTX 3080의 약 80%',sw:'oneAPI'},
 b60:{n:'Arc Pro B60',f:98.5,b:.456,m:24,w:200,pc:[5,8],sm:20,u:'Xe 코어',fp8:false,fa:true,e:0.22,en:'B580과 같은 칩',sw:'oneAPI'}};
var ORDER=['h100','q','n','n70','n80','n90','a70','a97','b58','b60'];
var MODELS={w13:{n:'Wan 2.1 1.3B',P:1.3e9,d:1536,L:30,h:12},w14:{n:'Wan 2.1 14B',P:14e9,d:5120,L:40,h:40}};
var RES={360:[640,360],480:[832,480],720:[1280,720],1080:[1920,1080],2160:[3840,2160]};function rn(r){return r===2160?'4K':r+'p'}
var LANE={3:.985,4:1.97,5:3.94},RISE={weak:70,mid:55,strong:42},EC=.6,EB=.8,ENC_GB=11.4,MOT_GB=.6,TLIM=83;
var PH=[['load','모델 싣기'],['enc','텍스트 인코더'],['mot','동작 생성'],['den','영상 디노이징'],['vae','VAE 펼치기'],['save','저장 · 전송']];
var BND={C:['계산',CL.blue],M:['메모리',CL.orange],P:['PCIe',CL.red],U:['CPU',CL.purple]};

/* ===== 사건 사전: 교재 표현을 빌린 해설 ===== */
var EV={
 LOAD:{t:'모델 싣기',tag:'ops',easy:'디스크·시스템 RAM에 있던 설계도(가중치)를 트럭(PCIe)으로 창고(VRAM)에 옮깁니다. 트럭 길이 좁으면 첫 실행이 오래 걸립니다.',fix:'서버를 띄워 둔 채 모델을 상주시키면 두 번째부터는 이 시간이 없습니다.'},
 ENC_CPU:{t:'텍스트 인코더를 CPU에서',tag:'ops',easy:'"캐릭터 춤춰"를 숫자 지시서로 바꾸는 텍스트 인코더(약 11GB)가 VRAM에 함께 들어가지 않아 CPU가 대신 처리합니다. 한 번뿐이라 큰 손해는 아니지만 수십 초가 더 듭니다.',fix:'인코더를 FP8로 쓰거나 VRAM이 큰 카드'},
 MOT_M:{t:'동작 생성: 메모리 병목',tag:'book',book:'디코드는 토큰마다 가중치를 모두 읽어야 해서 메모리에서 막힌다. 메모리 병목인 작업은 계산을 아무리 최적화해도 빨라지지 않는다. (교재 2.4)',easy:'춤 동작을 한 프레임씩 이어 만드는 작은 모델은 LLM의 디코드와 같은 모양입니다. 작업대는 놀고 통로만 바쁩니다.',fix:'여러 요청을 묶으면(배치) 같은 읽기로 더 많이 만듭니다.'},
 DEN_C:{t:'영상 디노이징: 계산 병목',tag:'book',book:'이미지·영상 생성은 잠재 공간 전체를 단계마다 다시 계산하므로 계산에서 막힌다. (교재 2.4.3) 영상 모델은 파라미터 3–5배, 잠재 정보 10–100배라 GPU 8장 노드에서도 배치 1로 돈다. (교재 2.3.3)',easy:'작업대가 쉬지 않고 일합니다. 단계 수 × 2(가이던스)만큼 모델을 통째로 돌리니 시간 대부분이 여기서 듭니다.',fix:'단계 줄이기(퓨스텝은 8단계 이하로 80–90% 빨라짐, 교재 2.3.2) · FP8 · 계산이 빠른 카드'},
 DEN_M:{t:'디노이징이 메모리 병목으로: 어텐션 점수표',tag:'book',book:'표준 어텐션은 N×N 점수표를 창고에 썼다 다시 읽는다. FlashAttention은 불필요한 읽기·쓰기를 없애 품질 손실 없이 빠르게 한다. (교재 2.5)',easy:'토큰이 수만 개라 N×N 점수표가 엄청나게 커서, 계산보다 창고 왕복이 더 오래 걸립니다.',fix:'FlashAttention 켜기. Turing(Quadro RTX 5000)은 FA2가 없어 메모리 효율 커널로 대체합니다.'},
 DEN_P:{t:'PCIe 병목: 창고에 안 들어간 설계도',tag:'ops',book:'메모리 병목인 작업은 계산을 아무리 최적화해도 빨라지지 않는다. (교재 2.4)',easy:'VRAM에 안 들어간 가중치를 순전파마다 트럭(PCIe)으로 실어 와야 합니다. 트럭 길은 창고 통로보다 수십 배 좁아 작업대가 대부분 기다립니다. 루프라인은 "다 들어갈 때"의 그림입니다(본 발표 33장).',fix:'FP8·4비트로 모델 줄이기, VRAM이 큰 카드, PCIe 4.0 이상 보드'},
 OFFLOAD:{t:'오프로딩 시작',tag:'ops',easy:'창고(VRAM)에 다 안 들어가는 가중치를 바깥 창고(시스템 RAM)에 두고 필요할 때 옮기기로 했습니다. 멈추지는 않지만 느려집니다.',fix:'모델을 작게(FP8·4비트) 하거나 큰 VRAM'},
 OOM:{t:'CUDA out of memory (작업 중단)',tag:'ops',easy:'창고에 자리가 없어 작업이 멈췄습니다. 오프로딩을 꺼 두었거나, 작업 메모리(활성값·점수표)만으로도 창고가 넘쳤습니다.',fix:'오프로딩 허용, FlashAttention 켜기(점수표 없앰), 해상도·프레임 줄이기, 큰 VRAM'},
 DEADLOCK:{t:'데드락: 서로가 쥔 창고를 기다림',tag:'ops',easy:'요청 A는 창고 절반을 쥔 채 B가 쥔 나머지를 기다리고, B도 A를 기다립니다. 아무도 내려놓지 않아 공장이 통째로 멈춥니다(순환 대기). GPU 사용률은 0%인데 응답이 없습니다.',fix:'작업 배분을 "순서대로(큐)"로, 기다리다 시간이 지나면 반납, 한 GPU에 모델 하나만 띄우기'},
 THRASH:{t:'동시 작업이 트럭 길을 나눠 씀',tag:'ops',easy:'여러 요청이 각자 오프로딩하며 PCIe를 나눠 씁니다. 각 요청이 더 느려지고 전체도 빨라지지 않습니다.',fix:'큐로 순서대로 처리'},
 SWAP:{t:'시스템 RAM 부족: 디스크 스왑',tag:'ops',easy:'바깥 창고(RAM)마저 넘쳐 디스크를 창고처럼 씁니다. 디스크는 PCIe보다도 훨씬 느려 사실상 멈춘 것처럼 보입니다.',fix:'RAM 늘리기, 모델 줄이기'},
 NOFP8:{t:'FP8 연산 없음: FP16으로 풀어 씀',tag:'ops',easy:'이 GPU는 FP8 텐서 연산을 지원하지 않아(또는 확인되지 않아) FP8 모델을 FP16으로 풀어 계산한다고 보았습니다. 무게가 2배가 됩니다.',fix:'FP8을 지원하는 세대(Ada·Blackwell·RDNA 4 등) 또는 4비트'},
 MEMEFF:{t:'FlashAttention 2 미지원: 메모리 효율 커널로 대체',tag:'ops',book:'FlashAttention은 불필요한 읽기·쓰기를 없앤다. (교재 2.5)',easy:'Turing 세대는 공식 FA2를 쓸 수 없어, 점수표를 쌓지 않는 다른 커널로 대체합니다. 메모리는 아끼지만 어텐션 계산이 30% 정도 더 든다고 보았습니다.',fix:'Ampere 이후 세대'},
 THROTTLE:{t:'열 제한(스로틀링) 83°C',tag:'ops',easy:'GPU가 뜨거워져 스스로 클럭을 낮췄습니다. 계산이 15% 느려지고 전력도 줄어듭니다. 오래된 서버 케이스처럼 공기 흐름이 약하면 자주 일어납니다.',fix:'냉각 강화, 전력 제한 80–90%(성능은 조금만 줄고 열은 크게 줄어듦)'},
 CAP:{t:'전력 제한 적용',tag:'ops',easy:'전력 상한을 낮추면 클럭이 내려가 계산이 느려지지만, 성능은 전력보다 덜 줄어듭니다(여기서는 전력의 0.4제곱으로 가정).',fix:'열이 문제면 80–90%가 흔한 절충점'},
 TIMEOUT:{t:'봇 응답 시간 초과 (httpx 예외)',tag:'ops',easy:'텔레그램 봇이 정해진 시간 안에 답을 못 받아 연결을 끊었습니다. GPU는 계속 일하고 있는데 사용자 화면에는 "실패"로 보입니다. 본 발표 9장 사례의 마지막 줄이 이것입니다.',fix:'봇은 "접수했어요"만 바로 답하고, 완성되면 따로 보내기(비동기 알림)'},
 VAE_TILE:{t:'VAE를 타일로 나눠 펼침',tag:'ops',easy:'큰 영상을 한 번에 펼칠 자리가 없어 조각으로 나눠 펼칩니다. 멈추지는 않지만 50% 정도 느려진다고 보았습니다.',fix:'VRAM 여유 확보, 해상도·프레임 줄이기'},
 FEWSTEP:{t:'퓨스텝 영역 (8단계 이하)',tag:'book',book:'퓨스텝 모델은 8단계 이하로 80–90% 빠르게 만든다. (교재 2.3.2)',easy:'단계를 크게 줄였습니다. 일반 모델을 그냥 단계만 줄이면 품질이 떨어지고, 퓨스텝용으로 증류된 모델이어야 품질을 지킵니다.',fix:'퓨스텝용 모델(증류 모델) 쓰기'},
 DONE:{t:'완료',tag:'ops',easy:'영상이 완성되어 전송됐습니다. 총 시간·전력량·요금은 ② 계기판과 ④ 비교에서 볼 수 있습니다.',fix:''}};

/* ===== 설정 읽기 ===== */
var P={};
function readP(){P={g:$('#cG').value,pci:+$('#cPci').value,ram:+$('#cRam').value,m:$('#cM').value,pr:$('#cPr').value,res:+$('#cRes').value,F:+$('#cF').value,S:+$('#cS').value,
  cfg:$('#cCfg').getAttribute('aria-pressed')==='true',fa:$('#cFa').getAttribute('aria-pressed')==='true',off:$('#cOff').getAttribute('aria-pressed')==='true',
  k:+$('#cK').value,sch:$('#cSch').value,to:+$('#cTo').value,cap:+$('#cCap').value/100,cool:$('#cCool').value,room:+$('#cRoom').value,won:+$('#cWon').value};
  $('#vF').textContent=P.F+'장 ('+(P.F/16).toFixed(1)+'초)';$('#vS').textContent=P.S;$('#vK').textContent=P.k;$('#vCap').textContent=Math.round(P.cap*100)+'%';$('#vRoom').textContent=P.room+'°C';return P}

/* ===== 계획: 공정별 길이와 사건 ===== */
function plan(p,gk){var g=GPUS[gk||p.g],M=MODELS[p.m],ev=[],fail=null;
  var bpp=p.pr==='fp16'?2:p.pr==='fp8'?(g.fp8?1:2):.56;if(p.pr==='fp8'&&!g.fp8)ev.push(['NOFP8',0]);
  var fpMul=(p.pr==='fp8'&&g.fp8)?2:1,qo=p.pr==='q4'?1.15:1,Wt=M.P*bpp/1e9,H=RES[p.res][1],W=RES[p.res][0],lat=Math.floor((p.F-1)/4)+1,N=lat*(H/16)*(W/16);
  var act=N*M.d*2*10/1e9,memEff=p.fa&&!g.fa,scores=p.fa?0:N*N*2*4/1e9,ctxGB=.8,work=act+scores+ctxGB,share=p.sch==='share'&&p.k>1,perV=share?g.m/p.k:g.m,avail=perV-work;
  if(memEff)ev.push(['MEMEFF',0]);if(p.cap<1)ev.push(['CAP',0]);if(p.S<=8)ev.push(['FEWSTEP',0]);
  var spill=Math.max(0,Wt-Math.max(0,avail)),inV=Wt-spill,link=LANE[Math.min(p.pci,g.pc[0])]*g.pc[1]*EB,linkName='PCIe '+Math.min(p.pci,g.pc[0])+'.0 x'+g.pc[1];
  var encCPU=ENC_GB+ctxGB>g.m*.95,ramNeed=8+spill*(share?p.k:1)+(encCPU?ENC_GB:0),disk=Math.max(0,Math.min(spill,ramNeed-p.ram));
  var info={N:N,Wt:Wt,act:act,scores:scores,spill:spill,inV:inV,perV:perV,link:link/EB,linkName:linkName,bpp:bpp,share:share,encCPU:encCPU,ramNeed:ramNeed,disk:disk,g:g,M:M};
  if(avail<=.3){fail={type:share&&g.m-work>.3?'DEADLOCK':'OOM',ph:share?'load':'den'}}
  else if(spill>0&&!p.off){fail={type:share?'DEADLOCK':'OOM',ph:'load'}}
  var segs=[],mul=share?p.k:1;
  function S(ph,lab,dur,uc,bd,vram,extra){var s={ph:ph,lab:lab,dur:dur*mul,uc:uc,bd:bd,vram:vram,job:extra&&extra.job||1,steps:extra&&extra.steps||0,ev:extra&&extra.ev||[]};segs.push(s);return s}
  var ld=S('load','모델 싣기',inV/link+(spill>0?0:0)+1,.05,'P',inV+ctxGB,{ev:[['LOAD',0]].concat(spill>0&&p.off?[['OFFLOAD',0]]:[]).concat(disk>0?[['SWAP',0]]:[]).concat(share&&spill>0&&p.off?[['THRASH',0]]:[])});
  if(fail&&fail.ph==='load'){ld.dur=Math.max(ld.dur,2);ld.fail=fail.type;return {segs:segs,ev:ev,fail:fail,info:info,jobEnd:[]}}
  var fEff=g.f*1e12*g.e*fpMul/qo,fv=g.f*1e12*g.e,tok=p.F;
  var Fp=2*M.P*N+4*N*N*M.d*M.L,attF=4*N*N*M.d*M.L,tc=(Fp+(memEff?.3*attF:0))/fEff;
  var traffic=inV*1e9+act*2e9+(p.fa?0:4*N*N*2*M.h*M.L),tm=traffic/(g.b*1e12*EB),tp=(spill-disk)/link+disk/.5;
  var pass=Math.max(tc,tm)+tp,passes=p.S*(p.cfg?2:1),bd=tp>Math.max(tc,tm)?'P':tm>tc?'M':'C',denEv=bd==='P'?'DEN_P':bd==='M'?'DEN_M':'DEN_C';
  var vaeF=H*W*p.F*3e4,vaePeak=H*W*p.F*48/1e9,tile=inV+vaePeak+ctxGB>perV,vaeT=vaeF/fv*(tile?1.5:1);
  info.tc=tc;info.tm=tm;info.tp=tp;info.pass=pass;info.passes=passes;info.Fp=Fp;info.bd=bd;
  var jobs=share?1:p.k,jobEnd=[];
  for(var j=1;j<=jobs;j++){var J={job:j};
    S('enc','텍스트 인코더'+(encCPU?' (CPU)':''),encCPU?25:(ENC_GB/link+.6),encCPU?0:.2,encCPU?'U':'P',encCPU?inV+ctxGB:inV+ctxGB+Math.min(ENC_GB,g.m*.5),{job:j,ev:encCPU?[['ENC_CPU',0]]:[]});
    S('mot','동작 생성',tok*(MOT_GB/(g.b*1000*EB)+.004),.08,'M',inV+ctxGB+MOT_GB,{job:j,ev:[['MOT_M',0]]});
    if(fail&&fail.ph==='den'){var fs=S('den','영상 디노이징',2,0,'C',perV,{job:j});fs.fail=fail.type;return {segs:segs,ev:ev,fail:fail,info:info,jobEnd:jobEnd}}
    S('den','영상 디노이징',pass*passes,tc/pass,bd,inV+work,{job:j,steps:p.S,ev:[[denEv,0]]});
    S('vae','VAE 펼치기',vaeT,.85,'C',inV+vaePeak+ctxGB,{job:j,ev:tile?[['VAE_TILE',0]]:[]});
    S('save','저장 · 전송',2,0,'U',inV+ctxGB,{job:j});}
  return {segs:segs,ev:ev,fail:fail,info:info}}

/* ===== 실행기: 시간·전력·열 적분 ===== */
function Runner(p,gk){var pl=plan(p,gk),g=pl.info.g,st={t:0,si:0,sp:0,T:p.room,thr:false,E:0,P:0,done:false,failed:null,log:[],samp:[],bt:{C:0,M:0,P:0,U:0},peakT:p.room,thrN:0,timeouts:0,jobDone:[],started:{}};
  var Pmax=g.w*p.cap,idle=.12*g.w,perfCap=p.cap>=1?1:Math.pow(p.cap,.4),tau=45,rise=RISE[p.cool];
  function L(t,code,msg,cls){st.log.push({t:t,code:code,msg:msg,cls:cls||'i'})}
  pl.ev.forEach(function(e){L(0,e[0],EV[e[0]].t,'w')});
  L(0,null,'요청 접수: "캐릭터 춤춰" × '+p.k+' · '+g.n+' · '+pl.info.M.n+' '+p.pr.toUpperCase()+' · '+rn(p.res)+' '+p.F+'장 · '+p.S+'단계'+(p.cfg?' ×2':''),'ok');
  function seg(){return pl.segs[st.si]}
  function step(dt){if(st.done)return;var s=seg();if(!s){st.done=true;return}
    if(!st.started[st.si]){st.started[st.si]=1;L(st.t,null,'['+s.lab+(pl.segs.length>6?' · 요청 '+s.job:'')+'] 시작 · 병목: '+BND[s.bd][0],'i');s.ev.forEach(function(e){L(st.t,e[0],EV[e[0]].t+(e[0]==='OFFLOAD'?' · '+fmt(pl.info.spill,1)+'GB를 바깥 창고에':e[0]==='DEN_P'?' · 순전파마다 '+fmt(pl.info.spill,1)+'GB를 '+pl.info.linkName+'로':''),e[0]==='DEN_C'?'i':'w')});
      if(s.fail){st.failed=s.fail;L(st.t,s.fail,s.fail==='OOM'?'CUDA error: out of memory — 작업 중단':'데드락 감지: 요청 '+p.k+'개가 서로의 VRAM을 기다림 · GPU 사용률 0%','e');st.done=true;
        if(p.to>0){L(p.to,'TIMEOUT','봇 응답 시간 초과 (httpx 예외) — 사용자에게 실패로 보임','e')}return}}
    var thrF=st.thr?.85:1,perf=perfCap*thrF,rate=1/(1+s.uc*(1/perf-1));
    var P=s.bd==='U'?idle*1.25:idle+(Pmax-idle)*(.3+.7*s.uc)*(st.thr?.82:1);st.P=P;st.E+=P*dt;
    var Tt=p.room+rise*P/g.w;st.T+=(Tt-st.T)*Math.min(1,dt/tau);st.peakT=Math.max(st.peakT,st.T);
    if(!st.thr&&st.T>=TLIM){st.thr=true;st.thrN++;if(st.thrN===1)L(st.t,'THROTTLE',EV.THROTTLE.t+' · 클럭 −15%','w')}else if(st.thr&&st.T<TLIM-4)st.thr=false;
    st.bt[s.bd]+=dt;var adv=dt*rate/Math.max(1e-6,s.dur);st.sp+=adv;st.t+=dt;
    if(p.to>0&&!st.toFired&&st.t>=p.to&&st.jobDone.length<p.k){st.toFired=true;var pend=p.k-st.jobDone.length;st.timeouts=pend;L(p.to,'TIMEOUT','봇 응답 시간 초과 (httpx 예외) · 기다리던 요청 '+pend+'개 — GPU는 계속 일함','e')}
    if(st.sp>=1){st.sp=0;if(s.ph==='save'){for(var jj=0;jj<(pl.info.share?p.k:1);jj++)st.jobDone.push(st.t);L(st.t,null,'요청 '+(pl.info.share?'전체':s.job)+' 영상 완성 · '+hms(st.t),'ok')}st.si++;if(st.si>=pl.segs.length){st.done=true;L(st.t,'DONE','완료 · '+hms(st.t)+' · '+fmt(st.E/3600,1)+'Wh · 약 '+fmt(st.E/3.6e6*p.won,1)+'원'+(st.thrN?' · 열 제한 '+st.thrN+'번':''),'ok')}}}
  return {pl:pl,st:st,step:step,g:g}}
function fastRun(p,gk){var R=Runner(p,gk),est=R.pl.segs.reduce(function(a,s){return a+s.dur},0),dt=Math.max(.25,est/3000),n=0;while(!R.st.done&&n<20000){R.step(dt);n++}return R}


/* 명예의 전당: 기록 = 판마다 설정값. 숫자는 언제나 설정으로 다시 계산한다(같은 설정 → 같은 결과). */
var HOF={REPO:'adminmrobo/inference_engineering_study_week_02_textbook_ch02_p3_to_end_slide',LV:[360,480,720,1080,2160],LABEL:'명예의 전당',BAD:'기록 오류',EXCL:'제외',MARK:'dance-hof v1'};
var HOF_OPT={pci:[3,4,5],ram:[32,64,128],m:['w13','w14'],pr:['fp16','fp8','q4'],F:[17,33,49,65,81],sch:['queue','share'],to:[30,60,600,0],cool:['weak','mid','strong']};
function hofClean(res,q){if(!q||typeof q!=='object')throw new Error(res+'p 설정이 없습니다');
  var p={g:String(q.g),pci:+q.pci,ram:+q.ram,m:q.m,pr:q.pr,res:res,F:+q.F,S:Math.round(+q.S),cfg:q.cfg===true,fa:q.fa===true,off:q.off===true,k:Math.round(+q.k),sch:q.sch,to:+q.to,cap:Math.round(+q.cap*20)/20,cool:q.cool,room:Math.round(+q.room),won:150};
  if(!Object.prototype.hasOwnProperty.call(GPUS,p.g))throw new Error(res+'p: GPU 이름이 맞지 않습니다');
  for(var k in HOF_OPT)if(HOF_OPT[k].indexOf(p[k])<0)throw new Error(res+'p: '+k+' 값이 허용 범위 밖입니다');
  if(!(p.S>=4&&p.S<=50))throw new Error(res+'p: 디노이징 단계는 4~50');if(!(p.k>=1&&p.k<=4))throw new Error(res+'p: 동시 요청은 1~4');
  if(!(p.cap>=.5&&p.cap<=1))throw new Error(res+'p: 전력 제한은 50~100%');if(!(p.room>=18&&p.room<=35))throw new Error(res+'p: 실내 온도는 18~35°C');return p}
function hofStars(st){return [!st.failed,!st.failed&&!st.timeouts,!st.failed&&st.thrN===0]}
function hofOfficial(p){return p.F===81&&p.S>=20&&p.cfg}
function hofEval(rec){if(!rec||rec.v!==1||!rec.levels||typeof rec.levels!=='object')throw new Error('기록 형식(v1)이 맞지 않습니다');
  var out={levels:{},n:0,off:{maxRes:0,stars:0,t:0,wh:0,n:0},free:{maxRes:0,stars:0,t:0,wh:0,n:0}};
  HOF.LV.forEach(function(res){var q=rec.levels[res];if(!q)return;var p=hofClean(res,q),R=fastRun(p,p.g),st=R.st,ns=hofStars(st).filter(Boolean).length,ok=!st.failed,of=ok&&hofOfficial(p);
    var L={p:p,ok:ok,fail:st.failed||null,stars:ok?ns:0,t:st.t,wh:st.E/3600,official:of,peakT:st.peakT};out.levels[res]=L;out.n++;
    [[ok,out.free],[of,out.off]].forEach(function(z){if(!z[0])return;var o=z[1];o.maxRes=Math.max(o.maxRes,res);o.stars+=ns;o.t+=st.t;o.wh+=L.wh;o.n++})});
  if(!out.n)throw new Error('판 기록이 하나도 없습니다');return out}
function hofCmp(a,b,free){var A=free?a.free:a.off,B=free?b.free:b.off;return (B.maxRes-A.maxRes)||(B.stars-A.stars)||(A.t-B.t)||(A.wh-B.wh)}
function hofParse(body){var s=String(body||'');if(s.indexOf(HOF.MARK)<0)throw new Error('명예의 전당 기록 표시('+HOF.MARK+')가 없습니다');var m=/```json\s*([\s\S]*?)```/.exec(s);if(!m)throw new Error('기록 블록(```json)이 없습니다');
  try{return JSON.parse(m[1])}catch(e){throw new Error('기록 블록의 JSON 형식이 깨졌습니다')}}

module.exports={HOF:HOF,hofEval:hofEval,hofParse:hofParse,hofCmp:hofCmp,GPUS:GPUS};
