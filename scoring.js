/* Deterministic, explainable local scoring. No random input affects a test result. */
(function () {
  const D=window.STAR_DATA;
  function score(answers){
    if(!Array.isArray(answers)||answers.length!==D.questions.length)throw new Error('答案数量不正确');
    const totals=Object.fromEntries(D.dimensions.map(d=>[d.id,0]));
    const caps=Object.fromEntries(D.dimensions.map(d=>[d.id,0]));
    const laneScores=Object.fromEntries(Object.keys(D.lanes).map(l=>[l,0]));
    D.questions.forEach((q,i)=>{
      const selected=q.options.find(o=>o.id===answers[i]);
      D.dimensions.forEach(d=>caps[d.id]+=Math.max(...q.options.map(o=>o.weights[d.id]||0)));
      if(!selected)return;
      Object.entries(selected.weights).forEach(([key,val])=>totals[key]+=val);
      laneScores[selected.lane]+=(q.dim==='career'?3:1.1);
    });
    // Centre each dimension around its neutral answer-pattern baseline. This prevents
    // dimensions with more secondary-weight opportunities from dominating the profile.
    const baselines={camera:47,stage:48,create:35,social:44,style:42,team:42,resilience:65,viral:51,training:55,career:75};
    const scores=Object.fromEntries(D.dimensions.map(d=>{
      const raw=100*totals[d.id]/Math.max(caps[d.id],1);
      return [d.id,Math.max(0,Math.min(100,Math.round(50+(raw-baselines[d.id])*1.6)))];
    }));
    const totalLane=Object.values(laneScores).reduce((a,b)=>a+b,0)||1;
    const topLane=Math.max(...Object.values(laneScores));
    scores.career=Math.max(0,Math.min(100,Math.round(50+((45+Math.min(45,(topLane/totalLane)*105))-75)*2.1)));
    const maxLane=topLane||1;
    const ranked=D.types.map(t=>{
      const similarity=D.dimensions.reduce((sum,d,i)=>sum+(1-Math.abs(scores[d.id]-t.vector[i])/100)*(d.id==='career'?.5:1),0)/9.5;
      const laneAffinity=laneScores[t.lane]/maxLane;
      return {id:t.id,match:Math.round((.86*similarity+.14*laneAffinity)*100)};
    }).sort((a,b)=>b.match-a.match||a.id-b.id);
    const first=ranked[0],second=ranked[1];
    const hidden=ranked.find(r=>D.types.find(t=>t.id===r.id).lane!==D.types.find(t=>t.id===first.id).lane&&r.id!==second.id)||ranked[2];
    return {scores,laneScores,ranked,first,second,hidden,completed:answers.filter(Boolean).length};
  }
  window.STAR_SCORING={score};
})();
