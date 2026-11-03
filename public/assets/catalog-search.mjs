// AI LAB search: Russian morphology, intent aliases, typo tolerance and evidence-based ranking
// All responses are selected from real public portfolio records; no generated products.
const STOP=new Set(["я","мне","мы","нам","надо","нужно","пожалуйста","хочу","чтобы","как","где","какой","какая","какие","можно","есть","найди","найти","подбери","подобрать","ищу","помоги","сделай","сделать","использовать","использую","могу","для","при","в","на","по","из","к","ко","с","со","у","о","об","и","или","а","это","этот","эти","моя","мой","мои","не","от","до","что","если","про","мне","бы"]);
const ENDINGS=/(иями|ями|ами|ейший|ейшая|ующими|ющими|ования|ование|ением|ения|ение|ость|ости|овка|ивки|ующих|ющая|ющий|ать|ять|ить|ется|ются|ился|илась|ают|яют|ется|ого|ему|ами|ями|ов|ев|ах|ях|ой|ей|ым|им|ых|их|ую|юю|ая|яя|ое|ее|ые|ие|ий|ый|ое|ам|ям|ом|ем|а|я|ы|и|е|у|ю)$/u;
export const normalizeSearch=value=>String(value??"").toLowerCase().normalize("NFKC").replace(/ё/g,"е").replace(/[^a-zа-я0-9+#]+/gu," ").replace(/\s+/g," ").trim();
export function stem(word){
 const w=normalizeSearch(word);
 if(w.length<5||/^[a-z0-9]+$/.test(w))return w;
 const s=w.replace(ENDINGS,"");
 return s.length>=4?s:w;
}
export const tokens=value=>normalizeSearch(value).split(" ").filter(w=>w.length>=2&&!STOP.has(w)).map(stem);
const themes=[
 {keys:["приказ","отпуск","кадров","документ сотрудник","трудов договор","штат","отдел кадров"],products:["hr","schoollaw","yougile-agent"]},
 {keys:["расшифровка","транскрипция","диктофон","аудио в текст","превратить звук в текст","распознать речь","запись разговора"],products:["gigaam-fast","meeting-summaries","gigaam-voice"]},
 {keys:["голосовой помощник","голосом","говорящий","озвучка","синтез речи","речевой ввод"],products:["gigaam-voice","student","voice-meta-smm"]},
 {keys:["вакансия","резюме","найти работу","трудоустройство","собеседование","отклик"],products:["job-search","cv-editor","career-advisor"]},
 {keys:["кем стать","выбор профессии","профориентация","профессия для ребенка","будущая профессия"],products:["career","career-advisor"]},
 {keys:["урок","обучить нейросети","занятия с ии","курс ии","освоить ии","научиться использовать ии"],products:["course","deepseek-school","curriculum-spo"]},
 {keys:["презентация","слайд","питч дек","доклад оформить","сделать слайды"],products:["presentation-master","html-presentation","deepseek-school"]},
 {keys:["смонтировать видео","обработать ролик","ffmpeg","конвертировать видео","нарезать видео","смонтировать фильм"],products:["davinci","ffmpeg","film","syntx-video"]},
 {keys:["придумать ролик","рилс","reels","видео для рекламы","короткое видео","ролик для соцсетей"],products:["reels-ideas","syntx-video","film","voice-meta-smm","video-descriptions"]},
 {keys:["картинка для сказки","нарисовать комикс","сказку","история с картинками","иллюстрации"],products:["fairytale-illustrator","fairytales","comic-student"]},
 {keys:["продать","реклама","привлечь клиента","вывести на рынок","стратегия продвижения","контент для соцсетей"],products:["g2m","commercial-proposal","voice-meta-smm","avitolog"]},
 {keys:["сайт","гитхаб","github","pages","опубликовать сайт","деплой","репозиторий"],products:["github-v2","zcode-mentor","pc-bridge"]},
 {keys:["vpn","прокси","сеть","интернет","vless","подключение","сетевая ошибка"],products:["netwibe","network-mixer","dispatcher","yandex-bridge"]},
 {keys:["пк","компьютер","windows","почистить компьютер","программы на пк","системный сбой"],products:["school-iron","dispatcher","pc-organizer","school-equipment"]},
 {keys:["настроить задачи","напоминание","план на день","организовать дела","контроль задач"],products:["kontur","yougile-agent","yougile-operator"]},
 {keys:["написать текст","отредактировать","письмо клиенту","копирайт","редактор текста"],products:["write","video-descriptions","commercial-proposal"]},
 {keys:["научная статья","научное исследование","диссертация","эксперимент","источники науки"],products:["dissert","physics-experiment","ai-news"]},
 {keys:["готовить еду","рецепт","что приготовить","обед","ужин","хлеб","выпечка","печь хлеб"],products:["home-cook","bread-baker"]},
 {keys:["дрон","беспилотник","бвс","бпла","согласовать полет"],products:["drone-permit"]},
 {keys:["медицинский вопрос","педиатр","ребенок заболел","кожа","дерматолог","травма"],products:["pediatric-guide","derma-guide","trauma-guide"]},
 {keys:["эмоции","общение","отношения","конфликт","психология","привычки","личная цель"],products:["co-sensus","triad","sage","psych-assistant","psi-coach"]}
];
const groupAliases=[
 ["ии","ai","нейросеть","нейросети","нейронка","llm","искусственный интеллект"],
 ["звук","аудио","голос","речь","диктофон","запись"],
 ["видео","ролик","клип","рилс","reels","видеозапись"],
 ["документ","документы","бумаги","бланк","формуляр"],
 ["работа","вакансия","карьера","должность","трудоустройство"],
 ["школа","школьный","образование","учеба","урок"],
 ["монтировать","монтаж","нарезка","склейка"],
 ["текст","написание","редактура","описание"],
 ["фото","рисунок","изображение","иллюстрация"],
 ["компьютер","пк","windows","ноутбук"]
].map(g=>g.map(stem));
function closeWord(a,b){
 if(a===b)return 1;
 if(a.length>=4&&b.length>=4&&(a.startsWith(b)||b.startsWith(a)))return .73;
 if(a.length<5||b.length<5||Math.abs(a.length-b.length)>2||a[0]!==b[0])return 0;
 // bounded Levenshtein, max 2 errors, penalize typo matches
 const dist=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let last=dist[0];dist[0]=i;
  for(let j=1;j<=b.length;j++){const was=dist[j];dist[j]=Math.min(dist[j]+1,dist[j-1]+1,last+(a[i-1]===b[j-1]?0:1));last=was;}
 }
 const d=dist[b.length];return d===1?.62:d===2&&a.length>=7?.34:0;
}
function relatedTerms(term){
 const out=new Map([[term,1]]);
 for(const g of groupAliases)if(g.includes(term)){for(const alt of g)out.set(alt,alt===term?1:.65);}
 return out;
}
function countMatch(term,textTokens){
 let best=0;
 for(const [alt,factor] of relatedTerms(term)){
  for(const word of textTokens){const score=closeWord(alt,word)*factor;if(score>best)best=score;if(best===1)return 1;}
 }
 return best;
}
export function searchRank(record,q){
 const needle=normalizeSearch(q),terms=[...new Set(tokens(needle))];
 if(!terms.length)return 0;
 const fields=[
 [record.title,16],[record.search_aliases?.join(" "),14],[record.public_pitch||record.subtitle,7],
 [record.problem,6],[(record.capabilities||[]).join(" "),5],[record.tags,4],[record.category,2]
 ];
 let score=0,matched=0;
 for(const term of terms){
  let best=0;
  for(const [text,weight] of fields){
   if(!text)continue;
   const words=[...new Set(tokens(text))],m=countMatch(term,words);
   if(m>0)best=Math.max(best,m*weight);
  }
  if(best>0){score+=best;matched++;}
 }
 // Fraction of information words matched, so long natural-language prompts remain usable
 if(matched)score*=.55+.45*matched/terms.length;
 if(fields.some(([txt])=>txt&&normalizeSearch(txt).includes(needle)))score+=18;
 for(const theme of themes){
  const triggered=theme.keys.some(key=>{
    const k=tokens(key);
    return k.length===1?terms.some(term=>closeWord(term,k[0])>=.72):
      k.every(word=>terms.some(t=>closeWord(t,word)>=.7));
  });
  if(triggered&&theme.products.includes(record.id))score+=22-Math.min(10,theme.products.indexOf(record.id)*2);
 }
 return score>=2.7?score:0;
}
export function rankProducts(data,query){
 if(!normalizeSearch(query))return data.slice();
 const scored=data.map((record,i)=>({record,score:searchRank(record,query),i})).filter(x=>x.score>0);
 scored.sort((a,b)=>b.score-a.score||a.i-b.i);
 return scored.map(x=>x.record);
}
export function searchSuggestions(data,query,size=4){
 return rankProducts(data,query).slice(0,size).map(r=>({id:r.id,title:r.title,detail:r.detail}));
}
