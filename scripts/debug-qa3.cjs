// scripts/debug-qa3.cjs
const test = `      {
        id: "q1",
        user: "Sam T.",
        question: "How does this compare to Tom Ford Oud Wood?",
        answer: "Nocturne Noir is significantly smokier and more resinous, with a real oud note vs. the synthetic oud in Oud Wood. They're both excellent but serve different moods.",
        answeredBy: "Perfumeria Concierge",
        date: "2026-07-02",
      }`;

// Find where it breaks
console.log("Try with answeredBy:");
const re1 = /\{\s*id:\s*"([^"]+)",\s*user:\s*"([^"]+)",\s*question:\s*"([\s\S]*?)",\s*answer:\s*"([\s\S]*?)",\s*answeredBy:\s*"([^"]*)"/g;
console.log("match:", test.match(re1));

console.log("\nTry full regex:");
const reFull = /\{\s*id:\s*"([^"]+)",\s*user:\s*"([^"]+)",\s*question:\s*"([\s\S]*?)",\s*answer:\s*"([\s\S]*?)",\s*answeredBy:\s*"([^"]*)",\s*date:\s*"([^"]+)"\s*\}/g;
console.log("match:", test.match(reFull));

console.log("\nTry with date but no trailing \\s*\\}:");
const reNoClose = /\{\s*id:\s*"([^"]+)",\s*user:\s*"([^"]+)",\s*question:\s*"([\s\S]*?)",\s*answer:\s*"([\s\S]*?)",\s*answeredBy:\s*"([^"]*)",\s*date:\s*"([^"]+)"/g;
console.log("match:", test.match(reNoClose));
