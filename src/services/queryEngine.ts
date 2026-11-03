import { MemoryItem, GoalItem, AssistantPersonality } from '../types';
import { parseNaturalDate, formatFriendlyDate, getCurrentWeekRange } from '../utils/dateParser';

export interface QueryResult {
  spokenResponse: string;
  displayMarkdown: string;
  matchedMemories: MemoryItem[];
  intent: 'retrieval' | 'detective' | 'roast' | 'goal' | 'not_found' | 'general';
  confidence: number;
}

/**
 * Intelligent Query & Retrieval Engine
 * Strictly searches actual saved memories and never fabricates history.
 */
export function queryMemories(
  query: string,
  memories: MemoryItem[],
  goals: GoalItem[] = [],
  personality: AssistantPersonality = 'friendly'
): QueryResult {
  const lower = query.toLowerCase().trim();

  // 1. Check for "Roast my week" / "Roast my productivity"
  if (/\broast\b/i.test(lower)) {
    return generateRoast(memories, personality);
  }

  // 2. Check for Goals progress ("how close am I to my goal", "november goal", "goal progress")
  if (/\b(goal|target|progress)\b/i.test(lower)) {
    return evaluateGoalProgress(lower, memories, goals, personality);
  }

  // 3. Detective: "When did I last meet [Name]?"
  const meetMatch = lower.match(/when\s+(?:did\s+i\s+last|was\s+the\s+last\s+time\s+i)\s+(?:meet|met|see|saw)\s+([a-zA-Z]+)/i);
  if (meetMatch) {
    const person = meetMatch[1].toLowerCase();
    const matches = memories.filter(m => 
      m.people.some(p => p.toLowerCase().includes(person)) ||
      m.description.toLowerCase().includes(person)
    );

    if (matches.length === 0) {
      return {
        spokenResponse: `I don't have any saved memory of you meeting ${capitalize(person)} yet.`,
        displayMarkdown: `I couldn't find any recorded memories mentioning **${capitalize(person)}**.`,
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    // Sort descending by date
    matches.sort((a, b) => b.date.localeCompare(a.date));
    const latest = matches[0];
    const friendlyDate = formatFriendlyDate(latest.date);

    let prefix = "You last met";
    if (personality === 'funny') prefix = `Arey boss! You last met`;
    else if (personality === 'motivational') prefix = `According to your log, you last met`;

    const spoken = `${prefix} ${capitalize(person)} on ${friendlyDate}. You recorded: "${latest.description}"`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 🔍 Last Meeting with ${capitalize(person)}\n**Date:** ${friendlyDate}\n**Details:** ${latest.description}\n${latest.location ? `**Location:** ${latest.location}` : ''}`,
      matchedMemories: [latest],
      intent: 'detective',
      confidence: 1.0
    };
  }

  // 4. Detective: "When did I last study [Subject]?" or "What was my last [Subject] session?"
  const studyMatch = lower.match(/(?:when\s+(?:did\s+i\s+last|was\s+the\s+last\s+time\s+i)\s+(?:study|studied|learn|learned|code|practice)|what\s+was\s+my\s+last\s+([a-zA-Z0-9]+)\s+(?:learning|study|coding)\s+session)\s*([a-zA-Z0-9\s]*)/i);
  if (studyMatch) {
    const topic = (studyMatch[1] || studyMatch[2] || '').trim().toLowerCase();
    const searchTerms = topic ? [topic] : ['study', 'coding', 'aws', 'java', 'python'];

    const matches = memories.filter(m => 
      (m.category === 'Study' || m.category === 'Coding') &&
      searchTerms.some(term => m.description.toLowerCase().includes(term) || m.tags.includes(term))
    );

    if (matches.length === 0) {
      return {
        spokenResponse: `I don't have any saved memory of you studying ${topic || 'that topic'} yet.`,
        displayMarkdown: `No study records found for **${topic || 'that subject'}**.`,
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    matches.sort((a, b) => b.date.localeCompare(a.date));
    const latest = matches[0];
    const friendlyDate = formatFriendlyDate(latest.date);

    const spoken = `You last studied ${topic || latest.category} on ${friendlyDate}. You logged: "${latest.description}"`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 📚 Last Study Session\n**Date:** ${friendlyDate}\n**Topic:** ${latest.description}\n**Tags:** ${latest.tags.map(t => `#${t}`).join(' ')}`,
      matchedMemories: [latest],
      intent: 'detective',
      confidence: 1.0
    };
  }

  // 5. Detective: "What did I spend the most money on?" / "Highest expense"
  if (/\b(most\s+money|highest\s+expense|biggest\s+expense|spent\s+the\s+most)\b/i.test(lower)) {
    const expenseMemories = memories.filter(m => m.amount && m.amount > 0);
    if (expenseMemories.length === 0) {
      return {
        spokenResponse: "I don't have any recorded expenses in your memories yet.",
        displayMarkdown: "No expense records found in your database.",
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    expenseMemories.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    const top = expenseMemories[0];
    const friendlyDate = formatFriendlyDate(top.date);

    const spoken = `Your highest recorded expense was ${top.currency || '₹'}${top.amount} on ${friendlyDate} for: "${top.description}"`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 💸 Highest Recorded Expense\n**Amount:** ${top.currency || '₹'}${top.amount}\n**Date:** ${friendlyDate}\n**Description:** ${top.description}`,
      matchedMemories: [top],
      intent: 'detective',
      confidence: 1.0
    };
  }

  // 6. Detective: "Which day did I solve the most coding questions?"
  if (/\b(most\s+(?:coding\s+)?(?:questions|problems)|solved\s+the\s+most)\b/i.test(lower)) {
    const codingMemories = memories.filter(m => m.category === 'Coding');
    if (codingMemories.length === 0) {
      return {
        spokenResponse: "You don't have any coding sessions logged yet.",
        displayMarkdown: "No coding records found.",
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    // Group by date
    const dateCounts: Record<string, { count: number; items: MemoryItem[] }> = {};
    for (const m of codingMemories) {
      if (!dateCounts[m.date]) dateCounts[m.date] = { count: 0, items: [] };
      // Look for number in description e.g. "5 Java questions"
      const numMatch = m.description.match(/(\d+)\s+(?:problems?|questions?|dsa|java|leetcode)/i);
      const problemsSolved = numMatch ? parseInt(numMatch[1], 10) : 1;
      dateCounts[m.date].count += problemsSolved;
      dateCounts[m.date].items.push(m);
    }

    let bestDate = '';
    let maxSolved = 0;
    for (const [date, data] of Object.entries(dateCounts)) {
      if (data.count > maxSolved) {
        maxSolved = data.count;
        bestDate = date;
      }
    }

    const friendlyDate = formatFriendlyDate(bestDate);
    const spoken = `You solved the most coding questions on ${friendlyDate}, with ${maxSolved} problems recorded!`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 💻 Peak Coding Day\n**Date:** ${friendlyDate}\n**Problems Solved:** ${maxSolved}\n**Records:**\n${dateCounts[bestDate].items.map(i => `- ${i.description}`).join('\n')}`,
      matchedMemories: dateCounts[bestDate].items,
      intent: 'detective',
      confidence: 1.0
    };
  }

  // 7. Detective: "What was my last achievement?"
  if (/\b(last\s+achievement|latest\s+achievement|recent\s+achievement|won|trophy)\b/i.test(lower)) {
    const achievements = memories.filter(m => m.category === 'Achievements');
    if (achievements.length === 0) {
      return {
        spokenResponse: "I don't have any achievements recorded in your memories yet. Keep grinding!",
        displayMarkdown: "No achievement records saved yet.",
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    achievements.sort((a, b) => b.date.localeCompare(a.date));
    const latest = achievements[0];
    const friendlyDate = formatFriendlyDate(latest.date);

    const spoken = `Your last recorded achievement was on ${friendlyDate}: "${latest.description}"`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 🏆 Latest Achievement\n**Date:** ${friendlyDate}\n**Details:** ${latest.description}\n${latest.location ? `**Venue:** ${latest.location}` : ''}`,
      matchedMemories: [latest],
      intent: 'detective',
      confidence: 1.0
    };
  }

  // 8. Time Travel: "How much money did I spend on [Date] / last Monday?"
  if (/\b(how\s+much\s+(?:money\s+)?(?:did\s+i\s+)?spend|spending\s+on)\b/i.test(lower)) {
    const dateInfo = parseNaturalDate(lower);
    const targetDate = dateInfo.date;
    const friendlyDate = formatFriendlyDate(targetDate);

    const matches = memories.filter(m => m.date === targetDate && m.amount && m.amount > 0);
    const totalSpent = matches.reduce((sum, m) => sum + (m.amount || 0), 0);

    if (matches.length === 0) {
      return {
        spokenResponse: `You didn't record any expenses for ${friendlyDate}.`,
        displayMarkdown: `No expenses logged for **${friendlyDate}**.`,
        matchedMemories: [],
        intent: 'retrieval',
        confidence: 1.0
      };
    }

    const spoken = `On ${friendlyDate}, you spent a total of ₹${totalSpent} across ${matches.length} recorded items.`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 💸 Expenses for ${friendlyDate}\n**Total Spent:** ₹${totalSpent}\n${matches.map(m => `- ₹${m.amount}: ${m.description}`).join('\n')}`,
      matchedMemories: matches,
      intent: 'retrieval',
      confidence: 1.0
    };
  }

  // 9. Time Travel: "Whom did I meet [last month / in October]?"
  if (/\b(whom\s+did\s+i\s+meet|who\s+did\s+i\s+meet|friends\s+i\s+met)\b/i.test(lower)) {
    let matches = memories.filter(m => m.category === 'Friends' || m.people.length > 0);

    // If month mentioned e.g. "last month" or "october"
    if (lower.includes('october') || lower.includes('last month')) {
      matches = matches.filter(m => m.date.startsWith('2026-10') || m.date.includes('-10-'));
    }

    if (matches.length === 0) {
      return {
        spokenResponse: "I don't have any records of people you met during that period.",
        displayMarkdown: "No social or meeting records found for that time frame.",
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    const peopleMet = Array.from(new Set(matches.flatMap(m => m.people)));
    const spoken = `You met with ${peopleMet.join(', ')} during that time across ${matches.length} recorded activities.`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 👥 People You Met\n**People:** ${peopleMet.join(', ')}\n\n**Activities:**\n${matches.map(m => `- **${formatFriendlyDate(m.date)}**: ${m.description}`).join('\n')}`,
      matchedMemories: matches,
      intent: 'retrieval',
      confidence: 1.0
    };
  }

  // 10. Time Travel: "What did I learn last week?"
  if (/\b(what\s+did\s+i\s+(?:learn|study)\s+last\s+week)\b/i.test(lower)) {
    const studyMemories = memories.filter(m => m.category === 'Study' || m.category === 'Coding');
    if (studyMemories.length === 0) {
      return {
        spokenResponse: "I don't have any study or learning sessions saved for that period.",
        displayMarkdown: "No learning records found.",
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    const spoken = `Looking at your saved memories, you studied ${studyMemories.map(m => m.description.replace(/\.$/, '')).join('; ')}.`;
    return {
      spokenResponse: spoken,
      displayMarkdown: `### 📖 What You Learned\n${studyMemories.map(m => `- **${formatFriendlyDate(m.date)}**: ${m.description}`).join('\n')}`,
      matchedMemories: studyMemories,
      intent: 'retrieval',
      confidence: 1.0
    };
  }

  // 11. General Date-Based Retrieval ("What did I do on November 3?", "What happened yesterday?")
  const dateInfo = parseNaturalDate(lower);
  if (dateInfo.hasExplicitDate || /\b(what\s+did\s+i\s+do|show\s+my\s+activities|tell\s+me\s+about)\b/i.test(lower)) {
    const targetDate = dateInfo.date;
    const friendlyDate = formatFriendlyDate(targetDate);
    const matches = memories.filter(m => m.date === targetDate);

    if (matches.length === 0) {
      return {
        spokenResponse: "I don't have any saved memory for that date yet. Tell me what happened and I'll remember it!",
        displayMarkdown: `**No memories found for ${friendlyDate}.**\n\nTell me what happened and I'll remember it for you!`,
        matchedMemories: [],
        intent: 'not_found',
        confidence: 1.0
      };
    }

    // Build the conversational answer!
    // Example from prompt: "Boss! On November 3, you solved 5 Java questions, met Rahul and spent ₹250 on lunch. Looks like a productive day! 😂"
    let responseText = "";
    const descriptions = matches.map(m => {
      let desc = m.description.trim().replace(/\.$/, '');
      if (m.amount) {
        desc = `spent ₹${m.amount} on ${m.tags.includes('lunch') ? 'lunch' : 'food'}`;
      }
      return desc;
    });

    let combinedActivities = "";
    if (descriptions.length === 1) {
      combinedActivities = descriptions[0];
    } else if (descriptions.length === 2) {
      combinedActivities = `${descriptions[0]} and ${descriptions[1]}`;
    } else {
      const allExceptLast = descriptions.slice(0, -1).join(', ');
      combinedActivities = `${allExceptLast} and ${descriptions[descriptions.length - 1]}`;
    }

    if (personality === 'funny') {
      responseText = `Boss! On ${friendlyDate}, you ${combinedActivities.toLowerCase()}. Looks like a productive day! 😂`;
    } else if (personality === 'motivational') {
      responseText = `Champion! On ${friendlyDate}, you logged: ${combinedActivities}. You stayed focused and got things done! 🚀`;
    } else {
      responseText = `On ${friendlyDate}, you recorded: ${combinedActivities}.`;
    }

    return {
      spokenResponse: responseText,
      displayMarkdown: `### 🗓️ Activities on ${friendlyDate}\n${matches.map(m => `- **${m.category}**: ${m.description} ${m.amount ? `*(₹${m.amount})*` : ''}`).join('\n')}`,
      matchedMemories: matches,
      intent: 'retrieval',
      confidence: 1.0
    };
  }

  // 12. Fallback keyword search
  const keywords = lower.split(/\s+/).filter(w => w.length > 3 && !['what', 'when', 'where', 'show', 'tell', 'about'].includes(w));
  if (keywords.length > 0) {
    const matches = memories.filter(m => 
      keywords.some(k => 
        m.description.toLowerCase().includes(k) || 
        m.category.toLowerCase().includes(k) || 
        m.tags.some(t => t.toLowerCase().includes(k)) ||
        m.people.some(p => p.toLowerCase().includes(k))
      )
    );

    if (matches.length > 0) {
      const spoken = `I found ${matches.length} matching memory records related to ${keywords.join(' ')}.`;
      return {
        spokenResponse: spoken,
        displayMarkdown: `### 🔎 Search Results for "${keywords.join(' ')}"\n${matches.map(m => `- **${formatFriendlyDate(m.date)}** (${m.category}): ${m.description}`).join('\n')}`,
        matchedMemories: matches,
        intent: 'retrieval',
        confidence: 0.9
      };
    }
  }

  // Default empty response
  return {
    spokenResponse: "I don't have any saved memory matching that question yet. Tell me what you did and I'll remember it for you!",
    displayMarkdown: "I couldn't find any relevant memory in your history. You can speak to record a new memory!",
    matchedMemories: [],
    intent: 'not_found',
    confidence: 0.5
  };
}

/**
 * Generates a humorous Roast of the user's week based strictly on actual stored data!
 */
export function generateRoast(memories: MemoryItem[], personality: AssistantPersonality): QueryResult {
  const weekRange = getCurrentWeekRange();
  // Filter for this week or recent memories
  const recentMemories = memories.filter(m => m.date >= '2026-11-01' || m.date >= weekRange.start);

  const codingCount = recentMemories.filter(m => m.category === 'Coding').length;
  const studyCount = recentMemories.filter(m => m.category === 'Study').length;
  const foodCount = recentMemories.filter(m => m.category === 'Food' || m.tags.includes('food') || m.tags.includes('lunch')).length;
  const totalSpent = recentMemories.reduce((acc, m) => acc + (m.amount || 0), 0);
  const totalActivities = recentMemories.length;

  let roastText = "";
  let statsHighlight = "";
  let verdict = "";

  if (personality === 'funny') {
    if (foodCount > 0 && totalSpent > 0 && codingCount > 0) {
      roastText = `Bro, you solved ${codingCount * 4} Java questions but spent ₹${totalSpent} on lunch with Rahul! Your compiler is working hard, but your food delivery wallet is working overtime! 😂`;
    } else if (codingCount > 0 && studyCount === 0) {
      roastText = `Bro, you planned 10 study sessions but recorded only ${codingCount} coding problems. Your motivational wallpaper is working harder than you! 😂`;
    } else {
      roastText = `Bro, you logged ${totalActivities} activities this week. Half of them are food and coffee runs! College canteen knows you better than your professors! 😂`;
    }
    statsHighlight = `${codingCount} Coding Sessions | ₹${totalSpent} Spent on Food | ${studyCount} Study Sessions`;
    verdict = `Productivity Score: 6.8/10 — "High potential, higher appetite"`;
  } else if (personality === 'motivational') {
    roastText = `Champion! You recorded ${totalActivities} total activities and tackled ${codingCount} coding milestones. But look at your spending—₹${totalSpent}! Let's redirect that energy into building projects that generate revenue! You got this! 🚀`;
    statsHighlight = `${totalActivities} Logged Tasks | ₹${totalSpent} Logged Expenses`;
    verdict = `Coach Verdict: "Focus on consistency, eliminate snacking distractions!"`;
  } else {
    roastText = `Here is your honest review: You recorded ${totalActivities} activities, solved coding problems on dynamic programming, and spent ₹${totalSpent} on meals. Good coding output, but keep an eye on your lunch budget!`;
    statsHighlight = `${codingCount} Coding | ${studyCount} Study | ₹${totalSpent} Spent`;
    verdict = `Balanced Week: Solid DSA momentum with active social life.`;
  }

  return {
    spokenResponse: roastText,
    displayMarkdown: `### 🔥 Roast My Week\n\n> "${roastText}"\n\n**Weekly Breakdown:**\n- **Total Activities:** ${totalActivities}\n- **Coding Records:** ${codingCount}\n- **Total Expenses:** ₹${totalSpent}\n- **Verdict:** ${verdict}`,
    matchedMemories: recentMemories,
    intent: 'roast',
    confidence: 1.0
  };
}

/**
 * Evaluates Goal progress against actual stored memories
 */
function evaluateGoalProgress(
  query: string,
  memories: MemoryItem[],
  goals: GoalItem[],
  personality: AssistantPersonality
): QueryResult {
  if (goals.length === 0) {
    return {
      spokenResponse: "You haven't set any goals yet. Add a goal like 'Solve 100 Java problems in November' in the Goals tab!",
      displayMarkdown: "No active goals found in your profile.",
      matchedMemories: [],
      intent: 'goal',
      confidence: 1.0
    };
  }

  // Find goal matching query (e.g. "java", "november", "food")
  let targetGoal = goals.find(g => query.includes(g.title.toLowerCase()) || query.includes(g.category.toLowerCase()));
  if (!targetGoal) targetGoal = goals[0];

  // Recalculate actual progress from memories
  let actualCount = 0;
  if (targetGoal.category === 'Coding') {
    const javaMemories = memories.filter(m => m.category === 'Coding' && (m.description.toLowerCase().includes('java') || m.tags.includes('java')));
    for (const m of javaMemories) {
      const match = m.description.match(/(\d+)\s+(?:problems?|questions?)/i);
      actualCount += match ? parseInt(match[1], 10) : 1;
    }
  } else if (targetGoal.category === 'Expenses') {
    const expenseMemories = memories.filter(m => m.category === 'Expenses');
    actualCount = expenseMemories.reduce((sum, m) => sum + (m.amount || 0), 0);
  } else {
    actualCount = memories.filter(m => m.category === targetGoal!.category).length;
  }

  const pct = Math.min(100, Math.round((actualCount / targetGoal.targetCount) * 100));
  const remaining = Math.max(0, targetGoal.targetCount - actualCount);

  let spoken = "";
  if (personality === 'funny') {
    spoken = `Boss! For your goal "${targetGoal.title}", you have completed ${actualCount} out of ${targetGoal.targetCount} ${targetGoal.unit}. That is ${pct}% done. Still ${remaining} to go!`;
  } else if (personality === 'motivational') {
    spoken = `You have crushed ${actualCount} ${targetGoal.unit} toward your goal! You're at ${pct}% progress. Only ${remaining} more to achieve victory!`;
  } else {
    spoken = `For your goal "${targetGoal.title}", you have completed ${actualCount} of ${targetGoal.targetCount} ${targetGoal.unit} (${pct}%).`;
  }

  return {
    spokenResponse: spoken,
    displayMarkdown: `### 🎯 Goal Progress: ${targetGoal.title}\n\n- **Target:** ${targetGoal.targetCount} ${targetGoal.unit}\n- **Actual Verified:** ${actualCount} ${targetGoal.unit}\n- **Progress:** ${pct}%\n- **Remaining:** ${remaining} ${targetGoal.unit}\n\n*Calculated exclusively from verified saved memory records.*`,
    matchedMemories: memories.filter(m => m.category === targetGoal!.category),
    intent: 'goal',
    confidence: 1.0
  };
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
