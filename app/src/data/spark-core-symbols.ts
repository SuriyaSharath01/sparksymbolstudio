import type { MulberrySymbol } from './symbols';

const CORE_META: Record<string, { label: string; tags: string[] }> = {
  i_me: { label: 'I / Me', tags: ['i', 'me', 'my', 'myself', 'self', 'core', 'pronoun', 'persona'] },
  i_me_girl: { label: 'I / Me (Girl)', tags: ['i', 'me', 'girl', 'child', 'daughter', 'persona', 'she'] },
  i_me_boy: { label: 'I / Me (Boy)', tags: ['i', 'me', 'boy', 'child', 'son', 'persona', 'he'] },
  i_me_woman: { label: 'I / Me (Woman)', tags: ['i', 'me', 'woman', 'lady', 'mum', 'persona', 'she'] },
  i_me_older_woman: { label: 'I / Me (Older Woman)', tags: ['i', 'me', 'older woman', 'elderly woman', 'nan', 'gran', 'grandma', 'persona', 'she'] },
  i_me_older_man: { label: 'I / Me (Older Man)', tags: ['i', 'me', 'older man', 'elderly man', 'grandad', 'grandpa', 'persona', 'he'] },
  you: { label: 'You / Your', tags: ['you', 'your', 'yourself', 'core', 'pronoun'] },
  we: { label: 'We / Us', tags: ['we', 'us', 'our', 'together', 'group', 'core'] },
  she_her: { label: 'She / Her', tags: ['she', 'her', 'hers', 'female', 'woman', 'pronoun'] },
  he_him: { label: 'He / Him', tags: ['he', 'him', 'his', 'male', 'man', 'pronoun'] },
  they_them: { label: 'They / Them', tags: ['they', 'them', 'their', 'theirs', 'pronoun', 'group'] },
  girl: { label: 'Girl', tags: ['girl', 'daughter', 'child', 'young girl', 'female'] },
  boy: { label: 'Boy', tags: ['boy', 'son', 'child', 'young boy', 'male'] },
  teenage_girl: { label: 'Teenage Girl', tags: ['teenage girl', 'teen girl', 'teenager', 'youth', 'female'] },
  teenage_boy: { label: 'Teenage Boy', tags: ['teenage boy', 'teen boy', 'teenager', 'youth', 'male'] },
  woman: { label: 'Woman', tags: ['woman', 'lady', 'adult woman', 'middle aged woman', 'mum', 'mother', 'female'] },
  man: { label: 'Man', tags: ['man', 'gentleman', 'adult man', 'middle aged man', 'dad', 'father', 'male'] },
  older_woman: { label: 'Older Woman', tags: ['older woman', 'elderly woman', 'senior woman', 'nan', 'nana', 'gran', 'grandma', 'grandmother'] },
  older_man: { label: 'Older Man', tags: ['older man', 'elderly man', 'senior man', 'grandad', 'grandpa', 'grandfather'] },
  doctor: { label: 'Doctor', tags: ['doctor', 'gp', 'physician', 'consultant', 'clinician', 'nhs', 'medical'] },
  doctor_woman: { label: 'Doctor (Woman)', tags: ['doctor', 'female doctor', 'lady doctor', 'gp', 'clinician', 'nhs'] },
  nurse: { label: 'Nurse', tags: ['nurse', 'district nurse', 'clinician', 'nhs', 'healthcare', 'care'] },
  support_worker: { label: 'Support Worker', tags: ['support worker', 'carer', 'care worker', 'staff', 'key worker', 'priory'] },
  clinic: { label: 'Clinic / Health Centre', tags: ['clinic', 'surgery', 'gp surgery', 'health centre', 'hospital', 'nhs'] },
  hospital_passport: { label: 'Hospital Passport', tags: ['hospital passport', 'health passport', 'nhs', 'care plan', 'ais', 'cqc'] },
  cup_of_tea: { label: 'Cup of Tea', tags: ['cup of tea', 'tea', 'cuppa', 'brew', 'hot drink', 'refreshment'] },
  home: { label: 'Home', tags: ['home', 'house', 'flat', 'residence', 'accommodation', 'living'] },
  first: { label: 'First / Now', tags: ['first', 'now', 'step 1', 'start', 'begin', 'sequence', 'visual schedule'] },
  then: { label: 'Then / Next', tags: ['then', 'next', 'later', 'after', 'sequence', 'transition'] },
  have: { label: 'Have / Get', tags: ['have', 'get', 'got', 'hold', 'core'] },
  going_to: { label: 'Going To', tags: ['going to', 'go', 'walk', 'heading', 'move', 'transition'] },
  see: { label: 'See / Look', tags: ['see', 'look', 'watch', 'view', 'sight'] },
  ask: { label: 'Ask / Question', tags: ['ask', 'question', 'query', 'speak', 'communicate'] },
  ask_woman: { label: 'Ask / Question (Woman)', tags: ['ask', 'question', 'woman', 'female', 'speak'] },
  listen: { label: 'Listen / Hear', tags: ['listen', 'hear', 'sound', 'ear', 'attention'] },
  listen_woman: { label: 'Listen / Hear (Woman)', tags: ['listen', 'hear', 'woman', 'female', 'ear'] },
  bring: { label: 'Bring / Carry', tags: ['bring', 'carry', 'fetch', 'take', 'folder'] },
  wait: { label: 'Wait', tags: ['wait', 'hold on', 'patient', 'clock', 'delay'] },
  help: { label: 'Help', tags: ['help', 'support', 'assist', 'assistance', 'aid', 'core'] },
  decide: { label: 'Decide / Choose', tags: ['decide', 'choose', 'choice', 'option', 'consent', 'mca'] },
  quiet_break: { label: 'Quiet Break', tags: ['quiet break', 'break', 'rest', 'quiet time', 'pause', 'sensory'] },
  time: { label: 'Time / Clock', tags: ['time', 'clock', 'when', 'hour', 'schedule', 'routine'] },
  yes: { label: 'Yes', tags: ['yes', 'agree', 'ok', 'okay', 'correct', 'confirm'] },
  no: { label: 'No', tags: ['no', 'not', 'decline', 'refuse', 'stop'] },
  calm: { label: 'Calm', tags: ['calm', 'relax', 'breathe', 'peaceful', 'steady', 'regulation'] },
  calm_woman: { label: 'Calm (Woman)', tags: ['calm', 'relax', 'breathe', 'woman', 'female', 'peaceful'] },
  calm_older_woman: { label: 'Calm (Older Woman)', tags: ['calm', 'relax', 'breathe', 'older woman', 'elderly woman', 'nan', 'gran'] },
  safe: { label: 'Safe', tags: ['safe', 'safety', 'secure', 'protect', 'safeguarding'] },
};

function formatFallbackLabel(id: string): string {
  return id
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const SPARK_CORE_48_SYMBOLS: MulberrySymbol[] = Object.keys(CORE_META).map((id) => {
  const meta = CORE_META[id];
  return {
    id: `spark_core_${id}`,
    label: meta ? meta.label : formatFallbackLabel(id),
    filename: `${id}.svg`,
    svgPath: `/symbols/spark-core/${id}.svg`,
    tags: meta ? [...meta.tags, 'spark core', 'spark', 'aac'] : [id.replace(/_/g, ' '), 'spark core', 'spark'],
    category: 'Spark Core (Inclusive 48)',
  };
});
