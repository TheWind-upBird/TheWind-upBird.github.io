(()=>{
const SCHEMA_VERSION='1.0.0';
const TRACK_ID='hot100';
const MIGRATED_SLUGS=['group-anagrams','longest-consecutive-sequence','move-zeroes'];
const curriculum=window.HOT100_CURRICULUM||[];
const lessons=window.HOT100_LESSONS||{};
const intros=window.HOT100_BEGINNER_INTUITION||{};
const teaching=window.HOT100_HANDCRAFTED||{};

function clone(value){return JSON.parse(JSON.stringify(value))}
function freeze(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}
function required(value,label){if(!value)throw new Error(`SolveShift content schema: missing ${label}`);return value}

const records=MIGRATED_SLUGS.map(slug=>{
  const index=curriculum.findIndex(problem=>problem.slug===slug);
  const problem=clone(required(curriculum[index],`${slug}.problem`));
  const record=Object.freeze({
    schemaVersion:SCHEMA_VERSION,
    id:`${TRACK_ID}:${slug}`,
    track:freeze({id:TRACK_ID,position:index+1}),
    problem,
    teaching:freeze({
      intro:clone(required(intros[slug],`${slug}.teaching.intro`)),
      lesson:clone(required(lessons[slug],`${slug}.teaching.lesson`)),
      cards:clone(required(teaching[slug],`${slug}.teaching.cards`))
    }),
    editorial:freeze({
      contentVersion:'2026.08.27',
      author:'SolveShift',
      reviewStatus:'beta-internal',
      reviewedBy:['automated-content-qa'],
      sourceKind:'original-teaching-content',
      rightsStatus:'formal-audit-required-before-paid-release'
    }),
    migration:freeze({sourceFormat:'legacy-fragments',status:'runtime-canonical'})
  });
  curriculum[index]=record.problem;
  lessons[slug]=record.teaching.lesson;
  intros[slug]=record.teaching.intro;
  teaching[slug]=record.teaching.cards;
  return record;
});
const bySlug=Object.freeze(Object.fromEntries(records.map(record=>[record.problem.slug,record])));

window.SOLVESHIFT_CONTENT=Object.freeze({
  schemaVersion:SCHEMA_VERSION,
  trackId:TRACK_ID,
  records:Object.freeze(records),
  migratedSlugs:Object.freeze([...MIGRATED_SLUGS]),
  get(slug){return bySlug[slug]||null},
  has(slug){return Boolean(bySlug[slug])}
});
})();
