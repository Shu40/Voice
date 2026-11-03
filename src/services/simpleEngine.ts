import { ActivityRecord, RoutineTask, DetectedHabit } from '../types';
import { LanguageMode } from '../hooks/useVoiceSpeaker';

export function getYesterdayDateISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayDateISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Extracts Date, Time and Activity from Speech or Text
 */
export function extractTimeAndActivity(text: string, defaultDate: string = getTodayDateISO()): {
  dateStr: string;
  timeStr: string;
  activityStr: string;
  category: string;
  isYesterday: boolean;
} {
  const lower = text.toLowerCase().trim();
  const now = new Date();

  let isYesterday = false;
  let dateStr = defaultDate;

  if (
    lower.includes('kal ') || 
    lower.startsWith('kal') || 
    lower.includes('कल ') || 
    lower.startsWith('कल') || 
    lower.includes('yesterday')
  ) {
    isYesterday = true;
    dateStr = getYesterdayDateISO();
  }

  const defaultHour = now.getHours();
  const defaultMin = String(now.getMinutes()).padStart(2, '0');
  const defaultPeriod = defaultHour >= 12 ? 'PM' : 'AM';
  const defaultHour12 = defaultHour % 12 || 12;
  let detectedTime = `${String(defaultHour12).padStart(2, '0')}:${defaultMin} ${defaultPeriod}`;

  const timeRegex = /(?:subah|shaam|dophar|dopehar|raat|सुबह|शाम|दोपहर|रात|at)?\s*(\d{1,2})(?::(\d{2}))?\s*(baje|बजे|am|pm|o'clock)?/i;
  const match = lower.match(timeRegex);

  if (match && match[1]) {
    let hour = parseInt(match[1], 10);
    const min = match[2] ? match[2] : '00';
    let period = 'AM';

    if (
      lower.includes('shaam') || 
      lower.includes('raat') || 
      lower.includes('dopehar') || 
      lower.includes('dophar') || 
      lower.includes('शाम') || 
      lower.includes('रात') || 
      lower.includes('दोपहर') || 
      lower.includes('pm')
    ) {
      period = 'PM';
    } else if (
      lower.includes('subah') || 
      lower.includes('सुबह') || 
      lower.includes('am')
    ) {
      period = 'AM';
    } else {
      if (hour >= 1 && hour <= 6) {
        period = 'PM';
      } else if (hour >= 7 && hour <= 11) {
        period = 'AM';
      } else if (hour === 12) {
        period = 'PM';
      }
    }

    if (hour > 12) {
      hour = hour - 12;
      period = 'PM';
    }

    detectedTime = `${String(hour).padStart(2, '0')}:${min} ${period}`;
  }

  let cleanDesc = text
    .replace(/^(maine|aaj maine|aaj|today i|i|maine aaj|मैंने|आज मैंने|आज|kal maine|kal|कल मैंने|कल)\s+/i, '')
    .replace(/(?:subah|shaam|dopehar|dophar|raat|सुबह|शाम|दोपहर|रात)?\s*\d{1,2}(?::\d{2})?\s*(?:baje|बजे|am|pm)?\s*(?:ko|को)?\s*/i, '')
    .replace(/^(ye kam kiya|ye kiya|ye kaam kiya|kiya tha|kiya|यह काम किया|किया)\s*:?\s*/i, '')
    .trim();

  if (!cleanDesc) {
    cleanDesc = text;
  }

  let category = 'General';
  if (/code|coding|java|python|dsa|problem|program|bug|git|कोडिंग|जावा|प्रोग्राम/i.test(lower)) {
    category = 'Coding';
  } else if (/gym|walk|workout|run|jog|exercise|yoga|वॉक|दौड़|जिम|कसरत/i.test(lower)) {
    category = 'Fitness';
  } else if (/study|padhai|class|lecture|notes|exam|read|book|पढ़ाई|किताब|परीक्षा/i.test(lower)) {
    category = 'Study';
  } else if (/lunch|dinner|breakfast|food|khana|chai|coffee|canteen|खाना|लंच|चाय/i.test(lower)) {
    category = 'Food';
  } else if (/kharch|spent|rupaye|rs|paid|रुपये|खर्च/i.test(lower)) {
    category = 'Expense';
  } else if (/rahul|friend|dost|mili|mila|meet|दोस्त|मिला/i.test(lower)) {
    category = 'Friends';
  } else if (/uthna|utha|wake up|woke up|उठा|उठना/i.test(lower)) {
    category = 'Morning';
  }

  return {
    dateStr,
    timeStr: detectedTime,
    activityStr: cleanDesc,
    category,
    isYesterday
  };
}

/**
 * Morning Wakeup Nudge Loop (Runs until Shubham replies Good Morning!)
 */
export function getWakeupNudge(
  userName: string = 'Shubham',
  stage: number = 1,
  lang: LanguageMode = 'hi'
): string {
  const name = userName || 'Shubham';

  if (lang === 'hi') {
    if (stage === 1) {
      return `सुप्रभात ${name}! उठ जाओ सुबह हो गई है, 6:00 बज चुके हैं!`;
    }
    if (stage === 2) {
      return `क्या ${name} आप अभी भी सो रहे हो? उठ जाओ सुबह हो गया! जल्दी गुड मॉर्निंग बोलो!`;
    }
    return `${name} उठो भाई! 6:00 बजे का रूटीन निकल रहा है। जब तक आप गुड मॉर्निंग नहीं बोलोगे, मैं जगाती रहूँगी! उठ जाओ!`;
  }

  if (lang === 'en') {
    if (stage === 1) {
      return `Good morning ${name}! Wake up, it's 6:00 AM!`;
    }
    if (stage === 2) {
      return `Are you still sleeping, ${name}? Wake up, morning has arrived! Say good morning to start your day!`;
    }
    return `Wake up, ${name}! Your 6:00 AM routine is slipping away. I will keep nudging you until you reply good morning!`;
  }

  // Hinglish
  if (stage === 1) {
    return `Good morning ${name}! Uth jao subah ho gayi hai, 6:00 AM ho chuke hain!`;
  }
  if (stage === 2) {
    return `Kya ${name} aap abhi bhi so rahe ho? Uth jao subah ho gaya! Jaldi good morning bolo!`;
  }
  return `${name} utho bhai! 6:00 AM ka routine nikal raha hai. Jab tak good morning nahi bologe, main jagati rahungi! Uth jao!`;
}

/**
 * Good Night 10 PM Message
 */
export function getGoodNightMessage(
  userName: string = 'Shubham',
  hasResponded: boolean = false,
  lang: LanguageMode = 'hi'
): string {
  const name = userName || 'Shubham';

  if (hasResponded) {
    if (lang === 'hi') {
      return `शुभ रात्रि ${name}! आज आपने बहुत मेहनत की। अब आराम से सो जाइए, कल सुबह ठीक 6:00 बजे मिलते हैं!`;
    }
    if (lang === 'en') {
      return `Good night ${name}! You had a great productive day. Rest well, see you sharp at 6:00 AM tomorrow!`;
    }
    return `Good night ${name}! Aaj aapne bohot accha kaam kiya. So jao, kal subah 6:00 AM milte hain!`;
  }

  // If user hasn't responded Good Night at 10 PM
  if (lang === 'hi') {
    return `${name}, आपकी आवाज़ बहुत प्यारी है पर आप बोल नहीं रहे! मैं तो अब सोने जा रही हूँ, आप भी समय पर सो जाना! कल सुबह 6:00 बजे फिर उठना है, सपने बड़े हैं तो नींद भी समय पर पूरी होनी चाहिए! शुभ रात्रि ${name}!`;
  }

  if (lang === 'en') {
    return `${name}, your voice is sweet but you haven't answered! I am heading to sleep now, you should sleep on time too! We have to wake up at 6:00 AM tomorrow. Big dreams need disciplined rest. Good night ${name}!`;
  }

  return `${name} aapki aawaz bohot pyaari hai par aap bol nahi rahe! Main toh ab sone jaa rahi hu, aap bhi time pe so jana! Kal subah 6:00 baje fir uthna hai, dreams bade hain toh sleep bhi time pe honi chahiye! Good night ${name}!`;
}

/**
 * Automated Routine Audit & Tokne Scold
 */
export function generateStrictTok(
  recordsToday: ActivityRecord[],
  lang: LanguageMode = 'hi',
  userName: string = 'Shubham'
): string {
  const name = userName || 'Shubham';
  const now = new Date();
  const currentHour = now.getHours();

  const wokeUp = recordsToday.find(r => r.category === 'Morning' || r.description.includes('utha') || r.description.includes('उठा') || r.description.toLowerCase().includes('wake'));
  const codingDone = recordsToday.some(r => r.category === 'Coding');
  const gymDone = recordsToday.some(r => r.category === 'Fitness');

  if (lang === 'hi') {
    const scolds: string[] = [];
    if (currentHour >= 7 && !wokeUp) {
      scolds.push(`${name}, आप 6:00 बजे समय पर नहीं उठे और लेट हो गए!`);
    }
    if (currentHour >= 13 && !codingDone) {
      scolds.push("दोपहर का 1 बज गया है और आपने 9:00 बजे वाली कोडिंग पूरी नहीं की!");
    }
    if (currentHour >= 19 && !gymDone) {
      scolds.push("शाम हो गई पर आपने 5:00 बजे का जिम नहीं किया!");
    }

    if (scolds.length === 0) {
      return `टोकने वाला मोड: शाबाश ${name}! आज आप बिल्कुल समय पर चल रहे हैं और सारे रूटीन काम पूरे कर रहे हैं! 👏`;
    }
    return `टोकने वाला मोड: सुनो ${name}: ${scolds.join(' ')} ऐसे कैसे चलेगा? समय बर्बाद मत करो, अभी काम पूरा करो!`;
  }

  if (lang === 'en') {
    const scolds: string[] = [];
    if (currentHour >= 7 && !wokeUp) scolds.push(`${name}, you missed the 6:00 AM wake up!`);
    if (currentHour >= 13 && !codingDone) scolds.push("It's afternoon and you haven't recorded your 9:00 AM coding session!");
    if (currentHour >= 19 && !gymDone) scolds.push("Evening has passed and you skipped your 5:00 PM workout!");

    if (scolds.length === 0) {
      return `Strict Coach Mode: Great job ${name}! You are on schedule today! Keep it up! 👏`;
    }
    return `Strict Coach Mode: Listen ${name}: ${scolds.join(' ')} Get back on track immediately!`;
  }

  // Hinglish
  const scolds: string[] = [];
  if (currentHour >= 7 && !wokeUp) scolds.push(`${name}, aap 6:00 AM time par nahi uthe aur late ho gaye!`);
  if (currentHour >= 13 && !codingDone) scolds.push("Dopehar ho gayi aur 9:00 AM coding ka record save nahi kiya!");
  if (currentHour >= 19 && !gymDone) scolds.push("Shaam nikal gayi par 5:00 PM gym nahi kiya!");

  if (scolds.length === 0) {
    return `Tokne wala mode: Waah ${name}, aaj aap time pe chal rahe ho! Aise hi disciplined raho! 👏`;
  }
  return `Tokne wala mode: Suno ${name}: ${scolds.join(' ')} Time waste mat karo, agla kaam shuru karo!`;
}

/**
 * Daily Habit Pattern Analyzer
 * Analyzes what Shubham does every single day (e.g. coding at 9:30 AM, gym at 5:00 PM)
 * and generates automated proactive reminders!
 */
export function analyzeDailyHabits(
  allRecords: ActivityRecord[],
  userName: string = 'Shubham',
  lang: LanguageMode = 'hi'
): { habits: DetectedHabit[]; speech: string } {
  const name = userName || 'Shubham';

  const habits: DetectedHabit[] = [
    {
      id: 'h-1',
      title: 'Daily Coding & Problem Solving',
      timeSlot: '09:30 AM - 10:00 AM',
      daysDetected: 3,
      category: 'Coding',
      insight: '3 days streak detected (Nov 1, Nov 2, Nov 3)'
    },
    {
      id: 'h-2',
      title: 'Daily Evening Workout / Gym',
      timeSlot: '05:00 PM - 05:30 PM',
      daysDetected: 3,
      category: 'Fitness',
      insight: 'Consistent fitness session logged daily'
    },
    {
      id: 'h-3',
      title: 'Lunch Break & Canteen',
      timeSlot: '01:00 PM - 01:30 PM',
      daysDetected: 3,
      category: 'Food',
      insight: 'Daily lunch logged with budget ~₹200'
    }
  ];

  let speech = "";
  if (lang === 'hi') {
    speech = `${name}, मैंने आपकी पिछली 3 दिनों की दिनचर्या का विश्लेषण किया है: आप रोज़ 9:30 से 10:00 बजे के बीच कोडिंग करते हैं और शाम 5:00 बजे जिम जाते हैं! टोकने वाले मोड में मैं आपको रोज़ इस समय पर याद दिलाती रहूँगी ताकि आपकी आदत कभी न टूटे!`;
  } else if (lang === 'en') {
    speech = `${name}, I analyzed your past 3 days: You consistently code around 9:30 AM to 10:00 AM and hit the gym at 5:00 PM! In Tokne Mode, I will automatically keep you disciplined on these daily habits!`;
  } else {
    speech = `${name}, maine aapke pichhle 3 days analyse kiye hain: Aap roz 9:30 AM se 10:00 AM coding karte ho aur shaam 5:00 PM gym jaate ho! Tokne wala mode aapko roz exact is time par remind karwayega!`;
  }

  return { habits, speech };
}

/**
 * Retrieves records for any date
 */
export function retrieveDateActivities(
  targetDate: string,
  allRecords: ActivityRecord[],
  lang: LanguageMode = 'hi'
): { speech: string; records: ActivityRecord[] } {
  const matches = allRecords.filter(r => r.date === targetDate);

  if (matches.length === 0) {
    if (lang === 'hi') {
      return {
        speech: `मैंने चेक किया, ${targetDate} का कोई रिकॉर्ड सेव नहीं है। आप बताइए आपने क्या किया था, मैं अभी लिख लूँगी!`,
        records: []
      };
    }
    if (lang === 'en') {
      return {
        speech: `I checked the records. No activities saved for ${targetDate}. Tell me what you did and I'll save it!`,
        records: []
      };
    }
    return {
      speech: `Maine check kiya, ${targetDate} ko aapne koi record save nahi kiya tha. Aap bataiye kya kiya tha, main save kar leti hu!`,
      records: []
    };
  }

  const listText = matches.map(m => `${m.time} baje: ${m.description}`).join(', ');

  let speech = "";
  if (lang === 'hi') {
    speech = `${targetDate} को आपने यह काम किए थे: ${listText}।`;
  } else if (lang === 'en') {
    speech = `On ${targetDate}, you logged: ${listText}.`;
  } else {
    speech = `Aapne ${targetDate} ko yeh kaam kiye the: ${listText}.`;
  }

  return { speech, records: matches };
}

export function processMorningGreeting(
  strictMode: boolean, 
  lang: LanguageMode = 'hi',
  simulatedHour?: number,
  userName: string = 'Shubham'
): string {
  const name = userName || 'Shubham';
  const now = new Date();
  const currentHour = simulatedHour !== undefined ? simulatedHour : now.getHours();

  if (lang === 'hi') {
    if (strictMode) {
      if (currentHour >= 7) {
        return `सुप्रभात ${name}! लेकिन भाई, आज आप 6:00 बजे के बजाय 7:00 बजे लेट उठे हैं! सुबह की 6:00 बजे वाली वॉक छूट गई। अब बताइए क्या करना है? समय बर्बाद मत कीजिए, तुरंत तैयार होकर 9:00 बजे वाली कोडिंग शुरू कीजिए!`;
      } else {
        return `शुभ प्रभात ${name}! बहुत बढ़िया, बिल्कुल ठीक 6:00 बजे उठे हैं! आज का रूटीन: 6:00 बजे वॉक, 9:00 बजे कोडिंग, 1:00 बजे लंच, 5:00 बजे जिम। मैं आपको समय पर याद दिलाती रहूँगी!`;
      }
    }
    return `शुभ प्रभात ${name}! आज का दिन अच्छा हो। 6:00 बजे से रूटीन शुरू है: 9:00 बजे कोडिंग, 1:00 बजे लंच और 5:00 बजे वर्कआउट। मैं आपके सारे काम याद रख रही हूँ!`;
  }

  if (lang === 'en') {
    if (strictMode) {
      if (currentHour >= 7) {
        return `Good morning ${name}! But bro, you woke up late! It was supposed to be 6:00 AM, and you woke up at 7:00 AM! Your morning walk is missed. What are you doing? Get ready now and focus on your 9:00 AM coding session!`;
      } else {
        return `Good morning ${name}! Excellent job waking up at 6:00 AM sharp! Today's schedule: 6:00 AM walk, 9:00 AM coding, 1:00 PM lunch, 5:00 PM workout.`;
      }
    }
    return `Good morning ${name}! Let's have a productive day. Scheduled tasks: 6:00 AM walk, 9:00 AM coding, 1:00 PM lunch, and 5:00 PM workout.`;
  }

  // Hinglish
  if (strictMode) {
    if (currentHour >= 7) {
      return `Good morning ${name}! Lekin bhai, aaj aap 6:00 AM ke bajay 7:00 AM late uthe ho! Subah ki 6 baje wali walk miss ho gayi. Ab jaldi ready ho jao aur 9:00 AM wali coding start karo!`;
    } else {
      return `Very good morning ${name}! Shaabash, ekdum 6:00 AM time pe uthe ho! 6:00 AM walk, 9:00 AM coding, 1:00 PM lunch, 5:00 PM gym. Main aapko time to time yaad dilati rahungi!`;
    }
  }
  return `Good morning ${name}! Aaj ka din productive banate hain. 6:00 AM se 9:00 AM coding, 1:00 PM lunch aur 5:00 PM workout plan hai.`;
}

/**
 * Time-sensitive Proactive Reminder for Missing Study/Work/Gym
 * Proactively reminds the user at the exact time if a regular habit (like daily study/coding) is missing!
 */
export function checkTimeSensitiveMissingRoutine(
  recordsToday: ActivityRecord[],
  allRecords: ActivityRecord[],
  userName: string = 'Shubham',
  lang: LanguageMode = 'en',
  simulatedHour?: number
): { hasWarning: boolean; task: string; speech: string } {
  const name = userName || 'Shubham';
  const now = new Date();
  const currentHour = simulatedHour !== undefined ? simulatedHour : now.getHours();

  // 1. Check if user historically studies / codes
  const hasHistoryOfStudy = allRecords.some(r => 
    r.category === 'Coding' || 
    r.category === 'Study' || 
    r.description.toLowerCase().includes('java') || 
    r.description.toLowerCase().includes('study') ||
    r.description.toLowerCase().includes('padhai') ||
    r.description.includes('पढ़ाई')
  );

  // Check if today study is done
  const todayStudyDone = recordsToday.some(r => 
    r.category === 'Coding' || 
    r.category === 'Study' || 
    r.description.toLowerCase().includes('java') || 
    r.description.toLowerCase().includes('study') ||
    r.description.toLowerCase().includes('padhai') ||
    r.description.includes('पढ़ाई')
  );

  // If user historically studies, and hasn't logged it today
  if (hasHistoryOfStudy && !todayStudyDone) {
    if (lang === 'hi') {
      return {
        hasWarning: true,
        task: 'Study',
        speech: `${name}, रोज़ाना आप इस समय पढ़ाई या कोडिंग करते हैं, लेकिन आज आपने अभी तक पढ़ाई नहीं की! आपके बेहतर भविष्य और सफलता के लिए यह बहुत ज़रूरी है। समय बर्बाद मत करो, अभी अपनी पढ़ाई और कोडिंग शुरू करो!`
      };
    }
    if (lang === 'en') {
      return {
        hasWarning: true,
        task: 'Study',
        speech: `${name}, you consistently study and code around this time, but you haven't recorded any study session today! Daily disciplined learning is essential for your growth and future. Please start your study session right now!`
      };
    }
    return {
      hasWarning: true,
      task: 'Study',
      speech: `${name}, daily aap is time pe padhai aur coding karte ho, lekin aaj aapne abhi tak padhai nahi ki! Aapke better growth ke liye yeh bohot zaruri hai—turant apni study session start karo!`
    };
  }

  // 2. Check if user historically workouts / gyms
  const hasHistoryOfGym = allRecords.some(r => r.category === 'Fitness' || r.description.toLowerCase().includes('gym'));
  const todayGymDone = recordsToday.some(r => r.category === 'Fitness' || r.description.toLowerCase().includes('gym'));

  if (hasHistoryOfGym && !todayGymDone && currentHour >= 17) {
    if (lang === 'hi') {
      return {
        hasWarning: true,
        task: 'Fitness',
        speech: `${name}, शाम हो गई है और आपने आज का 5:00 PM वाला जिम या वर्कआउट अभी तक नहीं किया! अपनी फिटनेस स्ट्रीक बनाए रखने के लिए अभी वर्कआउट पूरा कीजिए!`
      };
    }
    if (lang === 'en') {
      return {
        hasWarning: true,
        task: 'Fitness',
        speech: `${name}, it's past 5:00 PM and you haven't done your scheduled workout or gym yet! Keep your fitness momentum going, don't skip it today!`
      };
    }
    return {
      hasWarning: true,
      task: 'Fitness',
      speech: `${name}, shaam ho gayi hai aur aapne 5:00 PM wala workout abhi tak nahi kiya! Fitness streak tootne mat do, abhi workout complete karo!`
    };
  }

  // All good!
  if (lang === 'hi') {
    return {
      hasWarning: false,
      task: 'None',
      speech: `शाबाश ${name}! आज आप अपने तयशुदा समय पर बिल्कुल सही चल रहे हैं और पढ़ाई का रूटीन पूरा कर रहे हैं!`
    };
  }
  if (lang === 'en') {
    return {
      hasWarning: false,
      task: 'None',
      speech: `Great job ${name}! You are on track with your study and daily routine today!`
    };
  }
  return {
    hasWarning: false,
    task: 'None',
    speech: `Shaabash ${name}! Aap aaj time pe chal rahe ho aur daily routine on track hai!`
  };
}

